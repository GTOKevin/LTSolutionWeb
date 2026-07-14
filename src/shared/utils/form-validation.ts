import type { UseFormSetError, Path } from 'react-hook-form';
import type { ApiError, ValidationError } from '@/shared/model/types';
import { getErrorMessage } from '@/shared/utils/api-errors';

/**
 * Maps backend validation errors to react-hook-form errors.
 * 
 * @param error The error object returned from the API (axios error or unknown).
 * @param setError The setError function from react-hook-form.
 * @returns A string message if there's a general error, or null if all errors were mapped to fields.
 */
type AxiosLikeError = {
    response: {
        data: ApiError;
        status: number;
    };
};

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
    if (!error || typeof error !== 'object' || !('response' in error)) {
        return false;
    }

    const response = error.response;

    return !!response && typeof response === 'object' && 'data' in response && 'status' in response;
}

export const handleBackendErrors = <T extends Record<string, unknown>>(
    error: unknown,
    setError: UseFormSetError<T>
): string | null => {
    if (!isAxiosLikeError(error)) {
        return getErrorMessage(error, 'Ocurrió un error inesperado.');
    }

    const apiError = error.response.data;
    
    // Check if it's a validation error response
    if (error.response.status === 400 && apiError?.errors && Array.isArray(apiError.errors)) {
        let hasFieldErrors = false;
        const modelErrors: string[] = [];

        apiError.errors.forEach((err: ValidationError) => {
            if (!err.message) {
                return;
            }

            if (err.field) {
                const parts = err.field.split('.');
                const propertyName = parts[parts.length - 1];
                const camelCaseName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);

                // Use 'as Path<T>' if strictly typed
                setError(camelCaseName as Path<T>, {
                    type: 'server',
                    message: err.message
                }, { shouldFocus: true });

                hasFieldErrors = true;
                return;
            }

            modelErrors.push(err.message);
        });

        if (modelErrors.length > 0) {
            return Array.from(new Set(modelErrors)).join('\n');
        }

        if (hasFieldErrors) {
            return null; 
        }
    }

    // Fallback to the normalized backend message/detail
    if (error.response.status >= 400 && error.response.status < 500) {
        return getErrorMessage(error);
    }
    
    return getErrorMessage(error);
};
