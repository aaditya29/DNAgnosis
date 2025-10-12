import sys
import modal

evo2_image = (
    modal.Image.from_registry(
        # Use official CUDA image with Python 3.12
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
    # Install wheel and setuptools first for building packages
    .pip_install("wheel", "setuptools")
    .env({
        "CC": "/usr/bin/gcc",
        "CXX": "/usr/bin/g++",
        "CUDA_HOME": "/usr/local/cuda",
    })
    # Clone and install evo2
    .run_commands(
        "git clone --recurse-submodules https://github.com/ArcInstitute/evo2.git",
        "cd evo2 && pip install ."
    )
    # Uninstall any existing versions of transformer_engine
    .run_commands("pip uninstall -y transformer-engine transformer_engine || true")
    # Install transformer_engine with proper dependencies
    .pip_install("packaging")  # Required dependency
    .run_commands(
        "pip install wheel setuptools",
        "pip install 'transformer_engine[pytorch]==1.13' --no-build-isolation"
    )
    .pip_install_from_requirements("requirements.txt")
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

    # Calculate threshold START
    y_true = (brca1_subset["class"] == "LOF")

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

    # Calculate threshold END

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

    buffer = BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {'variants': brca1_subset.to_dict(orient="records"), "plot": plot_data, "auroc": auroc}


@app.local_entrypoint()
def main():
    run_brca1_analysis.local()
