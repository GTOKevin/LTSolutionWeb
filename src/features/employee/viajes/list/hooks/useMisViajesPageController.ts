import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { APP_PATHS, buildAppDetailPath } from '@shared/config/app-routes';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { MiViajeFilters } from '@entities/employee/model/types';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';
import { ROWS_PER_PAGE_OPTIONS } from '@shared/constants/constantes';
import { useLayoutStore } from '@shared/store/layout.store';

export function useMisViajesPageController() {
    const navigate = useNavigate();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
    const [search, setSearch] = useState('');
    const [desde, setDesde] = useState(getFirstDayOfCurrentMonthISO());
    const [hasta, setHasta] = useState(getLastDayOfCurrentMonthISO());
    const [filters, setFilters] = useState<Omit<MiViajeFilters, 'page' | 'size'>>({
        search: '',
        desde: getFirstDayOfCurrentMonthISO(),
        hasta: getLastDayOfCurrentMonthISO(),
    });

    useEffect(() => {
        setPageTitle('Mis Viajes');
    }, [setPageTitle]);

    const queryFilters = useMemo<MiViajeFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const { data, isFetching, isLoading } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajes(queryFilters),
        queryFn: () => employeePortalApi.getMyViajes(queryFilters),
    });

    const totals = useMemo(() => {
        const items = data?.items ?? [];

        return {
            total: data?.total ?? 0,
            totalVisible: items.length,
            cerrados: items.filter((item) => item.cerrado).length,
            abiertos: items.filter((item) => !item.cerrado).length,
        };
    }, [data]);

    const handleSearch = () => {
        setPage(0);
        setFilters({
            search: search.trim() || undefined,
            desde: desde || undefined,
            hasta: hasta || undefined,
        });
    };

    const handleNavigate = (id: number) => {
        navigate(buildAppDetailPath(APP_PATHS.misViajes, id));
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
        data,
        desde,
        hasta,
        handleChangePage,
        handleChangeRowsPerPage,
        handleNavigate,
        handleSearch,
        isFetching,
        isLoading,
        page,
        rowsPerPage,
        search,
        setDesde,
        setHasta,
        setSearch,
        totals,
    };
}
