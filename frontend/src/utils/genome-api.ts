export interface GenomeAssemblyFromSearch {
    id: string;
    name: string;
    sourceName: string;
    active: boolean;
  }

export async function getAvailableGenomes(){
    const apiUrl = "https://api.genome.ucsc.edu/list/ucscGenomes";
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch genome list from UCSC API");
    }
  
    const genomeData = await response.json();
    if (!genomeData.ucscGenomes) {
      throw new Error("UCSC API error: missing ucscGenomes");
    }
  
    const genomes = genomeData.ucscGenomes;
    const structuredGenomes: Record<string, GenomeAssemblyFromSearch[]> = {};
  
    for (const genomeId in genomes) {
      const genomeInfo = genomes[genomeId];
      const organism = genomeInfo.organism || "Other";
  
      if (!structuredGenomes[organism]) structuredGenomes[organism] = [];
      structuredGenomes[organism].push({
        id: genomeId,
        name: genomeInfo.description || genomeId,
        sourceName: genomeInfo.sourceName || genomeId,
        active: !!genomeInfo.active,
      });
    }
    return { genomes: structuredGenomes };
}