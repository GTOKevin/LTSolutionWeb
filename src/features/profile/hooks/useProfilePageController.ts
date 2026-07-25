import { useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { useMyProfile } from './useMyProfile';

export function useProfilePageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const profileQuery = useMyProfile();

    useEffect(() => {
        setPageTitle('Perfil');
    }, [setPageTitle]);

    return profileQuery;
}
