import { createContext } from 'react';
import type { ToastAction } from '@/shared/constants/toast.constants';

export interface ToastOptions {
    title?: string; // Optional manual override
    message?: string; // Optional manual override
    entity?: string; // For auto-generation
    action?: ToastAction; // For auto-generation
    severity?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    isError?: boolean; // To trigger error messages for actions
}

export interface ToastContextType {
    showToast: (options: ToastOptions) => void;
    hideToast: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

