import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import type { ViajeFilters as ViajeFiltersType, ViajeListItem } from '@entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';
import { useToast } from '@/shared/components/ui/Toast';
import { useViajeDetailReports } from '../../reports/hooks/useViajeDetailReports';
import { useViajeListReports } from '../../reports/hooks/useViajeListReports';
import { useCerrarViaje } from '../../hooks/useCerrarViaje';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { getErrorMessage, type ApiMutationError } from '@/shared/utils/api-errors';
import { logger } from '@/shared/utils/logger';
import { APP_PATHS, buildAppCreatePath, buildAppDetailPath, buildAppViewPath } from '@shared/config/app-routes';
import { useViajeKanbanColumns } from './useViajeKanbanColumns';
import {
    areViajeListFiltersEqual,
    createDefaultViajeListDraftFilters,
    normalizeViajeListFilters,
    type ViajeListDraftFilters,
} from '../model/filters';

export function useViajesPageController() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const canViewViajes = usePermission(PERMISSIONS.VIAJES.VER);
    const canManageViajes = usePermission(PERMISSIONS.VIAJES.GESTIONAR);
    const canReabrirViajes = usePermission(PERMISSIONS.VIAJES.REABRIR);
    const canCerrarViajes = usePermission(PERMISSIONS.VIAJES.CERRAR);
    const listReports = useViajeListReports();
    const detailReports = useViajeDetailReports();
    const defaultDraftFilters = useMemo(() => createDefaultViajeListDraftFilters(), []);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [draftFilters, setDraftFilters] = useState<ViajeListDraftFilters>(defaultDraftFilters);
    const [appliedFilters, setAppliedFilters] = useState<Omit<ViajeFiltersType, 'page' | 'size'>>(
        () => normalizeViajeListFilters(defaultDraftFilters),
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viajeToDelete, setViajeToDelete] = useState<ViajeListItem | null>(null);
    const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
    const [viajeToReopen, setViajeToReopen] = useState<ViajeListItem | null>(null);
    const [cerrarDialogOpen, setCerrarDialogOpen] = useState(false);
    const [viajeToCerrar, setViajeToCerrar] = useState<ViajeListItem | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

    const queryFilters = useMemo<ViajeFiltersType>(() => ({
        ...appliedFilters,
        page: page + 1,
        size: rowsPerPage,
    }), [appliedFilters, page, rowsPerPage]);

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.listPage(page, rowsPerPage, queryFilters),
        queryFn: () => viajeApi.getAll(queryFilters),
    });

    const refreshLists = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
    }, [queryClient]);

    const deleteMutation = useMutation({
        mutationFn: viajeApi.delete,
        onSuccess: () => {
            setDeleteDialogOpen(false);
            setViajeToDelete(null);
            refreshLists();
            showToast({ entity: 'Viaje', action: 'delete' });
        },
        onError: (error: ApiMutationError) => {
            const message = getErrorMessage(error, 'No se pudo eliminar el viaje.');
            showToast({ entity: 'Viaje', action: 'delete', isError: true, message });
            logger.error('Error eliminando viaje:', message);
        },
    });

    const reopenMutation = useMutation({
        mutationFn: viajeApi.reopen,
        onSuccess: () => {
            setReopenDialogOpen(false);
            setViajeToReopen(null);
            refreshLists();
            showToast({ entity: 'Viaje', action: 'reopen' });
        },
        onError: (error: ApiMutationError) => {
            const message = getErrorMessage(error, 'No se pudo reabrir el viaje.');
            showToast({ entity: 'Viaje', action: 'reopen', isError: true, message });
            logger.error('Error reabriendo viaje:', message);
        },
    });

    const cerrarMutation = useCerrarViaje(() => {
        setCerrarDialogOpen(false);
        setViajeToCerrar(null);
    });

    const handleCreate = useCallback(() => {
        navigate(buildAppCreatePath(APP_PATHS.viajes));
    }, [navigate]);

    const handleView = useCallback((item: ViajeListItem) => {
        navigate(buildAppViewPath(APP_PATHS.viajes, item.viajeID));
    }, [navigate]);

    const handleEdit = useCallback((item: ViajeListItem) => {
        navigate(buildAppDetailPath(APP_PATHS.viajes, item.viajeID));
    }, [navigate]);

    const handleDelete = useCallback((item: ViajeListItem) => {
        setViajeToDelete(item);
        setDeleteDialogOpen(true);
    }, []);

    const handleReopen = useCallback((item: ViajeListItem) => {
        setViajeToReopen(item);
        setReopenDialogOpen(true);
    }, []);

    const handleCerrar = useCallback((item: ViajeListItem) => {
        setViajeToCerrar(item);
        setCerrarDialogOpen(true);
    }, []);

    const handleChangePage = useCallback((_: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleDraftFilterChange = useCallback(<K extends keyof ViajeListDraftFilters>(field: K, value: ViajeListDraftFilters[K]) => {
        setDraftFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSearch = useCallback(async () => {
        const nextAppliedFilters = normalizeViajeListFilters(draftFilters);
        const filtersChanged = !areViajeListFiltersEqual(appliedFilters, nextAppliedFilters);

        if (filtersChanged) {
            setAppliedFilters(nextAppliedFilters);
            setPage(0);
            return;
        }

        if (page !== 0) {
            setPage(0);
            return;
        }

        await refetch();
    }, [appliedFilters, draftFilters, page, refetch]);

    const handleResetFilters = useCallback(async () => {
        setDraftFilters(defaultDraftFilters);

        const nextAppliedFilters = normalizeViajeListFilters(defaultDraftFilters);
        const filtersChanged = !areViajeListFiltersEqual(appliedFilters, nextAppliedFilters);

        if (filtersChanged) {
            setAppliedFilters(nextAppliedFilters);
            setPage(0);
            return;
        }

        if (page !== 0) {
            setPage(0);
            return;
        }

        await refetch();
    }, [appliedFilters, defaultDraftFilters, page, refetch]);

    const totals = useMemo(
        () => ({
            agendados: data?.totalAgendados?.toString() || '0',
            enTransito: data?.totalEnTransito?.toString() || '0',
            completados: data?.totalCompletados?.toString() || '0',
        }),
        [data],
    );
    const kanbanColumns = useViajeKanbanColumns(data?.items, viewMode === 'kanban');

    return {
        canViewViajes,
        canManageViajes,
        canReabrirViajes,
        canCerrarViajes,
        page,
        rowsPerPage,
        draftFilters,
        filters: queryFilters,
        appliedFilters,
        viewMode,
        setViewMode,
        data,
        isFetching,
        isLoading,
        totals,
        kanbanColumns,
        deleteDialogOpen,
        reopenDialogOpen,
        viajeToDelete,
        viajeToReopen,
        deleteMutation,
        reopenMutation,
        cerrarDialogOpen,
        viajeToCerrar,
        cerrarMutation,
        loadingMessage: listReports.loadingMessage ?? detailReports.loadingMessage,
        handleCreate,
        handleView,
        handleEdit,
        handleDelete,
        handleReopen,
        handleCerrar,
        handleChangePage,
        handleChangeRowsPerPage,
        handleDraftFilterChange,
        handleSearch,
        handleResetFilters,
        handleExportListExcel: listReports.handleExportListExcel,
        handleExportListPdf: listReports.handleExportListPdf,
        handleExportExcel: detailReports.handleExportExcel,
        handleExportPdf: detailReports.handleExportPdf,
        closeDeleteDialog: () => setDeleteDialogOpen(false),
        closeReopenDialog: () => setReopenDialogOpen(false),
        closeCerrarDialog: () => setCerrarDialogOpen(false),
    };
}
