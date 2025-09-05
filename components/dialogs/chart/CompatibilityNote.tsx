"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COMPABILITY_COLOR } from "@/constants/compability-color";
import { ArrowRightIcon } from "lucide-react";

interface CompatibilityNoteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leftElementName: string;
  rightElementName: string;
  score: number;
  scoreNotation: string;
  note: string;
}

export function CompatibilityNoteDialog({ 
  open, 
  onOpenChange, 
  leftElementName, 
  rightElementName, 
  score, 
  scoreNotation, 
  note 
}: CompatibilityNoteProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
            <div className="text-base sm:text-lg font-bold break-all">
                {leftElementName}
            </div>
            <div className="flex flex-row gap-2">
                <ArrowRightIcon 
                className="size-4 sm:size-6" 
                style={{
                    color: COMPABILITY_COLOR[score.toString() as keyof typeof COMPABILITY_COLOR],
                }}
                />
            </div>
            <div className="text-base sm:text-lg font-bold break-all">
                {rightElementName}
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <div>
                score: {scoreNotation} ({score > 0 ? '+' : ''}{score} pt)
            </div>
            <div>
                note:
            </div>
            <div className="mt-2 w-full border border-white rounded-md p-2 max-h-60 overflow-y-auto">
                {note}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
