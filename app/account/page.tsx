"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountDialog } from "@/components/dialogs/auth/DeleteAccountDialog";
import { updateUsername as updateUsernameAction, deleteAccount } from "@/actions/account";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import CustomLink from "@/components/CustomLink";

export default function AccountPage() {
    const { user, username, fetchUser, logout, updateUsername } = useUser();
    const [newUsername, setNewUsername] = useState(username || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

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
                setError(result.error.message);
                return;
            }

            setSuccess("Username updated");
            updateUsername(newUsername.trim()); // storeを直接更新
        } catch (err) {
            setError("Failed to update username");
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
                setError(error.message);
                return;
            }

            // アカウント削除成功時はログアウトしてトップページにリダイレクト
            await logout();
            router.push("/");
        } catch (err) {
            setError("Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) {
        return <Loading />;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Account</h1>
                </div>

                {/* ユーザー名変更 */}
                <Card>
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
                </Card>

                {/* パスワード変更 */}
                <div>
                    <CustomLink href="/auth/update-password">Update password</CustomLink>
                </div>

                {/* アカウント削除 */}
                <Card className="border-red-600">
                    <CardHeader>
                        <CardTitle className="text-red-600">Dangerous operation</CardTitle>
                        <CardDescription>
                            Deleting your account will permanently delete all your data and cannot be restored.
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
