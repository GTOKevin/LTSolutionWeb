import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { APP_PATHS, buildAppDetailPath } from '@shared/config/app-routes';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { MiViajeFilters } from '@entities/employee/model/types';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';
import { ROWS_PER_PAGE_OPTIONS } from '@shared/constants/constantes';
import { useLayoutStore } from '@shared/store/layout.store';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useToast } from '@shared/components/ui/Toast/useToast';
import { getErrorMessage } from '@shared/utils/api-errors';
import { useViajeCatalogOptions } from '@features/viaje/options/hooks/useViajeCatalogOptions';
import {
    canEmployeeViajeEditFechaLlegada,
    getEmployeeViajeQuickActionLabel,
    isEmployeeViajeWorkflowBlocked,
    resolveEmployeeViajeNextEstadoId,
} from '../../model/workflow';

export function useMisViajesPageController() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const canManageViajes = usePermission(PERMISSIONS.EMPLOYEE.VIAJES.GESTIONAR);
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
    const [selectedViajeId, setSelectedViajeId] = useState<number | null>(null);
    const [quickStatusDialogOpen, setQuickStatusDialogOpen] = useState(false);
    const [quickStatusFechaLlegada, setQuickStatusFechaLlegada] = useState('');
    const [quickStatusFechaLlegadaTouched, setQuickStatusFechaLlegadaTouched] = useState(false);

    useEffect(() => {
        setPageTitle('Mis Viajes');
    }, [setPageTitle]);

    const { estados } = useViajeCatalogOptions(true);

    const queryFilters = useMemo<MiViajeFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const { data, isFetching, isLoading, isError, refetch } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajes(queryFilters),
        queryFn: () => employeePortalApi.getMyViajes(queryFilters),
    });

    const { data: selectedViajeDetail, isLoading: isQuickStatusLoading } = useQuery({
        queryKey: selectedViajeId ? EMPLOYEE_PORTAL_QUERY_KEYS.viajeDetail(selectedViajeId) : ['employee-portal', 'viaje', 'quick-status-empty'],
        queryFn: () => employeePortalApi.getMyViajeById(selectedViajeId!),
        enabled: quickStatusDialogOpen && selectedViajeId !== null,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ viajeId, payload }: { viajeId: number; payload: { estadoId: number; fechaLlegada: string | null } }) =>
            employeePortalApi.updateMyViajeStatus(viajeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Flujo del viaje actualizado correctamente.', severity: 'success' });
        },
        onError: (error: unknown) => {
            showToast({ message: getErrorMessage(error, 'No se pudo actualizar el flujo del viaje.'), severity: 'error' });
        },
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

    const handleOpenQuickStatus = (id: number) => {
        setSelectedViajeId(id);
        setQuickStatusDialogOpen(true);
        setQuickStatusFechaLlegada('');
        setQuickStatusFechaLlegadaTouched(false);
    };

    const handleCloseQuickStatus = () => {
        if (updateStatusMutation.isPending) {
            return;
        }

        setQuickStatusDialogOpen(false);
        setSelectedViajeId(null);
        setQuickStatusFechaLlegada('');
        setQuickStatusFechaLlegadaTouched(false);
    };

    const nextEstadoId = resolveEmployeeViajeNextEstadoId(selectedViajeDetail, estados);
    const nextEstado = estados?.find((item) => item.id === nextEstadoId) ?? null;
    const effectiveQuickStatusFechaLlegada = quickStatusFechaLlegadaTouched
        ? quickStatusFechaLlegada
        : selectedViajeDetail?.fechaLlegada ?? '';

    const handleSaveFechaLlegada = () => {
        if (!selectedViajeId || !selectedViajeDetail) {
            return;
        }

        updateStatusMutation.mutate({
            viajeId: selectedViajeId,
            payload: {
                estadoId: selectedViajeDetail.estadoId,
                fechaLlegada: effectiveQuickStatusFechaLlegada || null,
            },
        });
    };

    const handleAdvanceWorkflow = () => {
        if (!selectedViajeId || !nextEstadoId) {
            return;
        }

        updateStatusMutation.mutate({
            viajeId: selectedViajeId,
            payload: {
                estadoId: nextEstadoId,
                fechaLlegada: effectiveQuickStatusFechaLlegada || null,
            },
        });
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
        canManageViajes,
        data,
        desde,
        hasta,
        getQuickActionLabel: getEmployeeViajeQuickActionLabel,
        handleChangePage,
        handleChangeRowsPerPage,
        handleNavigate,
        handleAdvanceWorkflow,
        handleCloseQuickStatus,
        handleOpenQuickStatus,
        handleSearch,
        handleSaveFechaLlegada,
        hasBlockingError: isError && !data,
        isError,
        isFetching,
        isLoading,
        isQuickStatusLoading,
        isQuickStatusPending: updateStatusMutation.isPending,
        isViajeWorkflowBlocked: isEmployeeViajeWorkflowBlocked,
        page,
        quickStatusActionLabel: getEmployeeViajeQuickActionLabel(selectedViajeDetail),
        quickStatusCanEditFechaLlegada: canEmployeeViajeEditFechaLlegada(selectedViajeDetail),
        quickStatusDialogOpen,
        quickStatusFechaLlegada: effectiveQuickStatusFechaLlegada,
        quickStatusNextEstadoNombre: nextEstado?.text ?? null,
        selectedViajeDetail,
        retryViajesLoad: () => refetch(),
        rowsPerPage,
        search,
        setDesde,
        setHasta,
        setQuickStatusFechaLlegada: (value: string) => {
            setQuickStatusFechaLlegadaTouched(true);
            setQuickStatusFechaLlegada(value);
        },
        setSearch,
        totals,
    };
}
