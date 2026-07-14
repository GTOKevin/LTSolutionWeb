import { isAxiosError, type AxiosError } from 'axios';
import type { ToastContextType } from '@/shared/components/ui/Toast/ToastContext';
import type { ToastAction } from '@/shared/constants/toast.constants';
import type { ApiError } from '@/shared/api/http';
import { logger } from '@/shared/utils/logger';

const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error al procesar la solicitud.';
const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.';

export type ApiMutationError = AxiosError<ApiError>;

export const isApiMutationError = (error: unknown): error is ApiMutationError =>
    isAxiosError<ApiError>(error);

export const getApiError = (error: unknown): ApiError | undefined =>
    isApiMutationError(error) ? error.response?.data : undefined;

export const getErrorMessage = (
    error: unknown,
    fallbackMessage: string = DEFAULT_ERROR_MESSAGE
) => {
    if (!isApiMutationError(error)) {
        return fallbackMessage;
    }

    if (!error.response) {
        return NETWORK_ERROR_MESSAGE;
    }

    const apiError = error.response.data;

    if (typeof apiError?.errors === 'string' && apiError.errors.trim().length > 0) {
        return apiError.errors;
    }

    return apiError?.message || apiError?.detail || fallbackMessage;
};

export const getErrorStatus = (error: unknown) =>
    isApiMutationError(error) ? error.response?.status : undefined;

export const notifyMutationError = (
    showToast: ToastContextType['showToast'],
    entity: string,
    action: ToastAction,
    error: unknown,
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
