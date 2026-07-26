import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLayoutStore } from '@shared/store/layout.store';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { MiLicenciaEstadoRevision, MiLicenciaFilters } from '@entities/employee/model/types';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';

export function useMisLicenciasPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const canSolicitarLicencia = usePermission(PERMISSIONS.EMPLOYEE.LICENCIAS.SOLICITAR);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [tipoLicenciaID, setTipoLicenciaID] = useState<number | ''>('');
    const [estadoRevision, setEstadoRevision] = useState<MiLicenciaEstadoRevision | ''>('');
    const [desde, setDesde] = useState(getFirstDayOfCurrentMonthISO(-1));
    const [hasta, setHasta] = useState(getLastDayOfCurrentMonthISO());
    const [filters, setFilters] = useState<Omit<MiLicenciaFilters, 'page' | 'size'>>({
        desde: getFirstDayOfCurrentMonthISO(-1),
        hasta: getLastDayOfCurrentMonthISO(),
    });
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        setPageTitle('Mis Licencias');
    }, [setPageTitle]);

    const { data: tiposLicencia } = useQuery({
        queryKey: ['employee-portal', 'tipos-licencia'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.LICENCIA),
    });

    const queryFilters = useMemo<MiLicenciaFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const { data, isFetching, isLoading } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.licencias(queryFilters),
        queryFn: () => employeePortalApi.getMyLicencias(queryFilters),
    });

    const licenciaStats = useMemo(() => {
        const items = data?.items ?? [];
        return {
            total: data?.total ?? 0,
            visibleCount: items.length,
            pendingVisible: items.filter((item) => item.aceptado == null).length,
            approvedVisible: items.filter((item) => item.aceptado === true).length,
        };
    }, [data]);

    const handleSearch = () => {
        setPage(0);
        setFilters({
            tipoLicenciaID: tipoLicenciaID === '' ? undefined : Number(tipoLicenciaID),
            estadoRevision: estadoRevision === '' ? undefined : estadoRevision,
            desde: desde || undefined,
            hasta: hasta || undefined,
        });
    };

    const handleChangePage = (_: unknown, nextPage: number) => {
        setPage(nextPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    return {
        canSolicitarLicencia,
        data,
        desde,
        dialogOpen,
        estadoRevision,
        handleChangePage,
        handleChangeRowsPerPage,
        handleSearch,
        hasta,
        isFetching,
        isLoading,
        licenciaStats,
        page,
        rowsPerPage,
        setDesde,
        setDialogOpen,
        setEstadoRevision,
        setHasta,
        setTipoLicenciaID,
        tipoLicenciaID,
        tiposLicencia,
    };
}
