"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface AddNodeDialogProps {
    children: React.ReactNode;
    leftSideName: string;
    rightSideName: string;
    defaultSide: "left" | "right";
    handleAddNode: (side: "left" | "right", name: string) => void;
}

export const AddNodeDialog = ({ 
    children,
    leftSideName,
    rightSideName,
    defaultSide,
    handleAddNode,
}: AddNodeDialogProps) => {
    const [name, setName] = useState("");
    const [side, setSide] = useState<"left" | "right">(defaultSide);
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add item</DialogTitle>
                </DialogHeader>

                {/* ノード名入力 */}
                <Label htmlFor="node-name">Item name</Label>
                <Input id="node-name" placeholder="Enter item name..." value={name} onChange={(e) => setName(e.target.value)} />

                {/* サイド選択 */}
                <Label htmlFor="side">Side</Label>
                <Select value={side} onValueChange={(v) => setSide(v as "left" | "right")}> 
                    <SelectTrigger>
                        <SelectValue placeholder={side === "left" ? leftSideName : rightSideName} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="left">{leftSideName}</SelectItem>
                            <SelectItem value="right">{rightSideName}</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* ボタン */}
                <div className="flex flex-col sm:flex-row-reverse justify-center sm:justify-start gap-3">
                    <Button 
                        onClick={() => {
                            handleAddNode(side, name);
                            setOpen(false);
                            setName("");
                            setSide(defaultSide);
                        }} 
                        disabled={!name.trim()}
                    >
                        Add item
                    </Button>
                    <Button variant="outline" onClick={() => { setOpen(false); setName(""); }}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}