import { useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { useDashboardOverview } from './useDashboardOverview';

export function useDashboardPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const overview = useDashboardOverview();

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return overview;
}
