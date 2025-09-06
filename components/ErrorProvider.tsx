"use client";

import React from 'react';
import { useError } from '@/hooks/use-error';
import ErrorDialog from '@/components/dialogs/general/ErrorDialog';

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { errors, removeError } = useError();
  
  // 最初のエラーを表示（複数エラーがある場合は最初のもののみ）
  const currentError = errors[0];

  const handleClose = () => {
    // エラー固有のonCloseがあれば実行
    if (currentError.onClose) {
      currentError.onClose();
    }
    // エラーをstoreから削除
    removeError(currentError.id);
  };

  return (
    <>
      {children}
      {currentError && (
        <ErrorDialog
          isOpen={true}
          onClose={handleClose}
          message={currentError.message}
        />
      )}
    </>
  );
};

export default ErrorProvider;
