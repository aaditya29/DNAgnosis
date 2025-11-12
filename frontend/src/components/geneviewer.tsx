"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchGeneDetails, fetchGeneSequence as apiFetchGeneSequence,
  type GeneFromSearch, type GeneDetailsFromSearch, type GeneBounds } from "~/utils/genome-api";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { set } from "zod/v4";


export default function GeneViewer({
    gene,
    genomeId,
    onClose,
  }: {
    gene: GeneFromSearch;
    genomeId: string;
    onClose: () => void;
  }){
    const [geneSequence, setGeneSequence] = useState("");
    const [geneDetail, setGeneDetail] = useState<GeneDetailsFromSearch | null>(null);
    const [geneBounds, setGeneBounds] = useState<GeneBounds | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startPosition, setStartPosition] = useState<string>("");
    const [endPosition, setEndPosition] = useState<string>("");
    const [isLoadingSequence, setIsLoadingSequence] = useState(false);
    const [actualRange, setActualRange] = useState<{
      start: number;
      end: number;
    } | null>(null);// Actual range of fetched sequence
    const fetchGeneSequence = useCallback(
      async (start: number, end: number) => {
        try {
          setIsLoadingSequence(true);
          setError(null);
  
          const {
            sequence,
            actualRange: fetchedRange,
            error: apiError,
          } = await apiFetchGeneSequence(gene.chrom, start, end, genomeId);
  
          setGeneSequence(sequence);
          setActualRange(fetchedRange);
  
          if (apiError) {
            setError(apiError);
          }
        } catch (err) {
          setError("Failed to load sequence data");
        } finally {
          setIsLoadingSequence(false);
        }
      },
      [gene.chrom, genomeId],
    );

    useEffect(() => {
      const initializeGeneData = async () =>{
        setIsLoading(true);
        setError(null);
        setGeneDetail(null);
        setStartPosition("");
        setEndPosition("");
        if (!gene.gene_id) {
          setError("Can Not Fetch Details Because Gene ID is Missing");
          setIsLoading(false);
          return;
        }
        try{ 
          const {
            geneDetails: fetchedDetail,
            geneBounds: fetchedGeneBounds,
            initialRange: fetchedRange,
          } = await fetchGeneDetails(gene.gene_id);
  
          setGeneDetail(fetchedDetail);
          setGeneBounds(fetchedGeneBounds);
  
          if (fetchedRange) {
            setStartPosition(String(fetchedRange.start));
            setEndPosition(String(fetchedRange.end));
            await fetchGeneSequence(fetchedRange.start, fetchedRange.end);
          }
        }
        catch {
          setError("Error Fetching Gene Details. Please Try Again.");
        } finally{
           setIsLoading(false);
        }
      }
      initializeGeneData();
    }, [gene, genomeId]);
    return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-[#3c4f3d] hover:bg-[#e9eeea]/70"
            onClick={onClose}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to results
          </Button>
          </div>
    );    
  }