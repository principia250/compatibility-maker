import { create } from 'zustand';

export interface ErrorItem {
  id: string;
  message: string;
  timestamp: number;
  onClose?: () => void;
}

interface ErrorState {
  errors: ErrorItem[];

  // Actions
  addError: (message: string, onClose?: () => void) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
}

export const useErrorStore = create<ErrorState>()((set, get) => ({
  errors: [],

  addError: (message: string, onClose?: () => void) => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const error: ErrorItem = {
      id,
      message,
      timestamp: Date.now(),
      onClose,
    };

    set((state) => ({
      errors: [...state.errors, error],
    }));
  },

  removeError: (id: string) => {
    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
    }));
  },

  clearAllErrors: () => {
    set({ errors: [] });
  },
}));
