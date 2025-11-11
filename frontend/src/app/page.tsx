"use client";

import { get } from "http";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { type GenomeAssemblyFromSearch, type ChromosomeFromSearch, getGenomeChromosomes,
  getAvailableGenomes } from "~/utils/genome-api";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "~/components/ui/select";

export default function HomePage() {
  const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([]);// Genome data state
  const [error, setError] = useState<string | null>(null);// Error state
  const [isLoading, setIsLoading] = useState(false);// Loading state
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");//default genome
  const [chromosomes, setChromosomes] = useState<ChromosomeFromSearch[]>([]);// Chromosome data state
  const [selectedChromosome, setSelectedChromosome] = useState<string>("chr1");// Default chromosome

  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes && data.genomes["Human"]) {
          setGenomes(data.genomes["Human"]);
        }
      } catch (err) {
        setError("Genome Data Not Found. Please enter valid genome assembly.");// Set error message
      } finally {
        setIsLoading(false);// Reset loading state
      }
    };
    fetchGenomes();// Fetch genome data on component mount
  }, []);

  useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);// Set loading state
        const data = await getGenomeChromosomes(selectedGenome);// Fetch chromosomes for selected genome
        setChromosomes(data.chromosomes);// Update chromosome state
        console.log(data.chromosomes);// Log chromosome data
        if (data.chromosomes.length > 0) {
          setSelectedChromosome(data.chromosomes[0]!.name);// Set default selected chromosome
        }//if chromosomes available
      } catch (err) {
        setError("Failed to load chromosome data");// Set error message
      } finally {
        setIsLoading(false);
      }// Reset loading state
    };//fetchChromosomes
    fetchChromosomes();
  }, [selectedGenome]);// Refetch chromosomes when selected genome changes

  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
  };// Handle genome selection change

  return (
    <div className="min-h-screen bg-[#e9eeea]">
      <header className="border-b border-[#3c4f3d]/10 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h1 className="text-xl font-light tracking-wide text-[#3c4f3d]">
                <span className="font-normal">DNA</span>
                <span className="text-[#de8246]">Gnosis</span>
              </h1>
              <div className="absolute -bottom-1 left-0 h-[2px] w-12 bg-[#de8246]"></div>
            </div>
            <span className="text-sm font-light text-[#3c4f3d]/70">
              DNA Variant Analysis
            </span>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-6">
      <Card className="mb-6 gap-0 border-none bg-white py-0 shadow-sm">
              <CardHeader className="pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-normal text-[#3c4f3d]/70">
                    Genome Assembly
                  </CardTitle>
                  <div className="text-xs text-[#3c4f3d]/60">
                    Organism: <span className="font-medium">Human</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
              <Select
                  value={selectedGenome}
                  onValueChange={handleGenomeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-9 w-full border-[#3c4f3d]/10">
                    <SelectValue placeholder="Select genome assembly" />
                  </SelectTrigger>
                  <SelectContent>
                    {genomes.map((genome) => (
                      <SelectItem key={genome.id} value={genome.id}>
                        {genome.id} - {genome.name}
                        {genome.active ? " (active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGenome && (
                  <p className="mt-2 text-xs text-[#3c4f3d]/60">
                    {
                      genomes.find((genome) => genome.id === selectedGenome)
                        ?.sourceName
                    }
                  </p>
                )}
              </CardContent>
              </Card>

      </main>
      
      </div>
  );
}