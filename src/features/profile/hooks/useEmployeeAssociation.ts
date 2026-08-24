import { useMyProfile } from './useMyProfile';

export function useEmployeeAssociation() {
    const profileQuery = useMyProfile();

    return {
        isEmployee: profileQuery.data?.usuario.tieneColaboradorAsociado ?? false,
        isEmployeeLoading: profileQuery.isLoading,
        isEmployeeError: profileQuery.isError,
        retryProfile: () => void profileQuery.refetch(),
    };
}
