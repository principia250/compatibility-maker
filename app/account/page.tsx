"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useError } from "@/hooks/use-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountDialog } from "@/components/dialogs/auth/DeleteAccountDialog";
import { updateUsername as updateUsernameAction, deleteAccount } from "@/actions/account";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/components/loading";
import CustomLink from "@/components/CustomLink";
import { useTranslation } from '@/lib/i18n';

export default function AccountPage() {
    const { user, username, fetchUser, logout, updateUsername, isLoading, isAuthenticated } = useUser();
    const { addError } = useError();
    const [newUsername, setNewUsername] = useState(username || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoadingState, setIsLoadingState] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useTranslation();

    useEffect(() => {
        if(isLoading || user) {
            setIsLoadingState(false)
        }
    },[isLoading])

    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) {
            setError("Enter new username");
            return;
        }

        if (newUsername === username) {
            setError("The current username is the same");
            return;
        }

        setIsUpdating(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await updateUsernameAction({ username: newUsername.trim() }) as any;
            if (result && result.error) {
                addError(result.error.message);
                return;
            }

            setSuccess("Username updated");
            updateUsername(newUsername.trim()); // storeを直接更新
        } catch (err) {
            addError("Failed to update username");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const { error } = await deleteAccount();
            if (error) {
                addError(error.message);
                return;
            }

            // アカウント削除成功時はログアウトしてトップページにリダイレクト
            await logout();
            router.push("/");
        } catch (err) {
            addError("Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading || isLoadingState || !user) {
        return <Loading />;
    }

    if(!isLoading && !isLoadingState && !isAuthenticated) {
    redirect("/auth/login")
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Account</h1>
                </div>

                {/* ユーザー名変更 */}
                {/* <Card>
                    <CardHeader>
                        <CardTitle>Username</CardTitle>
                        <CardDescription>
                            Current username: <span className="font-medium">{username}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">New username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                                maxLength={50}
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}
                        
                        {success && (
                            <div className="text-green-600 text-sm">{success}</div>
                        )}

                        <Button 
                            onClick={handleUpdateUsername}
                            disabled={isUpdating || !newUsername.trim() || newUsername === username}
                        >
                            {isUpdating ? "Updating..." : "Update username"}
                        </Button>
                    </CardContent>
                </Card> */}

                {/* パスワード変更 */}
                <Card>
                    <CardContent>
                        <CustomLink href="/auth/update-password">Update password</CustomLink>
                    </CardContent>
                </Card>

                {/* アカウント削除 */}
                <Card className="border-red-600">
                    <CardHeader>
                        <CardTitle className="text-red-600">Dangerous operation</CardTitle>
                        <CardDescription>
                            {t(
                                "アカウントを削除すると、すべてのデータが永久に削除され、復元できません。", 
                                "Deleting your account will permanently delete all your data and cannot be restored."
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DeleteAccountDialog 
                            isDeleting={isDeleting}
                            onDelete={handleDeleteAccount}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
