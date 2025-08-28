'use client';

import React from 'react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, RefreshCw } from 'lucide-react';

/**
 * Zustandストアを使用したユーザープロファイルコンポーネントの使用例
 */
export const UserProfile: React.FC = () => {
  const { 
    user, 
    isLoading, 
    error, 
    isAuthenticated, 
    username, 
    email, 
    fetchUser, 
    logout 
  } = useUser();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            読み込み中...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">エラー</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchUser} variant="outline">
            再試行
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>未ログイン</CardTitle>
          <CardDescription>ユーザー情報を表示するにはログインしてください。</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          ユーザープロファイル
        </CardTitle>
        <CardDescription>Zustandで管理されたユーザー情報</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">ユーザー名:</span>
          <span>{username}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">メールアドレス:</span>
          <span>{email}</span>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button onClick={fetchUser} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
          <Button onClick={logout} variant="destructive" size="sm">
            ログアウト
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
