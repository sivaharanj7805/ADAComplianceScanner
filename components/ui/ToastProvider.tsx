'use client';

import { createContext, useContext } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import ToastContainer from './ToastContainer';

type ToastContextType = ReturnType<typeof useToast>;

const ToastContext = createContext<ToastContextType | null>(null);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.removeToast} />
    </ToastContext.Provider>
  );
}
