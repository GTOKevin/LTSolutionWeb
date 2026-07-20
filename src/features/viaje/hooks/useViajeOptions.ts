import { useViajeCatalogOptions } from '../options/hooks/useViajeCatalogOptions';
import { useViajeOperationalOptions } from '../options/hooks/useViajeOperationalOptions';
import { useViajeResourceOptions } from '../options/hooks/useViajeResourceOptions';

export function useViajeOptions(enabled: boolean = true) {
    const resources = useViajeResourceOptions(enabled);
    const catalogs = useViajeCatalogOptions(enabled);
    const operational = useViajeOperationalOptions(enabled, catalogs);

    return {
        ...resources,
        ...catalogs,
        ...operational,
    };
}
