'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMPABILITY_NOTATION } from '@/constants/compability-notation';
import clsx from 'clsx';

interface CompatibilityOption {
  value: number | null;
  symbol: string;
}

const COMPATIBILITY_OPTIONS: CompatibilityOption[] = [
  { value: null, symbol: 'None' },
  { value: -2, symbol: COMPABILITY_NOTATION['-2'] },
  { value: -1, symbol: COMPABILITY_NOTATION['-1'] },
  { value: 0, symbol: COMPABILITY_NOTATION['0'] },
  { value: 1, symbol: COMPABILITY_NOTATION['1'] },
  { value: 2, symbol: COMPABILITY_NOTATION['2'] },
];

interface EditCompatibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leftNodeName: string;
  leftCategoryName: string;
  rightCategoryName: string;
  rightNodes: Array<{
    id: string;
    name: string;
  }>;
  compatibilities: Array<{
    rightElementId: string;
    compatibilityScore: number | null;
    reverseCompatibilityScore: number | null;
    note?: string;
  }>;
  onSave: (
    compatibilities: Array<{
      rightElementId: string;
      compatibilityScore: number | null;
      reverseCompatibilityScore: number | null;
      note?: string;
    }>
  ) => void;
  onLeftNodeNameChange?: (newName: string) => void;
  onDelete?: () => void;
}

export const EditCompatibilityDialog = ({
  open,
  onOpenChange,
  leftNodeName,
  leftCategoryName,
  rightCategoryName,
  rightNodes,
  compatibilities,
  onSave,
  onLeftNodeNameChange,
  onDelete,
}: EditCompatibilityDialogProps) => {
  const [localCompatibilities, setLocalCompatibilities] = useState<
    Array<{
      rightElementId: string;
      compatibilityScore: number | null;
      reverseCompatibilityScore: number | null;
      note?: string;
    }>
  >([]);
  const [localLeftNodeName, setLocalLeftNodeName] = useState(leftNodeName);

  // 初期化時に既存の相性データを設定
  useEffect(() => {
    const initialCompatibilities = rightNodes.map((rightNode) => {
      const existing = compatibilities.find(
        (c) => c.rightElementId === rightNode.id
      );
      return {
        rightElementId: rightNode.id,
        compatibilityScore: existing?.compatibilityScore ?? null,
        reverseCompatibilityScore: existing?.reverseCompatibilityScore ?? null,
        note: existing?.note ?? '',
      };
    });
    setLocalCompatibilities(initialCompatibilities);
    setLocalLeftNodeName(leftNodeName);
  }, [rightNodes, compatibilities, open, leftNodeName]);

  const handleCompatibilityChange = (
    rightElementId: string,
    score: number | null
  ) => {
    setLocalCompatibilities((prev) =>
      prev.map((comp) =>
        comp.rightElementId === rightElementId
          ? {
              ...comp,
              compatibilityScore: score,
              reverseCompatibilityScore: score ? -score : 0,
            }
          : comp
      )
    );
  };

  const handleNoteChange = (rightElementId: string, note: string) => {
    setLocalCompatibilities((prev) =>
      prev.map((comp) =>
        comp.rightElementId === rightElementId ? { ...comp, note } : comp
      )
    );
  };

  const handleSave = () => {
    // ノード名が未入力（空白のみ含む）の場合は保存しない
    if (!localLeftNodeName.trim()) {
      return;
    }
    onSave(localCompatibilities);
    if (onLeftNodeNameChange && localLeftNodeName !== leftNodeName) {
      onLeftNodeNameChange(localLeftNodeName);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Compatibility</DialogTitle>
        </DialogHeader>

        {/* コンテンツ部分 */}
        <div className="flex flex-col gap-6">
          {/* Left side */}
          <div className="flex flex-col gap-2">
            <Label className="text-lg font-semibold">{leftCategoryName}</Label>
            <Input
              value={localLeftNodeName}
              onChange={(e) => setLocalLeftNodeName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>

          {/* Right side */}
          <div className="flex flex-col gap-2 flex-1">
            <Label className="text-lg font-semibold">{rightCategoryName}</Label>
            {/* 右側のノード列挙 */}
            <div className="flex-1 max-h-[500px] overflow-y-auto space-y-3 pr-2">
              {rightNodes.map((rightNode) => {
                const compatibility = localCompatibilities.find(
                  (c) => c.rightElementId === rightNode.id
                );
                const currentScore = compatibility?.compatibilityScore ?? null;

                return (
                  <div
                    key={rightNode.id}
                    className={clsx(
                      "border rounded-lg p-2",
                      // 相性が全て設定されていない場合は赤くする
                      currentScore === null ? 'border-red-600' : 'border-white'
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Label className="flex-1">{rightNode.name}</Label>
                      <Select
                        value={
                          currentScore === null
                            ? 'null'
                            : currentScore.toString()
                        }
                        onValueChange={(value) =>
                          handleCompatibilityChange(
                            rightNode.id,
                            value === 'null' ? null : parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPATIBILITY_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value ?? 'null'}
                              value={option.value?.toString() ?? 'null'}
                            >
                              <span className="text-lg">{option.symbol}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-2">
                      <div className="flex flex-col gap-1">
                        <Label className="text-sm">Note</Label>
                        <Input
                          value={compatibility?.note ?? ''}
                          // compatibilityが無い場合はdisabled
                          disabled={!currentScore}
                          onChange={(e) =>
                            handleNoteChange(rightNode.id, e.target.value)
                          }
                          placeholder="Enter note (optional)"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row-reverse justify-center sm:justify-start gap-3">
            <Button onClick={handleSave} disabled={!localLeftNodeName.trim()}>
              Confirm
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete item
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
