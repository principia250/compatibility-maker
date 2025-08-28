import { useUserStore } from '@/stores/user-store';

/**
 * ユーザー情報とユーザー関連の操作を提供するカスタムフック
 */
export const useUser = () => {
  const store = useUserStore();
  
  return {
    // ユーザー情報
    user: store.user,
    isLoading: store.isLoading,
    error: store.error,
    
    // 状態チェック用のヘルパー
    isAuthenticated: !!store.user,
    hasError: !!store.error,
    
    // アクション
    fetchUser: store.fetchUser,
    logout: store.logout,
    clearUser: store.clearUser,
    
    // 詳細情報
    username: store.user?.username || '',
    authUserId: store.user?.authUserId || '',
    userId: store.user?.id || '',
  };
};
