# DNAgnosis - Complete Project Documentation

> **AI-Powered Genomic Analysis and Variant Effect Prediction Platform**

A comprehensive guide for understanding, navigating, and contributing to the DNAgnosis project - from absolute beginners to advanced contributors.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Complete File Structure & Descriptions](#4-complete-file-structure--descriptions)
5. [How the Project Works](#5-how-the-project-works)
6. [Data Flow & User Journey](#6-data-flow--user-journey)
7. [System Design & Constraints](#7-system-design--constraints)
8. [Development Setup Guide](#8-development-setup-guide)
9. [Contributing Guide for Beginners](#9-contributing-guide-for-beginners)
10. [Project Roadmap](#10-project-roadmap)
11. [API Reference](#11-api-reference)
12. [Troubleshooting](#12-troubleshooting)
13. [Additional Resources](#13-additional-resources)

---

## 1. Project Overview

### What is DNAgnosis?

**DNAgnosis** is a full-stack web application that uses artificial intelligence to predict the pathogenicity of genetic mutations in human DNA. It leverages the **Evo2 large language model** (7 billion parameters) to analyze single nucleotide variants (SNVs) and determine whether they are likely to cause disease.

### Key Capabilities

- **Gene Exploration**: Search and browse human genes across different chromosomes
- **Variant Analysis**: Input genetic mutations and receive AI-powered pathogenicity predictions
- **Clinical Comparison**: Compare Evo2 predictions against existing clinical annotations from ClinVar
- **Interactive Visualization**: View DNA sequences with color-coded nucleotides and position navigation
- **Real-time Processing**: On-demand GPU-accelerated inference via serverless architecture

### Real-World Use Case

> A researcher wants to evaluate whether a specific mutation in the BRCA1 gene (associated with breast cancer) is likely pathogenic. They:
> 1. Search for "BRCA1" in DNAgnosis
> 2. Navigate to the mutation position
> 3. Input the alternative nucleotide
> 4. Receive an AI prediction with confidence score
> 5. Compare results with known ClinVar annotations

### Project Goals

1. **Enable Researchers**: Provide an intuitive interface for exploring human genes and analyzing variants
2. **AI-Powered Predictions**: Use state-of-the-art genomic language models for pathogenicity assessment
3. **Clinical Validation**: Compare AI predictions against established clinical databases
4. **Modern Architecture**: Utilize serverless GPU infrastructure for cost-effective, scalable inference
5. **Open Source**: Make genomic AI tools accessible to the research community

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Web Browser)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              FRONTEND (Next.js + React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ page.tsx - Main Interface                            │  │
│  │ - Gene search/browse                                 │  │
│  │ - Genome assembly selection (hg38, hg19)             │  │
│  │ - Chromosome browsing                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ GeneViewer - Gene Detail View                        │  │
│  │ - Gene information & metadata                        │  │
│  │ - Sequence viewer with position slider               │  │
│  │ - Variant analysis input                             │  │
│  │ - Known variants display (ClinVar)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ VariantAnalysis - Analysis Interface                 │  │
│  │ - Position & alternative nucleotide input            │  │
│  │ - API calls to backend                               │  │
│  │ - Results display with confidence scores             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ genome-api.ts - API Service Layer                    │  │
│  │ - UCSC, NCBI, ClinVar API integration               │  │
│  │ - Type-safe data fetching                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────┐
│            BACKEND (FastAPI on Modal)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Evo2Model Class (@app.cls)                           │  │
│  │ - H100 GPU-accelerated inference                     │  │
│  │ - Sequence likelihood scoring                        │  │
│  │ - Variant effect prediction                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ analyze_single_variant() FastAPI Endpoint            │  │
│  │ Input: position, alt allele, genome, chromosome      │  │
│  │ Output: delta_score, prediction, confidence          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Evo2 Model (7B parameters)                           │  │
│  │ - Trained on 9T+ nucleotides across species          │  │
│  │ - 1M base pair context window                        │  │
│  │ - Zero-shot variant effect prediction                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│          EXTERNAL DATA SOURCES                               │
│  - UCSC Genome Browser API (Reference genomes)              │
│  - NCBI Gene Database (Gene information)                    │
│  - ClinVar Database (Clinical variant annotations)          │
│  - HuggingFace (Model weights via Modal volume)             │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

#### 1. **Presentation Layer** (Frontend)
- **Framework**: Next.js 15 with React 19
- **Routing**: App Router (page-based routing)
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: React Hooks (useState, useEffect)
- **Type Safety**: TypeScript with strict mode

#### 2. **API Service Layer**
- **Location**: `/frontend/src/utils/genome-api.ts`
- **Purpose**: Centralized API integration
- **Features**:
  - Type-safe data fetching
  - Error handling
  - Integration with UCSC, NCBI, ClinVar APIs
  - Backend communication for variant analysis

#### 3. **Backend Processing Layer**
- **Framework**: FastAPI (Python)
- **Deployment**: Modal (serverless GPU platform)
- **GPU**: NVIDIA H100 (141GB memory)
- **Model**: Evo2 7B parameter genomic foundation model
- **Features**:
  - Sequence likelihood scoring
  - Variant effect prediction
  - Auto-scaling (0-3 containers)

#### 4. **Data Layer**
- **UCSC Genome Browser**: Reference genome sequences
- **NCBI Gene Database**: Gene metadata and search
- **ClinVar**: Clinical variant annotations
- **HuggingFace**: Model weight storage

---

## 3. Technology Stack

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 15.2.3 | React framework with SSR/SSG |
| UI Library | React | 19.0.0 | Component-based UI |
| Language | TypeScript | 5.8.2 | Type-safe JavaScript |
| Styling | Tailwind CSS | 4.0.15 | Utility-first CSS framework |
| Components | Shadcn UI | Latest | Pre-built accessible components |
| State | React Hooks | Native | State management |
| Validation | Zod | 3.24.2 | Schema validation |
| Icons | Lucide React | 0.553.0 | Icon library |
| Linting | ESLint | 9.23.0 | Code quality |
| Formatting | Prettier | 3.5.3 | Code formatting |

### Backend Technologies

| Category | Technology | Purpose |
|----------|-----------|---------|
| Language | Python | 3.12 |
| Framework | FastAPI | REST API server |
| Model | Evo2 (7B params) | Genomic foundation model |
| GPU Platform | Modal | Serverless GPU deployment |
| ML Framework | PyTorch | 2.5.1 |
| Optimization | Flash-Attention | Efficient GPU kernels |
| Data Processing | Pandas, NumPy | Data manipulation |
| Visualization | Matplotlib, Seaborn | Plot generation |
| Bioinformatics | BioPython | Sequence parsing |
| GPU | NVIDIA H100 | 141GB memory |

### External APIs

1. **UCSC Genome Browser API**
   - URL: `https://api.genome.ucsc.edu`
   - Purpose: Reference genome sequences and assemblies

2. **NCBI Gene API**
   - URL: `https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3`
   - Purpose: Gene search and information

3. **NCBI E-utilities**
   - URL: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils`
   - Purpose: Detailed gene metadata

4. **ClinVar API**
   - URL: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils` (esearch/esummary)
   - Purpose: Clinical variant annotations

### Development Tools

- **Package Manager**: npm 10.9.2
- **Version Control**: Git
- **Container Platform**: Modal (automatic Docker)
- **CUDA**: 12.4.0
- **GPU Environment**: Ubuntu 22.04

---

## 4. Complete File Structure & Descriptions

### Project Root Structure

```
/DNAgnosis/
├── backend/              # Python FastAPI backend
├── frontend/             # Next.js web application
├── roadmap/              # Documentation files
├── readme.md             # Project overview
└── .gitignore            # Git ignore rules
```

### Backend Directory (`/backend/`)

```
backend/
├── main.py                    # Core ML inference code (380 lines)
├── requirements.txt           # Python dependencies
└── brca1_analysis_plot.png   # Generated analysis visualization
```

#### `backend/main.py`

**Purpose**: Serverless GPU-based variant effect prediction using Evo2 model

**Key Components**:

```python
# 1. Docker Image Definition
evo2_image = modal.Image.from_registry(
    "nvidia/cuda:12.4.0-devel-ubuntu22.04",
    add_python="3.12"
)
# Installs: CUDA, PyTorch, Flash-Attention, Evo2

# 2. Modal App Definition
app = modal.App("variant-analysis-evo2", image=evo2_image)

# 3. Persistent Volume for Model Weights
volume = modal.Volume.from_name("hf_cache", create_if_missing=True)

# 4. Main Analysis Class
@app.cls(gpu="H100", volumes={mount_path: volume}, timeout=1000)
class Evo2Model:
    @modal.enter()
    def load_evo2_model(self):
        # Loads 7B parameter model on GPU

    @modal.fastapi_endpoint()
    def analyze_single_variant(self, variant_position, alternative, genome, chromosome):
        # Returns: delta_score, prediction, confidence
```

**Functions**:

1. **`load_evo2_model()`**
   - Loads Evo2 7B model into GPU memory
   - Called once when container starts
   - Returns: Loaded model instance

2. **`analyze_single_variant()`** (FastAPI endpoint)
   - Input: Position, alternative nucleotide, genome assembly, chromosome
   - Fetches genome sequence via UCSC API
   - Scores reference and variant sequences
   - Calculates delta likelihood score
   - Returns: Prediction classification and confidence

3. **`get_genome_sequence()`**
   - Fetches DNA sequence from UCSC API
   - Window size: 8192 bp (±4096 around position)
   - Returns: Sequence string and start position

4. **`analyze_variant()`**
   - Extracts reference nucleotide
   - Creates variant sequence
   - Scores both with Evo2
   - Applies threshold for pathogenicity
   - Returns: Delta score, prediction, confidence

5. **`run_brca1_analysis()`** (Example function)
   - Batch analysis of BRCA1 variants
   - Generates ROC curves and AUROC metrics
   - Demonstrates model capabilities

**Configuration**:
- GPU: H100 (high-memory)
- Timeout: 1000 seconds (16.6 minutes)
- Max containers: 3 (concurrent scaling)
- Volume mount: `~/.cache/huggingface`

#### `backend/requirements.txt`

```
pandas          # Data manipulation and analysis
seaborn         # Statistical data visualization
scikit-learn    # Machine learning metrics (ROC, AUROC)
openpyxl        # Excel file reading (BRCA1 dataset)
modal           # Serverless GPU platform SDK
matplotlib      # Plot generation
```

---

### Frontend Directory (`/frontend/`)

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Home page (360+ lines)
│   │   ├── layout.tsx            # Root layout
│   │   └── favicon.ico           # Site icon
│   ├── components/               # React components
│   │   ├── ui/                   # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── select.tsx
│   │   ├── geneviewer.tsx        # Gene detail view (270+ lines)
│   │   ├── variant-analysis.tsx  # Variant input/results (375+ lines)
│   │   ├── variant-comparison-modal.tsx
│   │   ├── known-variants.tsx    # ClinVar variant display
│   │   ├── gene-information.tsx  # Gene metadata display
│   │   └── gene-sequence.tsx     # DNA sequence viewer
│   ├── utils/
│   │   ├── genome-api.ts         # API service layer (385+ lines)
│   │   └── coloring-utils.ts     # UI color utilities
│   ├── lib/
│   │   └── utils.ts              # Helper functions
│   ├── styles/
│   │   └── globals.css           # Global styling
│   └── env.js                    # Environment variable schema
├── public/                       # Static assets
├── package.json                  # NPM dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── eslint.config.js              # ESLint config
├── prettier.config.js            # Prettier config
└── components.json               # Shadcn config
```

#### Core Application Files

##### `src/app/page.tsx` - Home Page (360+ lines)

**Purpose**: Main user interface for gene search and variant analysis

**State Management**:
```typescript
const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([])
const [chromosomes, setChromosomes] = useState<ChromosomeFromSearch[]>([])
const [searchQuery, setSearchQuery] = useState<string>("")
const [searchResults, setSearchResults] = useState<GeneFromSearch[]>([])
const [selectedGene, setSelectedGene] = useState<GeneFromSearch | null>(null)
const [mode, setMode] = useState<"search" | "browse">("search")
```

**Sections**:
1. **Header**: DNAgnosis branding with DNA icon
2. **Genome Assembly Card**: Dropdown to select reference genome (hg38, hg19, etc.)
3. **Browse Card with Tabs**:
   - Search Tab: Gene search input with example link
   - Browse Tab: Chromosome button grid (chr1-chrY)
4. **Results Table**: Displays matching genes with symbol, name, location

**Lifecycle**:
- On mount: Fetch available genomes
- Genome change: Fetch chromosomes
- Search: Fetch genes matching query
- Browse: Fetch genes on selected chromosome
- Gene selection: Switch to GeneViewer component

##### `src/components/geneviewer.tsx` - Gene Detail View (270+ lines)

**Purpose**: Detailed gene analysis interface with sequences and variants

**State**:
```typescript
const [geneSequence, setGeneSequence] = useState<string>("")
const [geneDetail, setGeneDetail] = useState<GeneDetailsFromSearch | null>(null)
const [geneBounds, setGeneBounds] = useState<GeneBounds | null>(null)
const [clinvarVariants, setClinvarVariants] = useState<ClinvarVariant[]>([])
```

**Child Components**:
1. **VariantAnalysis**: Variant input and AI prediction display
2. **GeneSequence**: DNA sequence viewer with position slider
3. **GeneInformation**: Gene metadata (symbol, description, location)
4. **KnownVariants**: ClinVar variant list with analysis buttons
5. **VariantComparisonModal**: Side-by-side Evo2 vs ClinVar comparison

**Features**:
- Auto-fetches gene details on mount
- Loads ClinVar variants when gene bounds available
- Click sequence nucleotide to populate variant input
- Compare AI predictions with clinical annotations

##### `src/components/variant-analysis.tsx` - Variant Analysis (375+ lines)

**Purpose**: Variant input interface and result display

**Input Fields**:
- Position (genomic coordinate)
- Alternative nucleotide (A/T/G/C)
- Reference (auto-detected from sequence)

**Features**:
1. **Known Variant Detection**: Regex match against ClinVar variants
2. **Analysis Execution**: Validates inputs and calls backend API
3. **Result Display**:
   - Variant notation (e.g., "BRCA1 43119628 A>G")
   - Delta likelihood score
   - Prediction (Likely Pathogenic / Likely Benign)
   - Confidence score (0-1 as progress bar)

**Color Coding**:
- Nucleotides: A=red, T=blue, G=green, C=amber
- Classifications: Pathogenic=red, Benign=green, Uncertain=yellow

##### `src/utils/genome-api.ts` - API Service Layer (385+ lines)

**Purpose**: Type-safe API integration with external genome databases

**Type Definitions**:
```typescript
interface GenomeAssemblyFromSearch {
  genome: string
  organism: string
  description: string
}

interface GeneFromSearch {
  symbol: string
  name: string
  chrom: string
  description: string
  gene_id?: string
}

interface AnalysisResult {
  position: number
  reference: string
  alternative: string
  delta_score: number
  prediction: string
  classification_confidence: number
}
```

**API Functions**:

1. **`getAvailableGenomes()`**
   - Endpoint: UCSC `/list/ucscGenomes`
   - Returns: Human genome assemblies
   - Filters: Only human genomes

2. **`getGenomeChromosomes(genomeId)`**
   - Endpoint: UCSC `/list/chromosomes`
   - Returns: Sorted chromosome list
   - Filters: Removes alternate/random contigs

3. **`searchGenes(query, genome)`**
   - Endpoint: NCBI `/api/ncbi_genes/v3/search`
   - Returns: Top 10 matching genes
   - Fields: Symbol, name, chromosome, location

4. **`fetchGeneDetails(geneId)`**
   - Endpoint: NCBI `/entrez/eutils/esummary`
   - Returns: Gene bounds, organism, summary
   - Handles: Missing genomic info gracefully

5. **`fetchGeneSequence(chrom, start, end, genomeId)`**
   - Endpoint: UCSC `/getData/sequence`
   - Returns: DNA sequence + actual range
   - Converts: 1-based to 0-based coordinates

6. **`fetchClinvarVariants(chrom, geneBounds, genomeId)`**
   - Two-step: esearch (find IDs) + esummary (get details)
   - Returns: ClinvarVariant array
   - Handles: Genome version differences

7. **`analyzeVariantWithAPI(params)`**
   - Endpoint: Modal backend `/analyze_variant`
   - Returns: AnalysisResult with delta score and prediction
   - Error: Throws on API failure

##### `src/utils/coloring-utils.ts` - Color Utilities

**Purpose**: Consistent color coding for nucleotides and classifications

```typescript
function getNucleotideColorClass(nucleotide: string): string {
  switch(nucleotide.toUpperCase()) {
    case 'A': return 'text-red-600'
    case 'T': return 'text-blue-600'
    case 'G': return 'text-green-600'
    case 'C': return 'text-amber-600'
    default: return 'text-gray-600'
  }
}

function getClassificationColorClasses(classification: string) {
  if (classification.toLowerCase().includes('pathogenic')) {
    return { bg: 'bg-red-100', text: 'text-red-800' }
  } else if (classification.toLowerCase().includes('benign')) {
    return { bg: 'bg-green-100', text: 'text-green-800' }
  } else {
    return { bg: 'bg-yellow-100', text: 'text-yellow-800' }
  }
}
```

#### Configuration Files

##### `package.json`

**Scripts**:
```json
{
  "dev": "next dev --turbo",           // Development server
  "build": "next build",                // Production build
  "start": "next start",                // Production server
  "lint": "next lint",                  // Lint code
  "check": "next lint && tsc --noEmit", // Type check
  "format:check": "prettier --check",   // Check formatting
  "preview": "next build && next start" // Build + serve
}
```

**Dependencies**:
- `next@15.2.3`: React framework
- `react@19.0.0`: UI library
- `typescript@5.8.2`: Type safety
- `tailwindcss@4.0.15`: Styling
- `zod@3.24.2`: Schema validation
- `lucide-react@0.553.0`: Icons

##### `tsconfig.json` - TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,              // Enforce type safety
    "target": "ES2022",          // Modern JavaScript
    "module": "ESNext",          // ES modules
    "moduleResolution": "bundler",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "paths": {
      "~/*": ["./src/*"]        // Path alias
    }
  }
}
```

##### `next.config.js` - Next.js Configuration

```javascript
export default {
  reactStrictMode: false  // Disable double-rendering in dev
}
```

##### `tailwind.config.js` - Tailwind CSS v4

Customizes theme, spacing, colors, and utility classes.

##### `eslint.config.js` - ESLint Configuration

- Next.js linting rules
- TypeScript support
- Code quality checks

##### `prettier.config.js` - Code Formatting

```javascript
export default {
  plugins: ['prettier-plugin-tailwindcss']
}
```

##### `src/env.js` - Environment Variables

```typescript
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL: z.string().url()
  },
  runtimeEnv: {
    NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL:
      process.env.NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL
  }
})
```

---

### Documentation Directory (`/roadmap/`)

```
roadmap/
├── 0-ai-server.md           # Modal deployment guide
└── concept-explanation.md   # Detailed model & ML explanation
```

#### `roadmap/0-ai-server.md`

**Content**:
- Traditional EC2 vs Modal comparison
- Serverless GPU benefits
- Modal workflow explanation
- Evo2 image building process
- Deployment instructions

#### `roadmap/concept-explanation.md`

**Content** (extensive):
- DNA fundamentals (nucleotides, codons, genomes)
- Prokaryotes vs Eukaryotes
- Evo2 model architecture and training
- OpenGenome2 dataset
- Pre-training vs Mid-training
- Introns and Exons
- Promoter motifs
- Regulator genes
- Multi-species training rationale
- Embeddings and RoPE (Rotary Positional Embeddings)
- Zero-shot variant effect prediction
- Inference vs Training workflows

---

### Root Files

#### `readme.md`

- Project overview
- Tech stack summary
- Getting started instructions
- Installation guide (backend + frontend)
- Reference links

#### `.gitignore`

Excludes:
- `node_modules/`
- `.next/`
- `.env`
- `*.log`
- Build artifacts

---

## 5. How the Project Works

### Scientific Foundation

#### What is Variant Effect Prediction?

**Variant Effect Prediction (VEP)** is the task of determining whether a genetic mutation (variant) is:
- **Pathogenic**: Likely to cause disease
- **Benign**: Unlikely to cause disease
- **Uncertain**: Unclear significance

#### The Evo2 Model

**Evo2** is a genomic foundation model trained on:
- **9+ trillion nucleotides** from diverse organisms
- **All domains of life** (bacteria, archaea, eukaryotes, viruses)
- **1 million base pair context window** (can see long-range patterns)
- **7 billion parameters** (comparable to GPT-3 size)

**How it works**:
1. Learns the "language" of DNA through autoregressive next-token prediction
2. Understands evolutionary constraints and functional patterns
3. Assigns likelihood scores to DNA sequences
4. Detects "unnatural" sequences that deviate from learned patterns

#### Zero-Shot Prediction

The model makes predictions on variants it has **never seen during training**:

1. **Input**: Reference sequence and variant sequence (differ by one nucleotide)
2. **Processing**:
   - Score reference sequence: `log_likelihood_ref`
   - Score variant sequence: `log_likelihood_alt`
3. **Output**:
   - `delta_score = log_likelihood_alt - log_likelihood_ref`
   - Negative delta → variant is less likely → potentially pathogenic
   - Positive delta → variant is more likely → potentially benign

#### Why Multi-Species Training?

Training on diverse species allows the model to:
- **Identify conserved regions**: Sequences preserved across evolution are functionally critical
- **Understand context**: Differentiate essential vs non-essential genomic regions
- **Generalize better**: Apply learned patterns to unseen human variants
- **Detect importance**: Mutations in highly conserved regions are more likely pathogenic

### Technical Workflow

#### Step 1: Gene Search

```
User input: "BRCA1"
     ↓
Frontend calls: searchGenes("BRCA1", "hg38")
     ↓
API request to NCBI Gene
     ↓
Response: List of matching genes
     ↓
Display in table: Symbol, Name, Chromosome, Location
```

#### Step 2: Gene Selection

```
User clicks gene row
     ↓
Frontend sets: selectedGene = { symbol: "BRCA1", ... }
     ↓
Component switches to GeneViewer
     ↓
Parallel API calls:
  1. fetchGeneDetails(geneId) → NCBI E-utilities
  2. fetchGeneSequence(chrom, start, end, genome) → UCSC API
  3. fetchClinvarVariants(chrom, geneBounds, genome) → ClinVar
     ↓
Display:
  - Gene information (name, description, location)
  - DNA sequence with color-coded nucleotides
  - Known ClinVar variants in the gene
```

#### Step 3: Variant Input

```
User inputs:
  - Position: 43119628
  - Alternative: G
     ↓
Frontend validates:
  - Position is numeric
  - Alternative is A, T, G, or C
     ↓
Auto-detect reference nucleotide from loaded sequence
     ↓
Optional: Detect if position matches known ClinVar variant
```

#### Step 4: AI Analysis

```
User clicks "Analyze variant"
     ↓
Frontend calls: analyzeVariantWithAPI({
  variant_position: 43119628,
  alternative: "G",
  genome: "hg38",
  chromosome: "chr17"
})
     ↓
HTTP POST to Modal backend
     ↓
Backend workflow:
  1. Fetch 8192bp window around position from UCSC API
  2. Load Evo2 model on H100 GPU (if not cached)
  3. Create reference sequence
  4. Create variant sequence (single nucleotide change)
  5. Score both sequences with Evo2
  6. Calculate: delta_score = variant_score - reference_score
  7. Apply threshold: delta_score < threshold → Pathogenic
  8. Calculate confidence from calibration data
     ↓
Response JSON:
{
  "position": 43119628,
  "reference": "A",
  "alternative": "G",
  "delta_score": -2.34,
  "prediction": "likely pathogenic",
  "classification_confidence": 0.87
}
     ↓
Frontend displays:
  - Variant notation: BRCA1 43119628 A>G
  - Delta score: -2.34
  - Prediction: Likely Pathogenic
  - Confidence: 87%
```

#### Step 5: Clinical Comparison

```
If position matches ClinVar variant:
     ↓
Frontend displays side-by-side:

  ClinVar:                    Evo2:
  Classification: Pathogenic  Prediction: Likely Pathogenic
  Review Status: ⭐⭐⭐       Confidence: 87%

     ↓
User can assess agreement/disagreement
```

---

## 6. Data Flow & User Journey

### Complete User Journey

```
┌─────────────────────────────────────────────────────────┐
│ 1. LANDING PAGE                                         │
│    - User opens DNAgnosis in browser                    │
│    - Sees genome assembly selector (default: hg38)      │
│    - Sees search/browse tabs                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (User types "BRCA1")
┌─────────────────────────────────────────────────────────┐
│ 2. GENE SEARCH                                          │
│    - Frontend calls NCBI Gene API                       │
│    - Returns matching genes in table                    │
│    - User sees: BRCA1 | Breast cancer 1 | chr17:...    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (User clicks BRCA1 row)
┌─────────────────────────────────────────────────────────┐
│ 3. GENE DETAIL VIEW (GeneViewer loads)                 │
│    Parallel API calls:                                  │
│    a) Fetch gene metadata (NCBI)                        │
│    b) Fetch DNA sequence (UCSC)                         │
│    c) Fetch ClinVar variants (ClinVar)                  │
│                                                          │
│    Displays:                                            │
│    - Gene info card (name, description, location)       │
│    - Sequence viewer with position slider               │
│    - Known variants table (ClinVar)                     │
│    - Variant analysis input                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (User clicks nucleotide or types position)
┌─────────────────────────────────────────────────────────┐
│ 4. VARIANT INPUT                                        │
│    - Position auto-populated from sequence click        │
│    - User selects alternative nucleotide (dropdown)     │
│    - Reference auto-detected from sequence              │
│    - Frontend checks if known ClinVar variant           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (User clicks "Analyze variant")
┌─────────────────────────────────────────────────────────┐
│ 5. BACKEND PROCESSING                                   │
│    Frontend → Modal Backend:                            │
│    POST /analyze_variant?variant_position=X&alt=G...    │
│                                                          │
│    Backend (on H100 GPU):                               │
│    1. Fetch genome window (8192bp) from UCSC            │
│    2. Load Evo2 model (if not cached)                   │
│    3. Extract reference nucleotide                      │
│    4. Create variant sequence                           │
│    5. Score reference: log_lik_ref                      │
│    6. Score variant: log_lik_alt                        │
│    7. Calculate: delta = log_lik_alt - log_lik_ref      │
│    8. Classify: delta < threshold → Pathogenic          │
│    9. Return JSON response                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (Response received)
┌─────────────────────────────────────────────────────────┐
│ 6. RESULTS DISPLAY                                      │
│    Frontend shows:                                      │
│    - Variant notation (BRCA1 43119628 A>G)              │
│    - Delta likelihood score (-2.34)                     │
│    - Prediction (Likely Pathogenic) with color coding   │
│    - Confidence bar (87%)                               │
│    - Explanation text                                   │
│                                                          │
│    If matches ClinVar variant:                          │
│    - "Compare with ClinVar" button appears              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (User clicks "Compare")
┌─────────────────────────────────────────────────────────┐
│ 7. COMPARISON MODAL                                     │
│    Side-by-side view:                                   │
│                                                          │
│    ClinVar           |  Evo2 Prediction                 │
│    ─────────────────────────────────────                │
│    Pathogenic        |  Likely Pathogenic               │
│    Review: ⭐⭐⭐     |  Confidence: 87%                │
│    Submitters: 5     |  Delta Score: -2.34              │
│                                                          │
│    User assesses agreement                              │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────┐
│  User    │
│ Browser  │
└────┬─────┘
     │
     │ HTTP Requests
     ↓
┌─────────────────────────────────────────┐
│  Frontend (Next.js)                     │
│  localhost:3000                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  genome-api.ts                  │   │
│  │  (API Service Layer)            │   │
│  └─────────────────────────────────┘   │
└──┬────────┬──────────┬──────────┬──────┘
   │        │          │          │
   │        │          │          │
   ↓        ↓          ↓          ↓
┌──────┐ ┌──────┐ ┌─────────┐ ┌──────────────────┐
│ UCSC │ │ NCBI │ │ ClinVar │ │ Modal Backend    │
│ API  │ │ API  │ │   API   │ │ (FastAPI)        │
└──────┘ └──────┘ └─────────┘ │                  │
                              │  ┌────────────┐  │
                              │  │ Evo2 Model │  │
                              │  │ (H100 GPU) │  │
                              │  └────────────┘  │
                              └─────────┬────────┘
                                        │
                                        ↓
                                  ┌──────────────┐
                                  │ HuggingFace  │
                                  │ (Model Cache)│
                                  └──────────────┘
```

---

## 7. System Design & Constraints

### Design Principles

#### 1. Serverless-First Architecture

**Rationale**: Avoid managing expensive GPU infrastructure

**Benefits**:
- Pay only for actual GPU usage
- Auto-scaling (0-3 containers)
- No idle costs
- Simplified deployment

**Trade-offs**:
- Cold start latency (~30-60s for first request)
- Limited to Modal's GPU availability
- Vendor lock-in to Modal platform

#### 2. Type-Safe Full Stack

**Rationale**: Prevent runtime errors through compile-time checks

**Implementation**:
- TypeScript throughout frontend
- Zod schemas for environment variables
- Python type hints in backend
- Pydantic models for API validation

**Benefits**:
- Catch errors during development
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

#### 3. Separation of Concerns

**Layers**:
1. **Presentation**: React components (UI only)
2. **API Service**: `genome-api.ts` (data fetching)
3. **Backend**: `main.py` (ML inference)
4. **Data**: External APIs (UCSC, NCBI, ClinVar)

**Benefits**:
- Easier testing
- Independent scaling
- Clear responsibilities
- Reusable code

### System Constraints

#### 1. **Performance Constraints**

| Aspect | Constraint | Impact |
|--------|-----------|--------|
| GPU Initialization | ~30-60s cold start | First request slow |
| Model Loading | ~10-20s | Cached after first load |
| Sequence Scoring | ~5-10s per variant | Real-time analysis |
| Context Window | 8192 bp max | Can't analyze very large regions |
| Concurrent Requests | Max 3 containers | Limited parallelism |
| Timeout | 1000s (16.6 min) | Very long analyses fail |

#### 2. **API Rate Limits**

| API | Limit | Handling |
|-----|-------|----------|
| UCSC | ~3 requests/second | No explicit rate limiting |
| NCBI E-utilities | 3 requests/second | Frontend throttling |
| ClinVar | Same as NCBI | Sequential requests |
| Modal | Based on account tier | Auto-queuing |

#### 3. **Data Constraints**

| Type | Constraint | Reason |
|------|-----------|--------|
| Genome Assemblies | Human only (hg38, hg19, etc.) | NCBI API limitation |
| Sequence Length | Max 8192 bp window | Model context window |
| Variant Type | SNVs only (single nucleotide) | Model training focus |
| Chromosomes | Standard chromosomes only | Filtered alternate contigs |

#### 4. **Cost Constraints**

**Modal Pricing** (approximate):
- H100 GPU: ~$4-5 per hour
- Storage: ~$0.15/GB/month (model cache)
- Network: Included

**Optimization Strategies**:
- Persistent volume for model weights (avoid re-downloading)
- Container keep-alive (120s scaledown window)
- Max 3 concurrent containers
- Auto-shutdown on idle

**Free Tier**:
- ~$30/month credit from Modal
- Sufficient for development and demos

#### 5. **Browser Constraints**

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | ✅ Yes | Recommended |
| Firefox | ✅ Yes | Tested |
| Safari | ✅ Yes | Minor CSS differences |
| Edge | ✅ Yes | Chromium-based |
| Mobile | ⚠️ Partial | Layout responsive, but small screens challenging |

### Scalability Considerations

#### Current Architecture

```
Max throughput: ~3 concurrent analyses
Response time: 5-60s (depending on cold start)
Daily capacity: ~1000-2000 analyses (with free tier)
```

#### Scaling Options

**Horizontal Scaling**:
- Increase `max_containers` in Modal config
- Add load balancing for multiple Modal deployments
- Implement request queuing

**Vertical Scaling**:
- Use larger GPUs (A100 → H100 → H200)
- Optimize model (quantization, distillation)
- Batch processing for multiple variants

**Caching**:
- Cache common variant results (Redis)
- Pre-compute popular genes
- Browser-side caching for sequences

### Security Considerations

#### Current Security

**Frontend**:
- No user authentication (public access)
- Environment variables validated with Zod
- HTTPS only (in production)
- CORS configured for Modal backend

**Backend**:
- Modal handles authentication
- No sensitive data stored
- API keys not exposed to frontend
- Sandboxed GPU environment

#### Potential Vulnerabilities

1. **API Abuse**: No rate limiting on frontend → implement API keys
2. **Data Privacy**: Variant data sent to Modal → add encryption
3. **Injection**: No SQL, but validate DNA sequences → input sanitization
4. **DDoS**: No protection → add Cloudflare or similar

### Reliability & Error Handling

#### Error Categories

1. **Network Errors**:
   - UCSC/NCBI/ClinVar API down
   - Modal backend unreachable
   - Handling: Retry with exponential backoff, user-friendly error messages

2. **Model Errors**:
   - OOM (out of memory)
   - GPU crash
   - Handling: Modal auto-retry (2 attempts), fallback message

3. **Data Errors**:
   - Gene not found
   - Invalid genome assembly
   - Sequence unavailable
   - Handling: Validation before API calls, clear error messages

4. **User Errors**:
   - Invalid position
   - Invalid nucleotide
   - Handling: Client-side validation, helpful hints

#### Monitoring

**Current**:
- Modal dashboard (GPU usage, errors, logs)
- Browser console (frontend errors)
- No centralized logging

**Recommended**:
- Sentry for error tracking
- LogRocket for session replay
- Prometheus + Grafana for metrics

---

## 8. Development Setup Guide

### Prerequisites

**Required Software**:
- **Node.js**: v18+ (v20 recommended)
- **npm**: v10+
- **Python**: 3.10 or 3.12
- **Git**: Any recent version
- **Modal Account**: Free tier (signup at modal.com)

**Optional**:
- **VS Code**: Recommended IDE
- **Docker**: For local backend testing (advanced)

### Backend Setup

#### Step 1: Install Python

Download Python 3.12 from [python.org](https://www.python.org/downloads/).

Verify installation:
```bash
python --version  # Should show Python 3.12.x
```

#### Step 2: Create Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies installed**:
- `modal`: Serverless GPU platform SDK
- `pandas`: Data manipulation
- `seaborn`: Visualization
- `scikit-learn`: ML metrics
- `matplotlib`: Plotting
- `openpyxl`: Excel reading

#### Step 4: Configure Modal

```bash
# Install Modal CLI
pip install modal

# Authenticate with Modal
modal setup
```

This will:
1. Open browser for authentication
2. Link your Modal account
3. Store credentials locally

#### Step 5: Test Backend

**Run locally (calls Modal remotely)**:
```bash
modal run main.py
```

This will:
1. Build the Evo2 Docker image (~10-15 min first time)
2. Allocate H100 GPU
3. Run example BRCA1 analysis
4. Download results to local machine

**Expected output**:
```
LOADING EVO2 MODEL!!
Evo2 model loaded.
Loading BRCA1 dataset...
Running analysis...
AUROC: 0.87
Plot saved to brca1_analysis_plot.png
```

#### Step 6: Deploy Backend (Production)

```bash
modal deploy main.py
```

This creates a persistent FastAPI endpoint:
```
✓ Deployed web endpoint
  https://your-username--variant-analysis-evo2-evo2model-analyze-single-variant.modal.run
```

**Copy this URL** for frontend configuration.

### Frontend Setup

#### Step 1: Install Node.js

Download from [nodejs.org](https://nodejs.org/) (v20 LTS recommended).

Verify:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

#### Step 2: Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI components
- All dev dependencies

#### Step 3: Configure Environment Variables

Create `.env` file in `frontend/` directory:

```bash
# .env
NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL=https://your-modal-endpoint.modal.run
```

**Replace** `your-modal-endpoint.modal.run` with the URL from backend deployment.

**Important**: The variable **must** start with `NEXT_PUBLIC_` to be accessible in the browser.

#### Step 4: Run Development Server

```bash
npm run dev
```

**Output**:
```
▲ Next.js 15.2.3
- Local:        http://localhost:3000
- Turbopack:    ✓ Ready
```

Open browser to `http://localhost:3000`.

#### Step 5: Verify Functionality

1. **Gene Search**: Type "BRCA1" → should see results
2. **Gene View**: Click BRCA1 → should load gene details
3. **Sequence**: Should see DNA sequence with colors
4. **ClinVar**: Should see known variants (if any)
5. **Analysis**: Input position and nucleotide → click "Analyze variant"

If analysis fails:
- Check Modal backend URL in `.env`
- Verify Modal deployment is running
- Check browser console for errors

### Development Workflow

#### Frontend Development

**Watch mode** (auto-reload):
```bash
npm run dev
```

**Type checking**:
```bash
npm run check
```

**Linting**:
```bash
npm run lint
```

**Format code**:
```bash
npm run format:write
```

**Build for production**:
```bash
npm run build
npm run start
```

#### Backend Development

**Local testing** (runs on Modal):
```bash
modal run main.py
```

**Deploy changes**:
```bash
modal deploy main.py
```

**View logs**:
```bash
modal logs variant-analysis-evo2
```

**Check app status**:
```bash
modal app list
```

### IDE Setup (VS Code)

**Recommended Extensions**:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Python
- TypeScript and JavaScript Language Features

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "python.linting.enabled": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 9. Contributing Guide for Beginners

### Getting Started

**Prerequisites**:
- Basic understanding of JavaScript/TypeScript
- Familiarity with React (or willingness to learn)
- Basic Python knowledge (for backend)
- Git basics (clone, commit, push, pull)

**Don't worry if you're new!** This project is beginner-friendly. The codebase is well-structured and documented.

### Understanding the Codebase

#### For Frontend Contributors

**Start here**:
1. **Read** `frontend/src/app/page.tsx` - Main entry point
2. **Understand** component hierarchy:
   ```
   page.tsx → GeneViewer → VariantAnalysis
   ```
3. **Learn** how data flows:
   ```
   User input → genome-api.ts → External APIs → State update → Re-render
   ```

**Key concepts**:
- **Components**: Reusable UI pieces (buttons, inputs, cards)
- **State**: Data that changes (search results, selected gene)
- **Props**: Data passed from parent to child components
- **API calls**: Fetching data from external services

**Example: Understanding `page.tsx`**:
```typescript
// State declaration
const [searchQuery, setSearchQuery] = useState<string>("")

// This means:
// - searchQuery: Current value (string)
// - setSearchQuery: Function to update value
// - useState(""): Initial value is empty string

// API call
const results = await searchGenes(searchQuery, selectedGenome)

// This means:
// - searchGenes: Function in genome-api.ts
// - await: Wait for result before continuing
// - results: Array of genes returned
```

#### For Backend Contributors

**Start here**:
1. **Read** `backend/main.py` - Main inference code
2. **Understand** Modal decorators:
   ```python
   @app.function(gpu="H100")  # Runs on H100 GPU
   def my_function():
       pass
   ```
3. **Learn** Evo2 model usage:
   ```python
   model = Evo2('evo2_7b')  # Load model
   logits = model.score_sequence(dna_string)  # Get likelihood
   ```

**Key concepts**:
- **Modal**: Serverless platform for GPU code
- **FastAPI**: Web framework for creating API endpoints
- **Evo2 Model**: AI model for DNA analysis
- **Likelihood Scoring**: Assigning probability to sequences

### Beginner-Friendly Tasks

#### Level 1: Documentation & Styling (No coding required)

1. **Fix typos** in README or documentation
2. **Add comments** to complex code sections
3. **Improve error messages** (make them more helpful)
4. **Update** color scheme or UI styling
5. **Test** on different browsers and report issues

**Example PR**: "Improved error message when gene not found"

#### Level 2: Small Frontend Features

1. **Add loading spinner** to search button
2. **Implement keyboard shortcuts** (e.g., Enter to search)
3. **Add tooltips** to explain features
4. **Create "Copy to clipboard"** button for variant notation
5. **Add "Clear search"** button

**Example task**: Add a "Clear" button next to search input

**Code hint**:
```typescript
// In page.tsx, add a button:
<button onClick={() => setSearchQuery("")}>Clear</button>
```

#### Level 3: Intermediate Features

1. **Add export to CSV** for search results
2. **Implement search history** (local storage)
3. **Add dark mode toggle**
4. **Create summary statistics** for gene (length, exon count)
5. **Improve mobile responsiveness**

**Example task**: Export search results to CSV

**Code hint**:
```typescript
function exportToCSV(data: GeneFromSearch[]) {
  const csv = data.map(gene =>
    `${gene.symbol},${gene.name},${gene.chrom}`
  ).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'genes.csv'
  a.click()
}
```

#### Level 4: Advanced Features

1. **Add batch variant analysis** (multiple variants at once)
2. **Implement caching** for API responses
3. **Create visualization** of delta scores along gene
4. **Add user accounts** and saved analyses
5. **Integrate additional databases** (dbSNP, gnomAD)

### Contribution Workflow

#### Step 1: Fork the Repository

1. Go to GitHub repository
2. Click "Fork" button (top right)
3. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/DNAgnosis.git
   cd DNAgnosis
   ```

#### Step 2: Create a Branch

```bash
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/add-copy-button
git checkout -b fix/search-bug
git checkout -b docs/improve-readme
```

#### Step 3: Make Changes

1. **Edit code** in your IDE
2. **Test locally**:
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   modal run main.py
   ```
3. **Check linting**:
   ```bash
   npm run lint
   npm run check
   ```

#### Step 4: Commit Changes

```bash
git add .
git commit -m "Add copy button for variant notation"

# Commit message tips:
# - Start with verb (Add, Fix, Update, Remove)
# - Be specific
# - Keep under 50 characters
```

#### Step 5: Push to GitHub

```bash
git push origin feature/your-feature-name
```

#### Step 6: Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in description:
   ```markdown
   ## Description
   Added a copy button next to variant notation for easy copying.

   ## Changes
   - Added Copy button component
   - Implemented clipboard API
   - Added success toast notification

   ## Screenshots
   [Attach screenshot if UI change]

   ## Testing
   - Tested on Chrome, Firefox, Safari
   - Verified clipboard functionality
   ```
4. Submit pull request

#### Step 7: Address Review Feedback

Maintainers may request changes:
1. Make requested changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Address review feedback: improve button styling"
   git push origin feature/your-feature-name
   ```
3. Pull request updates automatically

### Coding Standards

#### TypeScript/React

**Naming conventions**:
```typescript
// Components: PascalCase
function GeneViewer() { ... }

// Variables: camelCase
const selectedGene = ...

// Constants: UPPER_SNAKE_CASE
const MAX_RESULTS = 10

// Types/Interfaces: PascalCase
interface GeneFromSearch { ... }
```

**Component structure**:
```typescript
export default function MyComponent({ prop1, prop2 }: Props) {
  // 1. State declarations
  const [state, setState] = useState(...)

  // 2. Effects
  useEffect(() => { ... }, [dependencies])

  // 3. Event handlers
  const handleClick = () => { ... }

  // 4. Render
  return (
    <div>...</div>
  )
}
```

**Comments**:
```typescript
// Single line for simple explanations

/**
 * Multi-line for complex functions
 * @param query - Search query string
 * @returns Array of matching genes
 */
async function searchGenes(query: string) { ... }
```

#### Python

**Naming conventions**:
```python
# Functions: snake_case
def analyze_variant():
    pass

# Classes: PascalCase
class Evo2Model:
    pass

# Constants: UPPER_SNAKE_CASE
WINDOW_SIZE = 8192
```

**Type hints**:
```python
def get_sequence(chrom: str, start: int, end: int) -> str:
    """
    Fetch genome sequence.

    Args:
        chrom: Chromosome name (e.g., "chr17")
        start: Start position (0-based)
        end: End position (exclusive)

    Returns:
        DNA sequence string
    """
    ...
```

### Testing Guidelines

#### Frontend Testing (Manual)

1. **Browser testing**: Test on Chrome, Firefox, Safari
2. **Responsive testing**: Test on mobile, tablet, desktop
3. **Feature testing**: Verify all user flows work
4. **Error testing**: Test with invalid inputs

**Example checklist**:
```
☐ Search for gene "BRCA1" - shows results
☐ Search for invalid gene "XYZABC" - shows error
☐ Click gene - loads details
☐ Input variant - shows prediction
☐ Invalid position - shows validation error
☐ Mobile view - layout correct
```

#### Backend Testing (Manual)

1. **Local Modal testing**:
   ```bash
   modal run main.py
   ```
2. **API endpoint testing**:
   ```bash
   curl "https://your-endpoint.modal.run/analyze_variant?..."
   ```

### Getting Help

**Stuck? Here's how to get help**:

1. **Read documentation**: Check this file and `readme.md`
2. **Search issues**: Someone may have asked before
3. **Check code comments**: Look for explanatory comments
4. **Ask in discussions**: GitHub Discussions tab
5. **Create issue**: Describe problem with details

**When creating an issue**:
```markdown
## Problem
Unable to run backend - Modal authentication fails

## Environment
- OS: macOS 13.4
- Python: 3.12.1
- Modal: 0.57.0

## Steps to reproduce
1. Run `modal setup`
2. Opens browser but shows error
3. Terminal shows "Authentication failed"

## Expected
Should authenticate successfully

## Actual
Error message: [paste error]
```

---

## 10. Project Roadmap

### Current Status (v0.1.0)

**Implemented**:
- ✅ Gene search and browsing
- ✅ DNA sequence viewer
- ✅ Single variant analysis
- ✅ ClinVar integration
- ✅ Evo2 model deployment
- ✅ Basic UI with Shadcn components
- ✅ Responsive design

**Limitations**:
- Only SNVs (single nucleotide variants)
- No user accounts
- No caching
- Manual BRCA1 threshold (not optimized per gene)
- Limited error handling

### Near-Term Roadmap (v0.2.0 - v0.3.0)

#### v0.2.0 - Performance & UX Improvements (2-3 months)

**Features**:
- [ ] **Response caching**: Cache common variant results (Redis)
- [ ] **Batch analysis**: Analyze multiple variants at once
- [ ] **Progress indicators**: Better loading states
- [ ] **Error recovery**: Retry failed requests
- [ ] **Export results**: Download as CSV/JSON
- [ ] **Keyboard shortcuts**: Power user features
- [ ] **Dark mode**: Theme toggle

**Technical improvements**:
- [ ] Implement API rate limiting
- [ ] Add request queuing
- [ ] Optimize Modal cold start
- [ ] Add unit tests (Jest)
- [ ] Set up CI/CD (GitHub Actions)

#### v0.3.0 - Extended Analysis (3-6 months)

**Features**:
- [ ] **Insertions/Deletions**: Support indels, not just SNVs
- [ ] **Multi-gene view**: Compare across genes
- [ ] **Pathogenicity heatmap**: Visualize scores along gene
- [ ] **Sequence conservation**: Show cross-species alignment
- [ ] **Regulatory regions**: Analyze promoters, enhancers
- [ ] **Variant interpretation**: Explain why pathogenic/benign

**Data integrations**:
- [ ] gnomAD (population frequencies)
- [ ] dbSNP (variant identifiers)
- [ ] OMIM (disease associations)
- [ ] GTEx (gene expression)

### Mid-Term Roadmap (v0.4.0 - v1.0.0)

#### v0.4.0 - User Accounts & Collaboration (6-9 months)

**Features**:
- [ ] User authentication (Auth0 or Clerk)
- [ ] Save analyses to account
- [ ] Share results via link
- [ ] Comment on variants
- [ ] Workspace for teams

**Technical**:
- [ ] PostgreSQL database
- [ ] User data encryption
- [ ] GDPR compliance

#### v0.5.0 - Advanced ML Models (9-12 months)

**Features**:
- [ ] Ensemble predictions (Evo2 + other models)
- [ ] Confidence calibration per gene
- [ ] Uncertainty quantification
- [ ] Model explainability (attention maps)

**Models to integrate**:
- Nucleotide Transformer
- DNABERT
- Enformer

#### v1.0.0 - Production Ready (12-18 months)

**Features**:
- [ ] Clinical-grade predictions
- [ ] Comprehensive validation
- [ ] Regulatory compliance (HIPAA, if applicable)
- [ ] Full API documentation
- [ ] Extensive test suite (>80% coverage)
- [ ] Multi-language support

**Infrastructure**:
- [ ] Load balancing
- [ ] Multi-region deployment
- [ ] Monitoring & alerting
- [ ] Automated backups

### Long-Term Vision (v2.0+)

**Research Features**:
- [ ] Protein structure prediction integration (AlphaFold)
- [ ] Drug-gene interaction analysis
- [ ] Population genetics tools
- [ ] CRISPR guide design

**Enterprise Features**:
- [ ] On-premise deployment
- [ ] Custom model training
- [ ] White-label solution
- [ ] SLA guarantees

**Community**:
- [ ] Public variant database
- [ ] Crowdsourced annotations
- [ ] Educational resources
- [ ] Research partnerships

### How to Influence the Roadmap

**Community input is welcome!**

1. **Feature requests**: Create GitHub issue with `enhancement` label
2. **Discussions**: Use GitHub Discussions for ideas
3. **Vote**: React to issues with 👍
4. **Contribute**: Submit PRs for roadmap items

---

## 11. API Reference

### External APIs Used

#### UCSC Genome Browser API

**Base URL**: `https://api.genome.ucsc.edu`

**Endpoints**:

1. **List Genomes**
   ```
   GET /list/ucscGenomes
   Response: { "ucscGenomes": { "organism1": [genomes...] } }
   ```

2. **List Chromosomes**
   ```
   GET /list/chromosomes?genome=hg38
   Response: { "chromosomes": [...] }
   ```

3. **Get Sequence**
   ```
   GET /getData/sequence?genome=hg38;chrom=chr17;start=100;end=200
   Response: { "dna": "ATGC..." }
   ```

#### NCBI Gene API

**Base URL**: `https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3`

**Endpoints**:

1. **Search Genes**
   ```
   GET /search?terms=BRCA1&ef=symbol,description,chr,location
   Response: [count, suggestions, null, [[symbol, desc, chr, loc]]]
   ```

#### NCBI E-utilities

**Base URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils`

**Endpoints**:

1. **Gene Summary**
   ```
   GET /esummary.fcgi?db=gene&id=672&retmode=json
   Response: { "result": { "672": { ... } } }
   ```

2. **ClinVar Search**
   ```
   GET /esearch.fcgi?db=clinvar&term=BRCA1[gene]&retmax=100
   Response: { "esearchresult": { "idlist": [...] } }
   ```

3. **ClinVar Summary**
   ```
   GET /esummary.fcgi?db=clinvar&id=123&retmode=json
   Response: { "result": { "123": { ... } } }
   ```

### Internal API (Modal Backend)

**Base URL**: Set in `NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL`

**Endpoint**:

#### POST `/analyze_variant`

**Purpose**: Analyze single nucleotide variant with Evo2 model

**Query Parameters**:
```typescript
{
  variant_position: number    // Genomic position (1-based)
  alternative: string         // Alternative nucleotide (A/T/G/C)
  genome: string             // Genome assembly (e.g., "hg38")
  chromosome: string         // Chromosome (e.g., "chr17")
}
```

**Example Request**:
```bash
curl -X POST "https://your-endpoint.modal.run/analyze_variant?variant_position=43119628&alternative=G&genome=hg38&chromosome=chr17"
```

**Response** (200 OK):
```json
{
  "position": 43119628,
  "reference": "A",
  "alternative": "G",
  "delta_score": -2.345,
  "prediction": "likely pathogenic",
  "classification_confidence": 0.87
}
```

**Response Fields**:
- `position` (number): Input position
- `reference` (string): Reference nucleotide from genome
- `alternative` (string): Input alternative nucleotide
- `delta_score` (number): Log-likelihood difference (negative = pathogenic)
- `prediction` (string): Classification ("likely pathogenic" or "likely benign")
- `classification_confidence` (number): Confidence score 0-1

**Error Response** (500):
```json
{
  "detail": "Error message describing what went wrong"
}
```

**Rate Limits**: None currently (relies on Modal auto-scaling)

**Timeout**: 1000 seconds

---

## 12. Troubleshooting

### Common Issues

#### Frontend Issues

**Issue**: `npm install` fails

**Solution**:
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: "Cannot find module" error

**Solution**:
- Verify file path is correct
- Check import statement matches export
- Ensure TypeScript paths in `tsconfig.json`

**Issue**: Environment variable not working

**Solution**:
- Verify variable starts with `NEXT_PUBLIC_`
- Restart dev server after changing `.env`
- Check `src/env.js` schema includes variable

**Issue**: API calls fail with CORS error

**Solution**:
- Verify Modal backend URL is correct
- Check Modal deployment is running
- Modal should automatically handle CORS

#### Backend Issues

**Issue**: Modal authentication fails

**Solution**:
```bash
# Re-authenticate
modal setup

# If still fails, try:
rm ~/.modal.toml
modal setup
```

**Issue**: "Out of memory" error during model loading

**Solution**:
- H100 has 141GB - should be sufficient
- Check Modal account limits
- Try deploying with `modal deploy` instead of `modal run`

**Issue**: Cold start too slow

**Solution**:
- First request takes ~30-60s (normal)
- Subsequent requests use cached container
- Increase `scaledown_window` in `@app.function` decorator

**Issue**: Import errors for Evo2

**Solution**:
- Ensure Evo2 installed in Docker image
- Check `modal logs` for build errors
- Verify GitHub repo accessible

#### Integration Issues

**Issue**: UCSC API returns no sequence

**Solution**:
- Verify genome assembly exists (hg38, hg19)
- Check chromosome name format ("chr17", not "17")
- Ensure position is within chromosome bounds

**Issue**: NCBI API rate limit hit

**Solution**:
- Limit: 3 requests/second
- Add delay between requests
- Use NCBI API key (optional)

**Issue**: ClinVar variants not loading

**Solution**:
- Check gene has ClinVar annotations
- Verify chromosome format matches
- Ensure genome version matches (hg19 vs hg38)

### Debugging Tips

#### Frontend Debugging

**Browser Console**:
```javascript
// Check state
console.log('Selected gene:', selectedGene)

// Check API response
const result = await searchGenes(query, genome)
console.log('Search results:', result)
```

**React DevTools**:
- Install browser extension
- Inspect component state and props
- Track re-renders

**Network Tab**:
- View all API requests
- Check request/response payloads
- Identify slow requests

#### Backend Debugging

**Modal Logs**:
```bash
# View real-time logs
modal logs variant-analysis-evo2

# View specific function
modal logs variant-analysis-evo2::Evo2Model.analyze_single_variant
```

**Print Debugging**:
```python
print(f"Received position: {variant_position}")
print(f"Fetched sequence: {sequence[:50]}...")  # First 50bp
print(f"Delta score: {delta_score}")
```

**Local Testing**:
```bash
# Test locally (still uses Modal GPU)
modal run main.py

# Check output
cat brca1_analysis_plot.png
```

---

## 13. Additional Resources

### Learning Resources

#### For Beginners

**Web Development**:
- [MDN Web Docs](https://developer.mozilla.org/) - HTML, CSS, JavaScript
- [React Official Tutorial](https://react.dev/learn) - Learn React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Learn TypeScript

**Genomics**:
- [Khan Academy: DNA](https://www.khanacademy.org/science/biology/dna-as-the-genetic-material) - DNA basics
- [Genomics Education](https://www.genome.gov/genetics-glossary) - Genetics glossary
- [ClinVar Tutorial](https://www.ncbi.nlm.nih.gov/clinvar/intro/) - Understanding variants

**Machine Learning**:
- [Fast.ai](https://www.fast.ai/) - Practical deep learning
- [3Blue1Brown Neural Networks](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) - Visual explanations

#### Advanced Topics

**Genomic AI**:
- [Evo2 Paper](https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1) - Evo2 model details
- [Nucleotide Transformer](https://www.biorxiv.org/content/10.1101/2023.01.11.523679v1) - Alternative model
- [Enformer](https://www.nature.com/articles/s41592-021-01252-x) - Gene expression prediction

**Serverless GPU**:
- [Modal Docs](https://modal.com/docs) - Modal platform
- [Modal Examples](https://modal.com/docs/examples) - Code examples

**Next.js**:
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [T3 Stack](https://create.t3.gg/) - Type-safe full-stack

### External Tools & Databases

**Genome Browsers**:
- [UCSC Genome Browser](https://genome.ucsc.edu/) - Interactive genome explorer
- [Ensembl](https://www.ensembl.org/) - Alternative browser

**Variant Databases**:
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) - Clinical variants
- [gnomAD](https://gnomad.broadinstitute.org/) - Population frequencies
- [dbSNP](https://www.ncbi.nlm.nih.gov/snp/) - Variant IDs

**Gene Information**:
- [NCBI Gene](https://www.ncbi.nlm.nih.gov/gene) - Gene database
- [GeneCards](https://www.genecards.org/) - Gene summaries
- [OMIM](https://www.omim.org/) - Disease associations

### Community & Support

**Project Links**:
- GitHub Repository: [DNAgnosis](https://github.com/sphinxcoderr/DNAgnosis)
- Issues: [GitHub Issues](https://github.com/sphinxcoderr/DNAgnosis/issues)
- Discussions: [GitHub Discussions](https://github.com/sphinxcoderr/DNAgnosis/discussions)

**Related Projects**:
- [Evo2 GitHub](https://github.com/ArcInstitute/evo2) - Model repository
- [Awesome Genomic AI](https://github.com/labmlai/awesome-genomic-ai) - Curated list

**Getting Help**:
1. Check this documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Create new issue with details

---

## Appendix

### Glossary

**Bioinformatics Terms**:
- **SNV** (Single Nucleotide Variant): Single letter change in DNA
- **Pathogenic**: Likely to cause disease
- **Benign**: Unlikely to cause disease
- **ClinVar**: Database of genetic variants and clinical significance
- **Genome Assembly**: Version of reference genome (hg38, hg19)
- **Chromosome**: Package of DNA (humans have 23 pairs)
- **Gene**: Section of DNA that codes for protein or function
- **Nucleotide**: Building block of DNA (A, T, G, C)
- **Exon**: Protein-coding part of gene
- **Intron**: Non-coding part of gene
- **Promoter**: Regulatory region before gene

**Technical Terms**:
- **API** (Application Programming Interface): Way for programs to communicate
- **GPU** (Graphics Processing Unit): Processor for parallel computation
- **LLM** (Large Language Model): AI model trained on massive text data
- **Zero-shot**: Making predictions without specific training examples
- **Likelihood**: Probability assigned by model
- **Embedding**: Numerical representation of data
- **Context Window**: Amount of input model can process at once

**Development Terms**:
- **Frontend**: User-facing part (web browser)
- **Backend**: Server-side processing (GPU)
- **Component**: Reusable UI piece
- **State**: Data that changes over time
- **Props**: Data passed to components
- **Hook**: React function for state/effects
- **TypeScript**: JavaScript with types
- **Serverless**: Cloud infrastructure without managing servers

### Acknowledgments

**Built With**:
- [Evo2](https://github.com/ArcInstitute/evo2) by Arc Institute
- [Modal](https://modal.com/) for serverless GPU
- [Next.js](https://nextjs.org/) by Vercel
- [Shadcn UI](https://ui.shadcn.com/) by shadcn
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs

**Data Sources**:
- UCSC Genome Browser
- NCBI Gene Database
- ClinVar Database

**Inspiration**:
- [Andreas Trolle](https://www.youtube.com/@andreastrolle) for Modal tutorial
- T3 Stack for project structure
- Genomic AI research community

---

## License

This project is open source. See `LICENSE` file for details.

---

## Contact

For questions, issues, or contributions:
- GitHub Issues: [Create Issue](https://github.com/sphinxcoderr/DNAgnosis/issues/new)
- GitHub Discussions: [Start Discussion](https://github.com/sphinxcoderr/DNAgnosis/discussions)

---

**Last Updated**: 2025-11-17

**Document Version**: 1.0.0

**Project Version**: 0.1.0
