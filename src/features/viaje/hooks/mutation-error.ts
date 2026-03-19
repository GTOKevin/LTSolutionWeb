import type { AxiosError } from 'axios';
import type { ToastContextType } from '@/shared/components/ui/Toast/ToastContext';
import type { ToastAction } from '@/shared/constants/toast.constants';
import type { ApiError } from '@/shared/api/http';
import { logger } from '@/shared/utils/logger';

export type ViajeMutationError = AxiosError<ApiError & { message?: string }>;

export const getErrorMessage = (error: ViajeMutationError) =>
    error.response?.data?.message || error.response?.data?.detail;

export const notifyMutationError = (
    showToast: ToastContextType['showToast'],
    entity: string,
    action: ToastAction,
    error: ViajeMutationError,
    logContext?: string
) => {
    const message = getErrorMessage(error);
    showToast({ entity, action, isError: true, message });
    if (message) {
        logger.error(logContext ?? `Validation error (${entity}):`, message);
    }
};

export const notifyGenericError = (
    showToast: ToastContextType['showToast'],
    entity: string,
    message: string,
    error: unknown,
    logContext: string
) => {
    logger.error(logContext, error);
    showToast({ entity, action: 'error', isError: true, message });
};

