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

### Training of the Evo2
