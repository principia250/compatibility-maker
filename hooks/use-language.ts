'use client';

import { useLanguageStore } from '@/stores/language-store';
import { changeLanguage } from '@/lib/i18n';

export const useLanguage = () => {
  const language = useLanguageStore((state) => state.language);
  
  return {
    language,
    changeLanguage,
  };
};
