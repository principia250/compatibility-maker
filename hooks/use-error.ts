import { useErrorStore } from '@/stores/error-store';

export const useError = () => {
  const { addError, removeError, clearAllErrors, errors } = useErrorStore();

  return {
    addError: (message: string, onClose?: () => void) =>
      addError(message, onClose),
    removeError,
    clearAllErrors,
    errors,
    hasErrors: errors.length > 0,
  };
};
