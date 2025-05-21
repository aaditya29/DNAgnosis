# Model Explanation

## Basic Pre-requisite of DNA

### Understanding DNA Strings

DNA (Deoxyribonucleic Acid) is the molecule that carries the genetic instructions for life. It is composed of two strands that coil around each other to form a double helix. Each strand is made up of smaller units called nucleotides.

#### Structure of DNA

A DNA string is a sequence of nucleotides, where each nucleotide consists of:

- A sugar molecule (deoxyribose)
- A phosphate group
- A nitrogenous base (Adenine (A), Thymine (T), Cytosine (C), or Guanine (G))

### Prokaryotes and Eukaryotes

#### Prokaryotes

Prokaryotes are unicellular organisms that lack a nucleus and membrane-bound organelles. Their genetic material is found in a single circular DNA molecule located in the cytoplasm. Examples of prokaryotes include bacteria and archaea.

Key characteristics of prokaryotes:

- No nucleus; DNA is free-floating in the cytoplasm.
- Smaller in size (typically 1-10 µm).
- Reproduce asexually through binary fission.
- Lack membrane-bound organelles.

#### Eukaryotes

Eukaryotes are organisms whose cells contain a nucleus and membrane-bound organelles. Their genetic material is enclosed within the nucleus. Examples of eukaryotes include plants, animals, fungi, and protists.

Key characteristics of eukaryotes:

- DNA is enclosed within a nucleus.
- Larger in size (typically 10-100 µm).
- Can reproduce sexually or asexually.
- Contain membrane-bound organelles such as mitochondria, endoplasmic reticulum, and Golgi apparatus.

#### Chromosomes:

DNA is really long, so it is split into 46 parts, that are organized in chromosomes. Most cells contain all 46 chromosomes.

#### Genome

A genome is the complete set of genetic material in an organism. It includes all the DNA sequences, both coding (genes) and non-coding regions. The genome contains the instructions needed for the growth, development, and functioning of an organism.

Key points about genomes:

- In humans, the genome is made up of approximately 3 billion base pairs of DNA.
- The human genome is organized into 23 pairs of chromosomes.
- Genomes vary in size and complexity across different organisms.

#### What are Nucleotides?

Nucleotides are the basic building blocks of DNA and RNA. They are the fundamental units that make up the genetic code.

Each nucleotide consists of three components:

1. **A sugar molecule**: Deoxyribose in DNA and ribose in RNA.
2. **A phosphate group**: Links the sugar molecules together to form the backbone of the DNA or RNA strand.
3. **A nitrogenous base**: Determines the genetic code. The bases in DNA are:
   - Adenine (A)
   - Thymine (T)
   - Cytosine (C)
   - Guanine (G)

Nucleotides are connected by covalent bonds to form a long chain, creating the structure of DNA or RNA. The sequence of these nucleotides encodes genetic information.

- **Base pairs:** DNA is double stranded, and the strands are held together by nucleotides pairing up. A pairs to T, and G pairs to C.<br>

> The reason the model works with single ACGT strings instead of pairs, is that they are always complementary i.e. A always pair to T, G always pair to C.

## About Evo2 Model

Evo 2 is a genomic foundation model capable of generalist prediction and design tasks across DNA, RNA, and proteins. It uses a frontier deep learning architecture to enable modeling of biological sequences at single-nucleotide resolution with near-linear scaling of compute and memory relative to context length. Evo 2 is trained with 40 billion parameters and 1 megabase context length on over 9 trillion nucleotides of diverse eukaryotic and prokaryotic genomes. <br>
**For example:** ATGCATGC -> ATGGCTA

## About the Dataset

### OpenGenome2 Dataset

It is a massive genomic dataset designed specifically for training advanced DNA language models. It contains ~8.8 trillion tokens derived from genomes across all domains of life.<br>
It can be used to train deep learning models that understand the "language" of DNA sequences. These models can learn patterns, structures, and relationships within genomic data that might not be obvious through traditional analysis methods.

### Training Process of Evo2

The training process for Evo2 was divided into two main parts:

#### 1. Pre-training (Limited 8k Context Window)

- **Focus:** This initial phase of training concentrated on learning the fundamental "grammar" of DNA. This includes understanding patterns and relationships within shorter DNA sequences.
- **Context Window:** The model's attention was limited to a context window of 8,000 nucleotides (8k). This means it primarily learned dependencies and patterns within these smaller segments of DNA.
- **Learned Features:** During pre-training, Evo2 learned features present in:
  - Smaller genes
  - Parts of larger genes
- **Pattern Recognition:** Some crucial biological patterns are short enough to be observed and learned within this 8k context window.
- **Analogy:** Think of this like learning the basic rules of a language by reading sentences and short paragraphs.

#### 2. Mid-training (Context Extension to 1M)

- **Focus:** This subsequent phase extended the model's ability to understand much longer-range dependencies and context within DNA sequences.
- **Context Window Expansion:** The context window was significantly increased to 1 million nucleotides (1M). This allowed the model to consider much larger genomic regions at once.
- **Biological Context:** This larger context window is essential for understanding the function and regulation of various biological elements, including:
  - **Bacterial gene:** A segment of DNA that codes for a functional product (usually a protein).
  - **tRNA (transfer RNA):** A type of RNA molecule that helps in protein synthesis.
  - **ncRNA (non-coding RNA):** RNA molecules that have regulatory or other functions but do not code for proteins.
  - **Operon:** A cluster of genes under the control of a single promoter, common in bacteria.
  - **Organelle:** Specialized subunits within a cell (e.g., mitochondria).
  - **Phage (bacteriophage):** A virus that infects bacteria.
  - **Human TAD (Topologically Associating Domain):** Large genomic regions that tend to interact more frequently with each other than with regions outside the TAD.
  - **_M. genitalium_ chromosome:** The entire chromosome of the bacterium _Mycoplasma genitalium_, a relatively small genome.
  - **Yeast chromosome:** A chromosome from a yeast cell, representing a more complex eukaryotic genome.
- **Analogy:** This is like moving from understanding individual sentences to comprehending entire chapters and the overall narrative of a book.

### Biological Concepts Relevant to Model Training

Understanding some basic biological concepts is helpful for appreciating how the Evo2 model learns to predict variant effects.

**Codons:**

- A codon is a sequence of **three nucleotides** in DNA or RNA that specifies a particular amino acid during protein synthesis or signals the termination of the process.
- The image shows a circular representation of the genetic code, illustrating which three-nucleotide codons correspond to which amino acids. For example, `AUG` is typically the start codon (coding for Methionine), and `UAA`, `UAG`, and `UGA` are stop codons.

**Understanding Signals for the Beginning and End of Protein Coding:**

- The start codon (typically AUG) signals where the ribosome should begin translating the mRNA sequence into a protein.
- The stop codons (UAA, UAG, UGA) signal the ribosome to stop protein synthesis.

**Example of Context Importance:**

The example `ATGATGCCGATATG` highlights the significance of the context window:

- **Local Pattern:** The sequence "ATG" is a very small pattern (3 nucleotides, or 1 token in this context).
- **Limited Context:** If the model only considers a very small context window (like 8k in the pre-training focusing on local grammar), it might learn that "ATG" can be a start codon.
- **Larger Context:** However, within a larger context window (like the 1M in mid-training), the model can learn more complex relationships. For instance, it can learn that the presence or absence of other regulatory sequences or the overall gene structure around this "ATG" might determine if it truly functions as a start codon or is just part of a different coding sequence.
- **Analogy:** Consider the word "read." By itself, it has a simple meaning. But in the context of "I will read a book" versus "I read a book yesterday," the meaning and grammatical function change. A larger context is needed to understand the true meaning.

### Implications for Variant Effect Prediction

The two-stage training process of Evo2, starting with local DNA grammar and then expanding to long-range context, is crucial for variant effect prediction:

- **Local Effects:** Mutations within codons can directly change the amino acid sequence of a protein, potentially altering its structure and function. The model's pre-training helps it understand these local relationships.
- **Regulatory Effects:** Mutations outside of coding regions can affect gene expression by altering regulatory elements (e.g., promoters, enhancers). These elements can be located far from the gene they regulate, making the large context window learned during mid-training essential for predicting such effects.
- **Complex Interactions:** The 1M context window allows the model to learn about interactions between different genomic elements and how mutations in one area might influence distant regions.

## Understanding Evo2's Codon Learning and Mutation Analysis

### 1. Checking if Evo2 Has Learned About Codons

There are two primary ways to check if the Evo2 model has learned the concept of codons (three-nucleotide sequences that code for amino acids):

**One Feature is Generation:**

- **Concept:** We can prompt the Evo2 model with a series of preceding nucleotides and observe if it correctly predicts the next nucleotide based on codon structure.
- **Example:** If we input "ATG", which is often a start codon, and the model predicts that the next three nucleotides will likely form another valid codon, it suggests the model has learned the triplet nature of codons. If we provide "ATGC" (four nucleotides) and the model struggles to predict the subsequent nucleotides in a codon-aware way, it might indicate a lack of understanding.
- **Key Idea:** The model's ability to generate sequences that adhere to the three-nucleotide codon structure implies it has learned this fundamental rule of DNA coding.

**Another is Scoring:**

This method involves providing the model with DNA sequences and observing the scores (likely perplexity or likelihood) it assigns to them.

- **Step 1: Put in correct codons and get score (e.g., AGC).**
  - **Explanation:** We input a sequence consisting of valid codons. A model that understands codon structure should assign a relatively high score (or low perplexity) to such a sequence, indicating it's a likely or expected pattern.
- **Step 2: Put in a mutation / error in codon and get score (e.g., ATC).**
  - **Explanation:** We introduce a single nucleotide change within a codon, creating a sequence that might still be a valid codon but could code for a different amino acid or even a stop signal. We observe the score assigned to this mutated sequence. If the model understands the importance of codons, the score might be lower than the correct codon sequence (Step 1).
- **Step 3: Look at the change in score on the heatmap.**
  - **Explanation:** This suggests visualizing the scores for various correct and mutated codon sequences on a heatmap. The heatmap would likely show different intensity levels (colors) corresponding to the scores. Correct codons should ideally have a distinct scoring pattern compared to those with errors.
- **Model Interpretation:** The model should assign lower scores (or higher perplexity) to sequences that are syntactically incorrect with respect to codon structure.
- **Analogy:** If a language model understands English words, it will likely assign a higher probability to "The cat sat" compared to "The cta sat" because the latter has a misspelled word. Similarly, Evo2, if it understands codons, should "recognize" and score valid codon sequences differently from those with single nucleotide errors that disrupt the triplet structure.
- **Confirmation:** This way, we can confirm that Evo2 has picked up on what a codon is. Basically, if a sequence looks like the protein is "spelled incorrectly" (due to mutations disrupting codons), the model should know.

### How to do scoring?

#### Forward

Evo 2 can be used to score the likelihoods across a DNA sequence.

```python
import torch
from evo2 import Evo2

# 1. Load the Evo2 model
evo2_model = Evo2('evo2_7b')

# 2. Define the input DNA sequence
sequence = 'ACGT'

# 3. Tokenize the sequence
input_ids = torch.tensor(
    evo2_model.tokenizer.tokenize(sequence),
    dtype=torch.int,
).unsqueeze(0).to('cuda:0')

# 4. Pass the tokenized input through the model
outputs, _ = evo2_model(input_ids)

# 5. Extract the logits
logits = outputs[0]

# 6. Print the logits and their shape
print('Logits: ', logits)
print('Shape (batch, length, vocab): ', logits.shape)
```

**Step-by-Step Explanation:**

1.  **`import torch`**: This line imports the PyTorch library, which is a fundamental framework for tensor computations and building neural networks in Python.

2.  **`from evo2 import Evo2`**: This line imports the `Evo2` class from the `evo2` library. This class allows you to load and interact with pre-trained Evo2 models.

3.  **`evo2_model = Evo2('evo2_7b')`**:

    - This line creates an instance of the `Evo2` model.
    - `'evo2_7b'` is a string identifier that tells the `Evo2` class which specific pre-trained Evo2 model to load. The `evo2` library likely handles downloading and loading the weights for this 7 billion parameter model.
    - The `evo2_model` object now represents the loaded Evo2 model, ready to process DNA sequences.

4.  **`sequence = 'ACGT'`**:

    - This line defines a string variable `sequence` containing a simple DNA sequence "ACGT". This is the input we want to score. In a real-world application, this would be a longer and potentially mutated DNA sequence.

5.  **`input_ids = torch.tensor(...)`**: This block prepares the input sequence for the Evo2 model:

    - **`evo2_model.tokenizer.tokenize(sequence)`**: The Evo2 model, being a large language model trained on DNA, uses a tokenizer to convert the input DNA sequence (string of characters) into a sequence of numerical tokens (integers) that the model can understand. This tokenizer likely maps each nucleotide (A, C, G, T) to a specific integer ID. The output of this function will be a list of these integer tokens.
    - **`torch.tensor(..., dtype=torch.int)`**: This converts the list of integer tokens into a PyTorch tensor. PyTorch tensors are multi-dimensional arrays that are the fundamental data structure for computations in PyTorch. `dtype=torch.int` specifies that the elements of the tensor should be integers.
    - **`.unsqueeze(0)`**: This adds a batch dimension to the tensor. Most deep learning models, including Evo2, are designed to process inputs in batches. `unsqueeze(0)` adds a dimension of size 1 at the beginning of the tensor, effectively making it a batch of one sequence. The shape of `input_ids` will now be `(1, sequence_length)`, where `sequence_length` is the number of nucleotides in the input sequence.
    - **`.to('cuda:0')`**: This moves the `input_ids` tensor to the first CUDA-enabled GPU. This is done to perform the model inference (passing the input through the model) on the GPU, which is significantly faster for large models like Evo2. If you don't have a GPU, you should change this to `.to('cpu')` to run the computation on your CPU (which will be slower).

6.  **`outputs, _ = evo2_model(input_ids)`**:

    - This is the core line where the input sequence is passed through the Evo2 model for inference.
    - `evo2_model(input_ids)` calls the forward pass of the Evo2 neural network. It takes the tokenized and batched input sequence (`input_ids`) as input.
    - The model returns a tuple. The first element (`outputs`) typically contains the model's output logits (raw, unnormalized scores). The second element (`_`) often contains other information like attention weights or hidden states, which we are ignoring here using the underscore `_`.

7.  **`logits = outputs[0]`**:

    - `outputs` is likely a tuple or a list containing the output for each sequence in the batch. Since we only input one sequence (batch size of 1), we access the logits for that single sequence using `outputs[0]`.
    - `logits` now contains the raw, unnormalized scores predicted by the Evo2 model for each token in the input sequence, predicting the next possible token in the sequence.

8.  **`print('Logits: ', logits)`**: This line prints the `logits` tensor to the console. These values represent the model's confidence in each possible next nucleotide at each position in the input sequence. Higher values indicate higher confidence.

9.  **`print('Shape (batch, length, vocab): ', logits.shape)`**: This line prints the shape of the `logits` tensor. The shape will typically be `(batch_size, sequence_length, vocabulary_size)`.

    - `batch_size`: In this case, it's 1 because we processed one sequence.
    - `sequence_length`: This is the number of tokens in the input sequence (4 in our example: A, C, G, T).
    - `vocabulary_size`: This is the total number of possible tokens that the Evo2 model can predict. For a DNA model, the vocabulary would likely include the four nucleotides (A, C, G, T) and possibly some special tokens (like start/end of sequence tokens). The `logits` tensor at index `[0, i, j]` will contain the score for the $j^{th}$ token in the vocabulary being the next token after the $i^{th}$ token in the input sequence.

**What the Code Does for Scoring Likelihoods:**

This code doesn't directly output probabilities or likelihoods in a normalized way (like between 0 and 1). Instead, it outputs **logits**. Logits are the raw, unnormalized scores from the model's final layer.

To get probabilities (which represent the likelihood of each possible next nucleotide), you would typically apply a **softmax function** along the last dimension (the vocabulary dimension) of the `logits` tensor. The softmax function converts these raw scores into a probability distribution where the values sum up to 1.
