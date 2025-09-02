"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createChart } from "@/actions/core/chart/mutation";
import { Plus } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface CreateChartProps {
  children: React.ReactNode;
}

export function CreateChart({ children }: CreateChartProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleCancel = () => {
    // 入力を初期化
    setTitle("");
    setIsPublic(true);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !user?.id) {
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await createChart({
        title: title.trim(),
        isPublic,
        userId: user.id
      });

      if (error) {
        console.error('Chart creation error:', error);
        // エラーハンドリング（必要に応じてトースト表示など）
        return;
      }

      if (data) {
        // 入力を初期化
        setTitle("");
        setIsPublic(true);
        setOpen(false);
        
        // 編集ページに遷移
        router.push(`/charts/${data.id}/edit`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Make New Chart
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          {/* チャート名入力 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="chart-title">Chart Name</Label>
            <Input
              id="chart-title"
              placeholder="Enter chart name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* 公開設定 */}
          <div className="flex flex-col gap-3">
            <Label>Visibility</Label>
            <RadioGroup value={isPublic ? "public" : "private"} onValueChange={(value: string) => setIsPublic(value === "public")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">Public (Anyone can view)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Private (Only you can view)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!title.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Chart'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
