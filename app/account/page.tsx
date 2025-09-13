'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useError } from '@/hooks/use-error';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeleteAccountDialog } from '@/components/dialogs/auth/DeleteAccountDialog';
import { deleteAccount } from '@/actions/account';
import { redirect, useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import CustomLink from '@/components/CustomLink';
import { useTranslation } from '@/lib/i18n';

export default function AccountPage() {
  const { user, logout, isLoading, isAuthenticated } = useUser();
  const { addError } = useError();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading || user) {
      setIsLoadingState(false);
    }
  }, [isLoading, user]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const { error } = await deleteAccount();
      if (error) {
        addError(error.message);
        return;
      }

      // アカウント削除成功時はログアウトしてトップページにリダイレクト
      await logout();
      router.push('/');
    } catch {
      addError('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isLoadingState || !user) {
    return <Loading />;
  }

  if (!isLoading && !isLoadingState && !isAuthenticated) {
    redirect('/auth/login');
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
                                maxLength={USERNAME_MAX_LENGTH}
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
            <CustomLink href="/auth/update-password">
              Update password
            </CustomLink>
          </CardContent>
        </Card>

        {/* アカウント削除 */}
        <Card className="border-red-600">
          <CardHeader>
            <CardTitle className="text-red-600">Dangerous operation</CardTitle>
            <CardDescription>
              {t(
                'アカウントを削除すると、すべてのデータが永久に削除され、復元できません。',
                'Deleting your account will permanently delete all your data and cannot be restored.'
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
