import { useAuthStore } from '@shared/store/auth.store';
import { useMyProfile } from './useMyProfile';

export function useEmployeeAssociation() {
    const user = useAuthStore((state) => state.user);
    const tokenEsColaborador = user?.esColaborador;
    const hasTokenClaim = typeof tokenEsColaborador === 'boolean';

    const profileQuery = useMyProfile({ enabled: !hasTokenClaim });

    if (typeof tokenEsColaborador === 'boolean') {
        return {
            isEmployee: tokenEsColaborador,
            isEmployeeLoading: false,
            isEmployeeError: false,
            retryProfile: () => undefined,
        };
    }

    return {
        isEmployee: profileQuery.data?.usuario.tieneColaboradorAsociado ?? false,
        isEmployeeLoading: profileQuery.isLoading,
        isEmployeeError: profileQuery.isError,
        retryProfile: () => void profileQuery.refetch(),
    };
}
