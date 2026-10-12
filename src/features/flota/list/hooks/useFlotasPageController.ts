import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { Flota, FlotaParams } from '@entities/flota/model/types';
import type { FlotaReportFormat } from '@entities/flota/api/flota.api';
import { useDeleteFlota } from '@features/flota/hooks/useFlotaCrud';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { useFlotaDrawer } from '../../detail/hooks/useFlotaDrawer';
import { useFlotaReports } from '../../reports/hooks/useFlotaReports';
import { APP_PATHS, buildAppCreatePath, buildAppDetailPath } from '@shared/config/app-routes';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { useDebounce } from '@shared/hooks/useDebounce';
import { PERMISSIONS } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';

export type FlotasViewMode = 'table' | 'cards';

export function useFlotasPageController() {
    const navigate = useNavigate();
    const canManageFlotas = usePermission(PERMISSIONS.FLOTA.GESTIONAR);
    const canViewFlotas = usePermission(PERMISSIONS.FLOTA.VER);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [tipoFlota, setTipoFlota] = useState<number | null>(null);
    const [estadoOperativo, setEstadoOperativo] = useState('');
    const [estadoDocumental, setEstadoDocumental] = useState('');
    const [viewMode, setViewMode] = useState<FlotasViewMode>('table');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [flotaToDelete, setFlotaToDelete] = useState<Flota | null>(null);

    const drawer = useFlotaDrawer();
    const reports = useFlotaReports();

    const appliedFilters = useMemo<FlotaParams>(() => {
        const isActivos = estadoOperativo === 'ACTIVOS';
        const estadoOp = estadoOperativo && !isActivos ? estadoOperativo : undefined;

        return {
            page: page + 1,
            size: rowsPerPage,
            search: debouncedSearch || undefined,
            tipoFlota: tipoFlota ?? undefined,
            activo: isActivos ? true : undefined,
            estadoOperativo: estadoOp,
            estadoDocumental: estadoDocumental || undefined,
        };
    }, [page, rowsPerPage, debouncedSearch, tipoFlota, estadoOperativo, estadoDocumental]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.list(page, rowsPerPage, debouncedSearch, estadoOperativo, estadoDocumental, tipoFlota),
        queryFn: () => flotaApi.getAll(appliedFilters),
    });

    const { data: resumen, isLoading: isResumenLoading } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.resumen(),
        queryFn: () => flotaApi.getResumen(),
    });

    const deleteMutation = useDeleteFlota();

    const handleCreate = () => {
        navigate(buildAppCreatePath(APP_PATHS.flotas));
    };

    const handleEdit = (flota: Flota) => {
        navigate(buildAppDetailPath(APP_PATHS.flotas, flota.flotaID));
    };

    const handleView = (flota: Flota) => {
        drawer.openDrawer(flota);
    };

    const handleProgramarTaller = (flota: Flota) => {
        navigate(`${APP_PATHS.mantenimientos}/nuevo?flotaID=${flota.flotaID}`);
    };

    const handleDeleteClick = (flota: Flota) => {
        setFlotaToDelete(flota);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (!flotaToDelete) {
            return;
        }

        deleteMutation.mutate(flotaToDelete.flotaID, {
            onSuccess: () => {
                setOpenDeleteDialog(false);
                setFlotaToDelete(null);
            },
        });
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number.parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchTermChange = (value: string) => {
        setSearchTerm(handleSanitizeSearchInput(value));
        setPage(0);
    };

    const handleTabChange = (value: number | null) => {
        setTipoFlota(value);
        setPage(0);
    };

    const handleEstadoOperativoChange = (value: string) => {
        setEstadoOperativo(value);
        setPage(0);
    };

    const handleEstadoDocumentalChange = (value: string) => {
        setEstadoDocumental(value);
        setPage(0);
    };

    const handleViewModeChange = (mode: FlotasViewMode) => {
        setViewMode(mode);
    };

    const handleExportInventario = (format: FlotaReportFormat) => {
        void reports.handleExportInventario(format, {
            search: debouncedSearch || undefined,
            tipoFlota: tipoFlota ?? undefined,
            activo: estadoOperativo === 'ACTIVOS' ? true : undefined,
            estadoOperativo: estadoOperativo && estadoOperativo !== 'ACTIVOS' ? estadoOperativo : undefined,
            estadoDocumental: estadoDocumental || undefined,
        });
    };

    return {
        canManageFlotas,
        canViewFlotas,
        data,
        resumen,
        isResumenLoading,
        deleteMutation,
        flotaToDelete,
        handleChangePage,
        handleChangeRowsPerPage,
        handleConfirmDelete,
        handleCreate,
        handleDeleteClick,
        handleEdit,
        handleView,
        handleProgramarTaller,
        handleSearchTermChange,
        handleTabChange,
        handleEstadoOperativoChange,
        handleEstadoDocumentalChange,
        handleViewModeChange,
        handleExportInventario,
        exportLoadingMessage: reports.loadingMessage,
        isError,
        isLoading,
        openDeleteDialog,
        page,
        refetch,
        rowsPerPage,
        searchTerm,
        setOpenDeleteDialog,
        tipoFlota,
        estadoOperativo,
        estadoDocumental,
        viewMode,
        drawer,
    };
}
