import { useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { useMyProfile } from '@features/profile/hooks/useMyProfile';
import { ProfileView } from '@widgets/profile/ui/ProfileView';

export function PerfilPage() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { data, isLoading, isFetching, isError, refetch } = useMyProfile();

    useEffect(() => {
        setPageTitle('Perfil');
    }, [setPageTitle]);

    return (
        <ProfileView
            data={data}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            onRetry={() => {
                void refetch();
            }}
        />
    );
}

