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

export async function getAvailableGenomes(){
    const apiUrl = "https://api.genome.ucsc.edu/list/ucscGenomes";// UCSC API endpoint for genome assemblies
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch genome list from UCSC API");
    }// Check for successful response
  
    const genomeData = await response.json();// Parse JSON response
    if (!genomeData.ucscGenomes) {
      throw new Error("UCSC API error: missing ucscGenomes");
    }//if ucscGenomes missing, throw error
  
    const genomes = genomeData.ucscGenomes;// Extract genome assemblies
    const structuredGenomes: Record<string, GenomeAssemblyFromSearch[]> = {};// Structured genome data
  
    // Organize genomes by organism
    for (const genomeId in genomes) {
      const genomeInfo = genomes[genomeId];// Genome information
      const organism = genomeInfo.organism || "Other";// Default to "Other" if organism not specified
  
      if (!structuredGenomes[organism]) structuredGenomes[organism] = [];// Initialize organism array if not present
      structuredGenomes[organism].push({
        id: genomeId,
        name: genomeInfo.description || genomeId,
        sourceName: genomeInfo.sourceName || genomeId,
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

  const chromosomeData = await response.json();// Parse JSON response
  if (!chromosomeData.chromosomes) {
    throw new Error("UCSC API error: missing chromosomes");
  }// Check for chromosomes data

  // Process and filter chromosomes

  const chromosomes: ChromosomeFromSearch[] = [];
  for (const chromId in chromosomeData.chromosomes) {
    if (
      chromId.includes("_") ||
      chromId.includes("Un") ||
      chromId.includes("random")
    )// Skip alternative contigs
      continue;
    chromosomes.push({
      name: chromId,
      size: chromosomeData.chromosomes[chromId],
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