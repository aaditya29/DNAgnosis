"use client";

import { get } from "http";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { type GenomeAssemblyFromSearch,
  getAvailableGenomes } from "~/utils/genome-api";

export default function HomePage() {
  const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([]);// Genome data state
  const [error, setError] = useState<string | null>(null);// Error state
  const [isLoading, setIsLoading] = useState(false);// Loading state
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");//default genome
  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes && data.genomes["Human"]) {
          setGenomes(data.genomes["Human"]);
        }
      } catch (err) {
        setError("Genome Data Not Found. Please enter valid genome assembly.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomes();
  }, []);
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
              </Card>

      </main>
      
      </div>
  );
}