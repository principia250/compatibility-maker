"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface DeleteAccountDialogProps {
    isDeleting: boolean;
    onDelete: () => void;
}

export function DeleteAccountDialog({ isDeleting, onDelete }: DeleteAccountDialogProps) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete account"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete account?</DialogTitle>
                    <DialogDescription>
                        {t("この操作はキャンセルできません。アカウントと関連するデータが永久に削除されます。", "This operation cannot be cancelled. Your account and all associated data will be permanently deleted.")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onDelete}
                        variant="destructive"
                    >
                        Delete account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
