import { create } from 'zustand';
import { fetchUserData } from '@/actions/core/auth/fetch';
import { createClient } from '@/lib/supabase/client';

export interface User {
  id: string;
  authUserId: string;
  username: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearUser: () => void;
  updateUsername: (newUsername: string) => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  isLoading: true, // 初期状態はローディング中
  error: null,

  setUser: (user) => set({ user, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  fetchUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        // 認証エラーの場合はログインしていない状態として扱う
        console.warn('認証エラー:', authError.message);
        set({ user: null, isLoading: false, error: null });
        return;
      }

      if (!authUser) {
        set({ user: null, isLoading: false, error: null });
        return;
      }

      // Server Actionを使用してusersテーブルからユーザー名を取得
      const userData = await fetchUserData({ id: authUser.id });

      if (userData.error !== null) {
        // ユーザーデータ取得エラーの場合もログインしていない状態として扱う
        console.warn('ユーザーデータ取得エラー:', userData.error.message);
        set({ user: null, isLoading: false, error: null });
        return;
      }

      const user: User = {
        id: userData.data?.id || '',
        authUserId: authUser.id,
        username: userData.data?.username || '',
      };

      set({ user, isLoading: false, error: null });
    } catch (error) {
      // 予期しないエラーの場合のみエラーとして扱う
      console.error('予期しないエラー:', error);
      set({
        user: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'ユーザー情報の取得に失敗しました',
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      set({ user: null, isLoading: false, error: null });

      // ページをリロードしてホームに遷移
      window.location.href = '/';
    } catch (error) {
      console.error('ログアウトエラー:', error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'ログアウトに失敗しました',
      });
    }
  },

  clearUser: () => set({ user: null, error: null, isLoading: false }),

  updateUsername: (newUsername: string) => {
    const { user } = get();
    if (user) {
      set({
        user: { ...user, username: newUsername },
        error: null,
      });
    }
  },
}));
