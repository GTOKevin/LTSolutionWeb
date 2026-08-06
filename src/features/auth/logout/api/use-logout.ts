import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@entities/auth/api/auth.api';
import { APP_PATHS } from '@shared/config/app-routes';
import { useToast } from '@shared/components/ui/Toast';
import { getErrorMessage, getErrorStatus } from '@shared/utils/api-errors';
import { resetSessionClientState } from '@app/session/lib/reset-session-client-state';

interface UseLogoutOptions {
    forceLocalOnError?: boolean;
    showSuccessToast?: boolean;
}

export function useLogout(options?: UseLogoutOptions) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const showSuccessToast = options?.showSuccessToast ?? true;
    const forceLocalOnError = options?.forceLocalOnError ?? false;

    const finalizeLogout = () => {
        resetSessionClientState(queryClient);
        navigate(APP_PATHS.login, { replace: true });
    };

    return useMutation<void, unknown, void>({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            finalizeLogout();

            if (showSuccessToast) {
                showToast({ message: 'Sesión cerrada correctamente.', severity: 'success' });
            }
        },
        onError: (error) => {
            const status = getErrorStatus(error);

            if (status === 401 || forceLocalOnError) {
                finalizeLogout();
                return;
            }

            showToast({
                message: getErrorMessage(error, 'No se pudo cerrar sesión. Inténtalo nuevamente.'),
                severity: 'error',
            });
        },
    });
}
