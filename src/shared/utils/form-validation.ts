import type { UseFormSetError, Path } from 'react-hook-form';
import type { ApiError, ValidationError } from '../model/types';

/**
 * Maps backend validation errors to react-hook-form errors.
 * 
 * @param error The error object returned from the API (axios error or unknown).
 * @param setError The setError function from react-hook-form.
 * @returns A string message if there's a general error, or null if all errors were mapped to fields.
 */
export const handleBackendErrors = <T extends Record<string, any>>(
    error: unknown,
    setError: UseFormSetError<T>
): string | null => {
    // Check if error is an object and has 'response' property (basic Axios error check)
    const isAxiosError = (err: any): err is { response: { data: ApiError; status: number } } => {
        return err && typeof err === 'object' && 'response' in err && 'data' in err.response;
    };

    if (!isAxiosError(error)) {
        return 'Ocurrió un error inesperado.';
    }

    const apiError = error.response.data;
    
    // Check if it's a validation error response
    if (error.response.status === 400 && apiError?.errors && Array.isArray(apiError.errors)) {
        let hasFieldErrors = false;

        apiError.errors.forEach((err: ValidationError) => {
            if (err.field && err.message) {
                const parts = err.field.split('.');
                const propertyName = parts[parts.length - 1];
                const camelCaseName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);

                // Use 'as Path<T>' if strictly typed
                setError(camelCaseName as Path<T>, {
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
    if(error.response.status > 400 && error.response.status < 500){
        return apiError?.detail || 'Ocurrió un error al procesar la solicitud.';
    }
    
    return 'Ocurrió un error al procesar la solicitud.';
};
