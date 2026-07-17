import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import type { ViajeFilters as ViajeFiltersType, ViajeListItem } from '@entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';
import { useToast } from '@/shared/components/ui/Toast';
import { useViajeDetailReports } from '../../reports/hooks/useViajeDetailReports';
import { useViajeListReports } from '../../reports/hooks/useViajeListReports';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { getErrorMessage, type ApiMutationError } from '@/shared/utils/api-errors';
import { logger } from '@/shared/utils/logger';

export function useViajesPageController() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const canViewViajes = usePermission(PERMISSIONS.VIAJES.VER);
    const canManageViajes = usePermission(PERMISSIONS.VIAJES.GESTIONAR);
    const canReabrirViajes = usePermission(PERMISSIONS.VIAJES.REABRIR);
    const listReports = useViajeListReports();
    const detailReports = useViajeDetailReports();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<ViajeFiltersType>({
        page: 1,
        size: 10,
        fechaInicio: getFirstDayOfCurrentMonthISO(),
        fechaFin: getLastDayOfCurrentMonthISO(),
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viajeToDelete, setViajeToDelete] = useState<ViajeListItem | null>(null);
    const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
    const [viajeToReopen, setViajeToReopen] = useState<ViajeListItem | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

    const { data, isLoading } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.listPage(page, rowsPerPage, filters),
        queryFn: () =>
            viajeApi.getAll({
                ...filters,
                page: page + 1,
                size: rowsPerPage,
            }),
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

    const handleCreate = useCallback(() => {
        navigate('/app/viajes/nuevo');
    }, [navigate]);

    const handleView = useCallback((item: ViajeListItem) => {
        navigate(`/app/viajes/${item.viajeID}?mode=view`);
    }, [navigate]);

    const handleEdit = useCallback((item: ViajeListItem) => {
        navigate(`/app/viajes/${item.viajeID}`);
    }, [navigate]);

    const handleDelete = useCallback((item: ViajeListItem) => {
        setViajeToDelete(item);
        setDeleteDialogOpen(true);
    }, []);

    const handleReopen = useCallback((item: ViajeListItem) => {
        setViajeToReopen(item);
        setReopenDialogOpen(true);
    }, []);

    const handleChangePage = useCallback((_: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const totals = useMemo(
        () => ({
            agendados: data?.totalAgendados?.toString() || '0',
            enTransito: data?.totalEnTransito?.toString() || '0',
            completados: data?.totalCompletados?.toString() || '0',
        }),
        [data],
    );

    return {
        canViewViajes,
        canManageViajes,
        canReabrirViajes,
        page,
        rowsPerPage,
        filters,
        setFilters,
        viewMode,
        setViewMode,
        data,
        isLoading,
        totals,
        deleteDialogOpen,
        reopenDialogOpen,
        viajeToDelete,
        viajeToReopen,
        deleteMutation,
        reopenMutation,
        loadingMessage: listReports.loadingMessage ?? detailReports.loadingMessage,
        handleCreate,
        handleView,
        handleEdit,
        handleDelete,
        handleReopen,
        handleChangePage,
        handleChangeRowsPerPage,
        handleExportListExcel: listReports.handleExportListExcel,
        handleExportListPdf: listReports.handleExportListPdf,
        handleExportExcel: detailReports.handleExportExcel,
        handleExportPdf: detailReports.handleExportPdf,
        closeDeleteDialog: () => setDeleteDialogOpen(false),
        closeReopenDialog: () => setReopenDialogOpen(false),
    };
}
