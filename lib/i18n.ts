'use client';

import { useLanguageStore } from '@/stores/language-store';

// 言語切り替え用のユーティリティ関数（Zustandストアを使用）
export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  
  const t = (jaText: string, enText: string) => {
    return language === 'ja' ? jaText : enText;
  };
  
  return { t, language };
};

// 言語設定を変更する関数
export const changeLanguage = (language: 'ja' | 'en') => {
  useLanguageStore.getState().setLanguage(language);
};
