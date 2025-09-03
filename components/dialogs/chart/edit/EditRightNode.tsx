"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditRightNodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rightCategoryName: string;
    initialNodeName: string;
    onRename: (newName: string) => void;
    onDelete: () => void;
}

export const EditRightNodeDialog = ({
    open,
    onOpenChange,
    rightCategoryName,
    initialNodeName,
    onRename,
    onDelete,
}: EditRightNodeDialogProps) => {
    const [name, setName] = useState<string>(initialNodeName);

    useEffect(() => {
        if (open) {
            setName(initialNodeName);
        }
    }, [open, initialNodeName]);

    const handleRename = () => {
        if (!name.trim()) return;
        onRename(name);
        onOpenChange(false);
    };

    const handleDelete = () => {
        onDelete();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-lg font-semibold">{rightCategoryName}</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter item name"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row-reverse justify-center sm:justify-start gap-3">
                    <Button onClick={handleRename} disabled={!name.trim()}>
                        Rename
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
