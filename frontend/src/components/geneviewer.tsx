import { type GeneFromSearch } from "~/utils/genome-api";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";


export default function GeneViewer({
    gene,
    genomeId,
    onClose,
  }: {
    gene: GeneFromSearch;
    genomeId: string;
    onClose: () => void;
  }){
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