export interface GenomeAssemblyFromSearch {
  id: string;
  name: string;
  sourceName: string;
  active: boolean;
}


// Chromosome information from UCSC API  
export interface ChromosomeFromSearch {
  name: string;
  size: number;
}
export interface GeneFromSearch {
symbol: string;
name: string;
chrom: string;
description: string;
gene_id?: string;
}

export interface GeneBounds {
min: number;
max: number;
}

export interface GeneDetailsFromSearch {
genomicinfo?: {
  chrstart: number;
  chrstop: number;
  strand?: string;
}[];
summary?: string;
organism?: {
  scientificname: string;
  commonname: string;
};
}

export interface ClinvarVariant {
clinvar_id: string;
title: string;
variation_type: string;
classification: string;
gene_sort: string;
chromosome: string;
location: string;
evo2Result?: {
  prediction: string;
  delta_score: number;
  classification_confidence: number;
};
isAnalyzing?: boolean;
evo2Error?: string;
}

export interface AnalysisResult {
position: number;
reference: string;
alternative: string;
delta_score: number;
prediction: string;
classification_confidence: number;
}

export async function getAvailableGenomes(){
  const apiUrl = "https://api.genome.ucsc.edu/list/ucscGenomes";// UCSC API endpoint for genome assemblies
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch genome list from UCSC API");
  }// Check for successful response

  const genomeData: unknown = await response.json();// Parse JSON response
  
  if (!genomeData || typeof genomeData !== 'object' || !('ucscGenomes' in genomeData)) {
    throw new Error("UCSC API error: missing ucscGenomes");
  }//if ucscGenomes missing, throw error

  const genomes = (genomeData as { ucscGenomes: Record<string, unknown> }).ucscGenomes;// Extract genome assemblies
  const structuredGenomes: Record<string, GenomeAssemblyFromSearch[]> = {};// Structured genome data

  // Organize genomes by organism
  for (const genomeId in genomes) {
    const genomeInfo = genomes[genomeId] as Record<string, unknown>;// Genome information
    const organism = (genomeInfo.organism as string | undefined) ?? "Other";// Default to "Other" if organism not specified

    structuredGenomes[organism] ??= [];// Initialize organism array if not present
    structuredGenomes[organism].push({
      id: genomeId,
      name: (genomeInfo.description as string | undefined) ?? genomeId,
      sourceName: (genomeInfo.sourceName as string | undefined) ?? genomeId,
      active: !!genomeInfo.active,
    });// Add genome to organism array
  }
  return { genomes: structuredGenomes };// Return structured genome data
}

// Fetch chromosome list for a given genome assembly
export async function getGenomeChromosomes(genomeId: string) {
const apiUrl = `https://api.genome.ucsc.edu/list/chromosomes?genome=${genomeId}`;// UCSC API endpoint for chromosomes
const response = await fetch(apiUrl);// Fetch chromosome data
if (!response.ok) {
  throw new Error("Failed to fetch chromosome list from UCSC API");
}// Check for successful response

const chromosomeData: unknown = await response.json();// Parse JSON response

if (!chromosomeData || typeof chromosomeData !== 'object' || !('chromosomes' in chromosomeData)) {
  throw new Error("UCSC API error: missing chromosomes");
}// Check for chromosomes data

// Process and filter chromosomes
const chromData = (chromosomeData as { chromosomes: Record<string, unknown> }).chromosomes;
const chromosomes: ChromosomeFromSearch[] = [];
for (const chromId in chromData) {
  if (
    chromId.includes("_") ||
    chromId.includes("Un") ||
    chromId.includes("random")
  )// Skip alternative contigs
    continue;
  chromosomes.push({
    name: chromId,
    size: chromData[chromId] as number,
  });
}// Build chromosome list

// Sort chromosomes: numeric first, then alphabetic
chromosomes.sort((a, b) => {
  const anum = a.name.replace("chr", "");// Remove "chr" prefix for comparison
  const bnum = b.name.replace("chr", "");// Remove "chr" prefix for comparison
  const isNumA = /^\d+$/.test(anum);// Check if numeric
  const isNumB = /^\d+$/.test(bnum);// Check if numeric
  if (isNumA && isNumB) return Number(anum) - Number(bnum);//id both numeric, sort numerically
  if (isNumA) return -1;// Numeric comes before alphabetic
  if (isNumB) return 1;// Numeric comes before alphabetic
  return anum.localeCompare(bnum);// return alphabetic comparison
});

return { chromosomes };// Return sorted chromosome list
}

export async function searchGenes(query: string, genome: string) {
const url = "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search";// NCBI Genes API endpoint
const params = new URLSearchParams({
  terms: query,
  df: "chromosome,Symbol,description,map_location,type_of_gene",
  ef: "chromosome,Symbol,description,map_location,type_of_gene,GenomicInfo,GeneID",
});// Query parameters
const response = await fetch(`${url}?${params}`);// Fetch gene search results
if (!response.ok) {
  throw new Error("NCBI API Error");// Check for successful response
}//if response not ok, throw error

const data: unknown = await response.json();// Parse JSON response
const results: GeneFromSearch[] = [];// Initialize results array

// Process search results
if (Array.isArray(data) && typeof data[0] === 'number' && data[0] > 0) {// If results found
  const fieldMap = data[2] as Record<string, unknown[]>;// Field mapping by header row
  const geneIds = (fieldMap.GeneID ?? []) as string[];// Extract Gene IDs
  const dataArray = data[3] as unknown[][];
  // Limit to first 10 results
  for (let i = 0; i < Math.min(10, data[0]); ++i) {
    if (i < dataArray.length) {// Ensure index within bounds
      try {
        const display = dataArray[i] as unknown[];// Extract display fields
        let chrom = display[0] as string;// Chromosome field
        if (chrom && !chrom.startsWith("chr")) {// Ensure "chr" prefix
          chrom = `chr${chrom}`;
        }
        results.push({
          symbol: display[2] as string,
          name: display[3] as string,
          chrom,
          description: display[3] as string,
          gene_id: geneIds[i] ?? "",
        });// Add gene to results
      } catch {
        continue;
      }
    }
  }
}

return { query, genome, results };// Return search results
}

// Fetch detailed gene information and genomic bounds
export async function fetchGeneDetails(geneId: string): Promise<{
geneDetails: GeneDetailsFromSearch | null;// Detailed gene information
geneBounds: GeneBounds | null;// Genomic bounds of the gene
initialRange: { start: number; end: number } | null;// Initial sequence range for viewing
}> {
try {
  const detailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneId}&retmode=json`;
  const detailsResponse = await fetch(detailUrl);// Fetch gene details from NCBI E-utilities

  if (!detailsResponse.ok) {
    console.error(
      `Failed to fetch gene details: ${detailsResponse.statusText}`,
    );
    return { geneDetails: null, geneBounds: null, initialRange: null };
  }

  const detailData: unknown = await detailsResponse.json();// Parse JSON response

  // Extract gene details and genomic information
  if (detailData && typeof detailData === 'object' && 'result' in detailData) {
    const result = detailData.result as Record<string, unknown>;
    if (result[geneId]) {
      const detail = result[geneId] as GeneDetailsFromSearch;// Extract gene details

      // Ensure genomic information is available
      if (detail.genomicinfo && detail.genomicinfo.length > 0) {
        const info = detail.genomicinfo[0];// Use the first genomic info entry
        if (!info || typeof info.chrstart !== "number" || typeof info.chrstop !== "number") {
          // genomic info entry is missing or malformed
          return { geneDetails: null, geneBounds: null, initialRange: null };
        }

        const minPos = Math.min(info.chrstart, info.chrstop);// Determine gene bounds
        const maxPos = Math.max(info.chrstart, info.chrstop);// Determine gene bounds
        const bounds = { min: minPos, max: maxPos };// Gene bounds
        
        // Determine initial sequence range (up to 10,000 bases)
        const geneSize = maxPos - minPos;
        const seqStart = minPos;
        const seqEnd = geneSize > 10000 ? minPos + 10000 : maxPos;// Limit to 10,000 bases
        const range = { start: seqStart, end: seqEnd };// Initial sequence range
        // Return gene details, bounds, and initial range
        return { geneDetails: detail, geneBounds: bounds, initialRange: range };
      }
    }
  }
  // If genomic info is missing, return nulls
  return { geneDetails: null, geneBounds: null, initialRange: null };
} catch {
  return { geneDetails: null, geneBounds: null, initialRange: null };
}
}

export async function fetchGeneSequence(
chrom: string,
start: number,
end: number,
genomeId: string,
): Promise<{
sequence: string;
actualRange: { start: number; end: number };
error?: string;
}> {
try {
  const chromosome = chrom.startsWith("chr") ? chrom : `chr${chrom}`;// Ensure "chr" prefix

  const apiStart = start - 1;// UCSC API uses 0-based start
  const apiEnd = end;// UCSC API uses 1-based end

  const apiUrl = `https://api.genome.ucsc.edu/getData/sequence?genome=${genomeId};chrom=${chromosome};start=${apiStart};end=${apiEnd}`;// UCSC API endpoint for sequence data
  const response = await fetch(apiUrl);// Fetch sequence data
  const data: unknown = await response.json();// Parse JSON response

  const actualRange = { start, end };// Actual requested range

  if (data && typeof data === 'object') {
    const dataObj = data as { error?: string; dna?: string };
    if (dataObj.error || !dataObj.dna) {
      return { sequence: "", actualRange, error: dataObj.error };
    }// Check for errors in response

    const sequence = dataObj.dna.toUpperCase();// Extract and format sequence

    return { sequence, actualRange };
  }
  
  return { sequence: "", actualRange, error: "Invalid response format" };
} catch {
  return {
    sequence: "",
    actualRange: { start, end },
    error: "Internal error in fetch gene sequence",
  };
}
}

export async function fetchClinvarVariants(
chrom: string,
geneBound: GeneBounds,
genomeId: string,
): Promise<ClinvarVariant[]> {
const chromFormatted = chrom.replace(/^chr/i, "");

const minBound = Math.min(geneBound.min, geneBound.max);
const maxBound = Math.max(geneBound.min, geneBound.max);

const positionField = genomeId === "hg19" ? "chrpos37" : "chrpos38";
const searchTerm = `${chromFormatted}[chromosome] AND ${minBound}:${maxBound}[${positionField}]`;

const searchUrl =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const searchParams = new URLSearchParams({
  db: "clinvar",
  term: searchTerm,
  retmode: "json",
  retmax: "20",
});

const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`);

if (!searchResponse.ok) {
  throw new Error("ClinVar search failed: " + searchResponse.statusText);
}

const searchData: unknown = await searchResponse.json();

if (
  !searchData ||
  typeof searchData !== 'object' ||
  !('esearchresult' in searchData) ||
  !searchData.esearchresult ||
  typeof searchData.esearchresult !== 'object' ||
  !('idlist' in searchData.esearchresult) ||
  !Array.isArray((searchData.esearchresult as { idlist: unknown }).idlist) ||
  (searchData.esearchresult as { idlist: unknown[] }).idlist.length === 0
) {
  console.log("No ClinVar variants found");
  return [];
}

const variantIds = (searchData.esearchresult as { idlist: string[] }).idlist;

const summaryUrl =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
const summaryParams = new URLSearchParams({
  db: "clinvar",
  id: variantIds.join(","),
  retmode: "json",
});

const summaryResponse = await fetch(
  `${summaryUrl}?${summaryParams.toString()}`,
);

if (!summaryResponse.ok) {
  throw new Error(
    "Failed to fetch variant details: " + summaryResponse.statusText,
  );
}

const summaryData: unknown = await summaryResponse.json();
const variants: ClinvarVariant[] = [];

if (summaryData && typeof summaryData === 'object' && 'result' in summaryData) {
  const result = summaryData.result as { uids?: string[] };
  if (result.uids) {
    const resultData = summaryData.result as Record<string, unknown>;
    for (const id of result.uids) {
      const variant = resultData[id] as Record<string, unknown>;
      const objType = (variant.obj_type as string | undefined) ?? "Unknown";
      const germlineClass = variant.germline_classification as { description?: string } | undefined;
      variants.push({
        clinvar_id: id,
        title: variant.title as string,
        variation_type: objType
          .split(" ")
          .map(
            (word: string) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" "),
        classification:
          germlineClass?.description ?? "Unknown",
        gene_sort: (variant.gene_sort as string | undefined) ?? "",
        chromosome: chromFormatted,
        location: variant.location_sort
          ? parseInt(variant.location_sort as string).toLocaleString()
          : "Unknown",
      });
    }
  }
}

return variants;
}

export async function analyzeVariantWithAPI({
position,
alternative,
genomeId,
chromosome,
}: {
position: number;
alternative: string;
genomeId: string;
chromosome: string;
}): Promise<AnalysisResult> {
const queryParams = new URLSearchParams({
  variant_position: position.toString(),
  alternative: alternative,
  genome: genomeId,
  chromosome: chromosome,
});

const url = `${process.env.NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL}/analyze_variant?${queryParams.toString()}`;

const response = await fetch(url, { method: "POST" });

if (!response.ok) {
  const errorText = await response.text();
  throw new Error("Failed to analyze variant " + errorText);
}

return (await response.json()) as AnalysisResult;
}