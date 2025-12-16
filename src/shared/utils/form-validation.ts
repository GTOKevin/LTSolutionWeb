import type { UseFormSetError } from 'react-hook-form';
import type { ApiError, ValidationError } from '../api/types';

/**
 * Maps backend validation errors to react-hook-form errors.
 * 
 * @param error The error object returned from the API (axios error).
 * @param setError The setError function from react-hook-form.
 * @returns A string message if there's a general error, or null if all errors were mapped to fields.
 */
export const handleBackendErrors = <T extends Record<string, any>>(
    error: any,
    setError: UseFormSetError<T>
): string | null => {
    const apiError = error as ApiError;
    // Check if it's a validation error response
    if (apiError?.status === 400 && apiError?.errors && Array.isArray(apiError.errors)) {
        let hasFieldErrors = false;

        apiError.errors.forEach((err: ValidationError) => {
            if (err.field && err.message) {

                
                const parts = err.field.split('.');
                const propertyName = parts[parts.length - 1];
                
                const camelCaseName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);

                setError(camelCaseName as any, {
                    type: 'server',
                    message: err.message
                }, { shouldFocus: true });

                hasFieldErrors = true;
            }
        });

        if (hasFieldErrors) {
            return null; 
        }
    }

    // Fallback to detail message or generic message
    if(apiError.status>400 && apiError.status<500){
    return error?.detail || 'Ocurrió un error al procesar la solicitud.';
    }
    
    return 'Ocurrió un error al procesar la solicitud.';
};
