import { useState, useEffect } from 'react';

// チュートリアルの種類を定義
export type TutorialType =
  | 'how-to-use'
  | 'chart-creation'
  | 'compatibility-editing'
  | 'search-features';

// 各チュートリアル種類に対応するローカルストレージキー
const TUTORIAL_STORAGE_KEYS: Record<TutorialType, string> = {
  'how-to-use': 'tutorial_how_to_use_completed',
  'chart-creation': 'tutorial_chart_creation_completed',
  'compatibility-editing': 'tutorial_compatibility_editing_completed',
  'search-features': 'tutorial_search_features_completed',
};

// 特定のチュートリアル種類を管理するフック
export const useTutorial = (tutorialType: TutorialType) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const storageKey = TUTORIAL_STORAGE_KEYS[tutorialType];

  useEffect(() => {
    // ローカルストレージから完了状態を取得
    const completed = localStorage.getItem(storageKey) === 'true';
    setIsCompleted(completed);
    setIsLoading(false);
  }, [storageKey]);

  const markCompleted = () => {
    localStorage.setItem(storageKey, 'true');
    setIsCompleted(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(storageKey);
    setIsCompleted(false);
  };

  return {
    isCompleted,
    isLoading,
    markCompleted,
    resetTutorial,
  };
};
