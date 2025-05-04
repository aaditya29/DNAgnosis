# DNAgnosis- AI Application for Genome Modeling and Design Across All Domains of Life With Evo 2

This project is a full-stack web application that predicts the pathogenicity of single nucleotide variants (SNVs) in human DNA using the Evo2 large language model (LLM) and classifies how likely specific mutations in DNA are to cause diseases (variant effect prediction)

---

## Project Goals

- Enable users to explore human genes (e.g., BRCA1), view the reference genome, and analyze variants.
- Allow users to input or select mutations and receive AI-powered pathogenicity predictions.
- Compare Evo2 predictions against existing clinical annotations (e.g., from ClinVar).
- Provide an intuitive and responsive web UI with modern frontend technologies.
- Run heavy inference on-demand using serverless GPU backends.

---

## Key Features

- AI-Powered Prediction: Uses the Evo2 LLM to assess whether a mutation is likely pathogenic or benign.
- Genome Explorer: Search and browse genes, chromosomes, and variants.
- Mutation Comparison: Visual comparison of AI predictions vs known clinical labels.
- Fast, Scalable Backend: Python + FastAPI running on H100 GPU via Modal.
- Modern Frontend: Built with Next.js 15, React, TypeScript, Tailwind CSS, and Shadcn UI.

---

## Tech Stack

### AI & Backend

- Evo2 Model (LLM for genomics)
- Python
- FastAPI (REST API framework)
- Modal (serverless GPU deployment)
- Pydantic / Zod for type validation

### Frontend

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS for styling
- Shadcn UI for components
- T3 Stack (modular, type-safe full-stack setup)

---

## Reference Model

Following is the paper behind the model:

- [Paper](https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1)
- [GitHub Repository](https://github.com/ArcInstitute/evo2)

---

## Example Use Case

> A researcher wants to evaluate whether the mutation c.68_69delAG in the BRCA1 gene is likely pathogenic. They search BRCA1, select the region, and input the variant. The web app returns Evo2's prediction and shows that ClinVar also labels it as pathogenic.
