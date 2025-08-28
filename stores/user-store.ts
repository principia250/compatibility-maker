import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error, isLoading: false }),

      fetchUser: async () => {
        const { isLoading } = get();
        if (isLoading) return; // 重複リクエストを防ぐ

        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

          if (authError) {
            throw new Error(authError.message);
          }

          if (!authUser) {
            set({ user: null, isLoading: false });
            return;
          }

          // Server Actionを使用してusersテーブルからユーザー名を取得
          const userData = await fetchUserData({ id: authUser.id });

          if (userData.error !== null) {
            throw new Error(userData.error.message);
          }

          const user: User = {
            id: userData.data?.id || '',
            authUserId: authUser.id,
            username: userData.data?.username || ''
          };

          set({ user, isLoading: false, error: null });

        } catch (error) {
          console.error('ユーザー取得エラー:', error);
          set({ 
            user: null, 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'ユーザー情報の取得に失敗しました'
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
          set({ user: null, isLoading: false, error: null });
        } catch (error) {
          console.error('ログアウトエラー:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'ログアウトに失敗しました'
          });
        }
      },

      clearUser: () => set({ user: null, error: null, isLoading: false })
    }),
    {
      name: 'user-storage', // localStorage のキー名
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user // userのみを永続化、isLoadingやerrorは永続化しない
      }),
    }
  )
);
