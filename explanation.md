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
