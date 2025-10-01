import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'ja' | 'en';
  setLanguage: (language: 'ja' | 'en') => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ja',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);
