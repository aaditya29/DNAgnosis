import sys
import modal

evo2_image = (
    modal.Image.from_registry(
        # Using official CUDA image with Python 3.12
        "nvidia/cuda:12.4.0-devel-ubuntu22.04",
        add_python="3.12"
    )
    .apt_install([
        "build-essential",
        "cmake",
        "ninja-build",
        "libcudnn8",
        "libcudnn8-dev",
        "git",
        "gcc",
        "g++"
    ])
    # Install build dependencies first
    .pip_install("wheel", "setuptools")
    .pip_install("packaging")  # Install packaging separately before flash-attn
    .env({
        "CC": "/usr/bin/gcc",
        "CXX": "/usr/bin/g++",
        "CUDA_HOME": "/usr/local/cuda",
    })
    # Install PyTorch 2.5.1 (2.6+ has stricter weight loading)
    .pip_install(
        "torch==2.5.1",
        "torchvision",
        "torchaudio"
    )
    # Install flash-attn
    .pip_install("ninja")  # Required for flash-attn compilation
    .run_commands(
        "pip install flash-attn --no-build-isolation"
    )
    # Clone and install evo2
    .run_commands(
        "git clone --recurse-submodules https://github.com/ArcInstitute/evo2.git",
        "cd evo2 && pip install ."
    )
    # Uninstall any existing versions of transformer_engine
    .run_commands("pip uninstall -y transformer-engine transformer_engine || true")
    # Install transformer_engine with proper dependencies
    .run_commands(
        "pip install 'transformer_engine[pytorch]==1.13' --no-build-isolation || echo 'transformer_engine installation skipped'"
    )
    .pip_install_from_requirements("requirements.txt")
    .pip_install("fastapi[standard]")  # for API endpoint
)

# building variant analysis app with evo2 image
app = modal.App("variant-analysis-evo2", image=evo2_image)

# creating a volume for huggingface cache
volume = modal.Volume.from_name("hf_cache", create_if_missing=True)
mount_path = "/root/.cache/huggingface"  # path to mount the volume


# 20 minutes timeout
@app.function(gpu="H100", volumes={mount_path: volume}, timeout=1000)
def run_brca1_analysis():
    import os
    import gzip
    import base64
    import numpy as np
    import pandas as pd
    import seaborn as sns
    from evo2 import Evo2
    from Bio import SeqIO
    from io import BytesIO
    import matplotlib.pyplot as plt
    from sklearn.metrics import roc_auc_score, roc_curve

    WINDOW_SIZE = 8192  # size of sequence window around SNV

    print("LOADING EVO2 MODEL!!")
    model = Evo2('evo2_7b')  # load the 7B parameter model
    print("Evo2 model loaded.")

    brca1_df = pd.read_excel(
        '/evo2/notebooks/brca1/41586_2018_461_MOESM3_ESM.xlsx',
        header=2,
    )
    brca1_df = brca1_df[[
        'chromosome', 'position (hg19)', 'reference', 'alt', 'function.score.mean', 'func.class',
    ]]  # selecting relevant columns and path to the excel file

    brca1_df.rename(columns={
        'chromosome': 'chrom',
        'position (hg19)': 'pos',
        'reference': 'ref',
        'alt': 'alt',
        'function.score.mean': 'score',
        'func.class': 'class',
    }, inplace=True)  # renaming columns for easier access

    # Converting to two-class system
    brca1_df['class'] = brca1_df['class'].replace(['FUNC', 'INT'], 'FUNC/INT')

    with gzip.open('/evo2/notebooks/brca1/GRCh37.p13_chr17.fna.gz', "rt") as handle:
        for record in SeqIO.parse(handle, "fasta"):  # parsing the fasta file
            seq_chr17 = str(record.seq)  # getting the sequence as a string
            break

    # Building mappings of unique reference sequences
    ref_seqs = []
    ref_seq_to_index = {}  # mapping of reference sequence to its index in ref_seqs

    # parsing sequences and store indexes
    ref_seq_indexes = []
    var_seqs = []

    # taking a subset for quicker testing
    brca1_subset = brca1_df.iloc[:500].copy()

    for _, row in brca1_subset.iterrows():
        p = row["pos"] - 1  # cconvert to 0-indexed position
        full_seq = seq_chr17  # full chromosome 17 sequence

        # start index of reference sequence window
        ref_seq_start = max(0, p - WINDOW_SIZE//2)
        # end index of reference sequence window
        ref_seq_end = min(len(full_seq), p + WINDOW_SIZE//2)
        # reference sequence window
        ref_seq = seq_chr17[ref_seq_start:ref_seq_end]
        # position of SNV in reference sequence window
        snv_pos_in_ref = min(WINDOW_SIZE//2, p)
        var_seq = ref_seq[:snv_pos_in_ref] + \
            row["alt"] + ref_seq[snv_pos_in_ref+1:]  # variant sequence window

        # Get or create index for reference sequence
        if ref_seq not in ref_seq_to_index:
            ref_seq_to_index[ref_seq] = len(ref_seqs)  # assign new index
            # add to list of unique reference sequences
            ref_seqs.append(ref_seq)

        # store index of reference sequence for this variant
        ref_seq_indexes.append(ref_seq_to_index[ref_seq])
        var_seqs.append(var_seq)  # add variant sequence to list

    # convert to numpy array for easier indexing
    ref_seq_indexes = np.array(ref_seq_indexes)

    print(
        f'Scoring likelihoods of {len(ref_seqs)} reference sequences with Evo 2...')
    ref_scores = model.score_sequences(ref_seqs)

    print(
        f'Scoring likelihoods of {len(var_seqs)} variant sequences with Evo 2...')
    var_scores = model.score_sequences(var_seqs)

    # Subtract score of corresponding reference sequences from scores of variant sequences
    delta_scores = np.array(var_scores) - np.array(ref_scores)[ref_seq_indexes]

    # Add delta scores to dataframe
    brca1_subset[f'evo2_delta_score'] = delta_scores

    y_true = (brca1_subset['class'] == 'LOF')
    auroc = roc_auc_score(y_true, -brca1_subset['evo2_delta_score'])
    # calculating threshold start
    y_true = (brca1_subset["class"] == "LOF")  # binary labels for LOF class
    # negating scores for correct direction
    fpr, tpr, thresholds = roc_curve(y_true, -brca1_subset["evo2_delta_score"])
    optimal_idx = (tpr - fpr).argmax()  # Youden's J statistic
    # negating back to original scale
    optimal_threshold = -thresholds[optimal_idx]
    lof_scores = brca1_subset.loc[brca1_subset["class"]
                                  == "LOF", "evo2_delta_score"]  # getting scores for LOF class i.e. Loss of Function
    func_scores = brca1_subset.loc[brca1_subset["class"]
                                   == "FUNC/INT", "evo2_delta_score"]  # getting scores for FUNC/INT class
    lof_std = lof_scores.std()  # standard deviation of LOF scores
    func_std = func_scores.std()  # standard deviation of FUNC/INT scores
    confidence_params = {
        "threshold": optimal_threshold,
        "lof_std": lof_std,
        "func_std": func_std
    }  # parameters for confidence calculation
    print("Confidence params:", confidence_params)
    # calculating threshold end

    plt.figure(figsize=(4, 2))
    # Plot stripplot of distributions
    p = sns.stripplot(
        data=brca1_subset,
        x='evo2_delta_score',
        y='class',
        hue='class',
        order=['FUNC/INT', 'LOF'],
        palette=['#777777', 'C3'],
        size=2,
        jitter=0.3,
    )

    # Mark medians from each distribution
    sns.boxplot(showmeans=True,
                meanline=True,
                meanprops={'visible': False},
                medianprops={'color': 'k', 'ls': '-', 'lw': 2},
                whiskerprops={'visible': False},
                zorder=10,
                x="evo2_delta_score",
                y="class",
                data=brca1_subset,
                showfliers=False,
                showbox=False,
                showcaps=False,
                ax=p)
    plt.xlabel('Delta likelihood score, Evo 2')
    plt.ylabel('BRCA1 SNV class')
    plt.tight_layout()

    buffer = BytesIO()  # create a bytes buffer for the plot
    plt.savefig(buffer, format="png")  # save the plot to the buffer
    buffer.seek(0)  # rewind the buffer to the beginning
    plot_data = base64.b64encode(buffer.getvalue()).decode(
        "utf-8")  # encode plot to base64 string

    # return results as dictionary
    return {'variants': brca1_subset.to_dict(orient="records"), "plot": plot_data, "auroc": auroc}


@app.function()  # configure app function
def brca1_example():

    import base64
    from io import BytesIO
    import matplotlib.pyplot as plt
    import matplotlib.image as mpimg

    print("Running BRCA1 variant analysis with Evo2!!!")
    # Running inference
    result = run_brca1_analysis.remote()

    if "plot" in result:
        plot_data = base64.b64decode(result["plot"])
        with open("brca1_analysis_plot.png", "wb") as f:
            f.write(plot_data)

        img = mpimg.imread(BytesIO(plot_data))
        plt.figure(figsize=(10, 5))
        plt.imshow(img)
        plt.axis("off")
        plt.show()


# function to fetch genome sequence from UCSC API
def get_genome_sequence(position, genome: str, chromosome: str, window_size=8192):
    import requests  # for making HTTP requests

    half_window = window_size // 2  # half window size
    start = max(0, position - 1 - half_window)  # start coordinate (0-indexed)
    # end coordinate (0-indexed, exclusive)
    end = position - 1 + half_window + 1

    print(
        f"Fetching {window_size}bp window size around position {position} from UCSC API!")
    print(f"Coordinates: {chromosome}:{start}-{end} ({genome})")

    api_url = f"https://api.genome.ucsc.edu/getData/sequence?genome={genome};chrom={chromosome};start={start};end={end}"
    response = requests.get(api_url)  # making GET request to UCSC API

    if response.status_code != 200:
        raise Exception(
            f"Failed to load genome sequence from UCSC API: {response.status_code}")

    genome_data = response.json()  # parsing JSON response

    if "dna" not in genome_data:
        error = genome_data.get("error", "Unknown error")
        raise Exception(f"UCSC API errpr: {error}")

    # getting DNA sequence and converting to uppercase
    sequence = genome_data.get("dna", "").upper()
    expected_length = end - start  # expected length of the sequence
    if len(sequence) != expected_length:
        print(
            f"Warning: received sequence length ({len(sequence)}) differs from expected length of ({expected_length})")

    print(
        f"Loaded reference genome sequence window (length: {len(sequence)} bases)")

    return sequence, start


def analyze_variant(relative_pos_in_window, reference, alternative, window_seq, model):
    var_seq = window_seq[:relative_pos_in_window] + alternative + \
        window_seq[relative_pos_in_window+1:]  # creating variant sequence
    ref_score = model.score_sequences(
        [window_seq])[0]  # scoring reference sequence
    var_score = model.score_sequences([var_seq])[0]  # scoring variant sequence
    delta_score = var_score - ref_score  # calculating delta score for the variant
    """calculating threshold for confidence estimation
    during inference we want an output that is either "Likely Benign", "Uncertain" or "Likely Pathogenic.
    A numerical score won't be able to tell us that directly, so we set a threshold based on the training data.
    We will define a threshold such that:
    - if score is above the threshold then it is pathogenic otherwise benign
    - if the numer is too low then too many variants will be classified as benign
    - if the number is too high then too many variants will be classified as pathogenic when they are not.
    For defining that number we can use the BRCA1 dataset and find a threshold that maximizes the separation
    We use ROC Curve to find the optimal threshold. We want to find delta score number which best distinguishes between benign and pathogenic variants.
    We find youden's J statistic to find the optimal threshold that maximizes the difference between true positive rate and false positive rate.
    """
    threshold = -0.0009178519  # optimal threshold calculated from BRCA1 dataset
    # standard deviation of delta scores for LOF class from BRCA1 dataset
    lof_std = 0.0015140239
    # standard deviation of delta scores for FUNC/INT class from BRCA1 dataset
    func_std = 0.0009016589

    if delta_score < threshold:
        prediction = "likely pathogeni.c"
        confidence = min(1.0, abs(delta_score - threshold) /
                         lof_std)  # confidence calculation
    else:
        prediction = "likely benign."
        confidence = min(1.0, abs(delta_score - threshold) /
                         func_std)  # confidence calculation

    return {
        "reference": reference,
        "alternative": alternative,
        "delta_score": float(delta_score),
        "prediction": prediction,
        "classification_confidence": float(confidence)
    }


# configuring class for GPU usage
@app.cls(gpu="H100", volumes={mount_path: volume}, max_containers=3, retries=2, scaledown_window=120)
class Evo2Model:
    @modal.enter()
    def load_evo2_model(self):
        from evo2 import Evo2
        print("Loading Evo2 model!!!")
        self.model = Evo2('evo2_7b')  # loading the 7B parameter model
        print("Evo2 model loaded.")

    # @modal.method()  # method to score sequences
    @modal.fastapi_endpoint(method="POST")  # endpoint="/analyze_variant"
    def analyze_single_variant(self, variant_position: int, alternative: str, genome: str, chromosome: str):
        print("Analyzing single variant with Evo2 model!!!")
        print("Genome:", genome)
        print("Chromosome:", chromosome)
        print("Variant position:", variant_position)
        print("Alternative variant allele:", alternative)

        WINDOW_SIZE = 8192  # size of sequence window around SNV
        window_seq, seq_start = get_genome_sequence(
            position=variant_position, genome=genome, chromosome=chromosome, window_size=WINDOW_SIZE)
        print(f"Fetched genome sequence window first 100: {window_seq[:100]}")

        relative_pos = variant_position - 1 - seq_start
        print(f"Relative position within window: {relative_pos}")

        if relative_pos < 0 or relative_pos >= len(window_seq):
            raise ValueError(
                f"Variant position {variant_position} is outside the fetched window (start={seq_start+1}, end={seq_start+len(window_seq)})")
        reference = window_seq[relative_pos]
        print("Reference is: " + reference)
        # analyzing single variant
        result = analyze_variant(
            relative_pos_in_window=relative_pos,
            reference=reference,
            alternative=alternative,
            window_seq=window_seq,
            model=self.model
        )
        result["position"] = variant_position  # adding position to result
        return result


@app.local_entrypoint()
def main():
    evo2Model = Evo2Model()
    result = evo2Model.analyze_single_variant.remote(
        variant_position=43119628, alternative='G', genome='hg38', chromosome='chr17')
    print("Single variant analysis result:", result)
