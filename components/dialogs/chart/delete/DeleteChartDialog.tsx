"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface DeleteChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartTitle: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteChartDialog({
  open,
  onOpenChange,
  chartTitle,
  onConfirm,
  isDeleting = false
}: DeleteChartDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Chart
          </DialogTitle>
          <DialogDescription>
            {t(
              `本当に"${chartTitle}"を削除しますか？ この操作は取り消せません。`,
              `Are you sure you want to delete "${chartTitle}"? This action cannot be undone.`
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
