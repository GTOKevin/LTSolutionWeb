import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import { ESTADO_SECCIONES } from '@entities/master-data/model/constants';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import {
    areMantenimientoFiltersEqual,
    INITIAL_FILTERS,
    INITIAL_MANTENIMIENTO_DRAFT_STATE,
    INITIAL_SEARCH,
    type MantenimientoFiltersState,
    type MantenimientoListDraftState,
} from '../model/types';
import { useDeleteMantenimiento } from '../../hooks/useMantenimientoCrud';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage, type ApiMutationError } from '@/shared/utils/api-errors';

/**
 * Hook personalizado para gestionar la lógica de negocio del módulo de Mantenimientos.
 * 
 * Centraliza el estado de la UI (paginación, modales), la gestión de datos (fetching con React Query)
 * y las operaciones CRUD.
 * 
 * @returns {Object} Objeto con el estado y los manejadores de eventos necesarios para la vista.
 */
export function useMantenimientos() {
    const queryClient = useQueryClient();
    
    // --- Pagination ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // --- Search & Filters ---
    const [draftState, setDraftState] = useState<MantenimientoListDraftState>(INITIAL_MANTENIMIENTO_DRAFT_STATE);
    const [appliedSearch, setAppliedSearch] = useState(INITIAL_SEARCH);
    const [appliedFilters, setAppliedFilters] = useState<MantenimientoFiltersState>(INITIAL_FILTERS);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Mantenimiento | null>(null);
    const [openReopenDialog, setOpenReopenDialog] = useState(false);
    const [itemToReopen, setItemToReopen] = useState<Mantenimiento | null>(null);

    // --- Data Fetching ---
    // Catalogs
    const { data: flotas } = useQuery({
        queryKey: ['flotas-select'],
        queryFn: () => flotaApi.getSelect({  })
    });
    
    const { data: estados } = useQuery({ 
        queryKey: ['estados-select'], 
        queryFn: () => estadoApi.getSelect(undefined, undefined, ESTADO_SECCIONES.MANTENIMIENTO) 
    });

    // Main Query
    // Refetch only when page, rowsPerPage, searchQuery, or appliedFilters change
    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['mantenimientos', page, rowsPerPage, appliedSearch, appliedFilters],
        queryFn: () => mantenimientoApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: appliedSearch || undefined,
            flotaID: appliedFilters.flotaID || undefined,
            estadoID: appliedFilters.estadoID || undefined,
            desde: appliedFilters.desde || undefined,
            hasta: appliedFilters.hasta || undefined
        })
    });

    // --- Mutations ---
    const deleteMutation = useDeleteMantenimiento();
    const { showToast } = useToast();
    
    const reopenMutation = useMutation({
        mutationFn: mantenimientoApi.reopen,
        onSuccess: () => {
            setOpenReopenDialog(false);
            setItemToReopen(null);
            queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
            showToast({ entity: 'Mantenimiento', action: 'reopen' });
        },
        onError: (error: ApiMutationError) => {
            const message = getErrorMessage(error, 'No se pudo reabrir el mantenimiento.');
            showToast({ entity: 'Mantenimiento', action: 'reopen', isError: true, message });
        }
    });

    // --- Handlers ---
    
    const handleDraftChange = useCallback(<K extends keyof MantenimientoListDraftState>(field: K, value: MantenimientoListDraftState[K]) => {
        setDraftState((prev) => {
            const nextState = { ...prev, [field]: value };

            if (field === 'desde' && nextState.hasta && String(value) > nextState.hasta) {
                nextState.hasta = String(value);
            }

            if (field === 'hasta' && nextState.desde && String(value) < nextState.desde) {
                nextState.desde = String(value);
            }

            return nextState;
        });
    }, []);

    const handleSearch = useCallback(async () => {
        const nextAppliedSearch = draftState.search.trim();
        const nextAppliedFilters: MantenimientoFiltersState = {
            flotaID: draftState.flotaID,
            estadoID: draftState.estadoID,
            desde: draftState.desde,
            hasta: draftState.hasta,
        };

        const filtersChanged = !areMantenimientoFiltersEqual(appliedFilters, nextAppliedFilters);
        const searchChanged = appliedSearch !== nextAppliedSearch;

        if (filtersChanged || searchChanged) {
            setAppliedFilters(nextAppliedFilters);
            setAppliedSearch(nextAppliedSearch);
            setPage(0);
            return;
        }

        if (page !== 0) {
            setPage(0);
            return;
        }

        await refetch();
    }, [appliedFilters, appliedSearch, draftState, page, refetch]);

    /**
     * Limpia todos los filtros y búsquedas, restableciendo el estado inicial.
     */
    const handleClear = useCallback(async () => {
        setDraftState(INITIAL_MANTENIMIENTO_DRAFT_STATE);

        const filtersChanged = !areMantenimientoFiltersEqual(appliedFilters, INITIAL_FILTERS);
        const searchChanged = appliedSearch !== INITIAL_SEARCH;

        if (filtersChanged || searchChanged) {
            setAppliedFilters(INITIAL_FILTERS);
            setAppliedSearch(INITIAL_SEARCH);
            setPage(0);
            return;
        }

        if (page !== 0) {
            setPage(0);
            return;
        }

        await refetch();
    }, [appliedFilters, appliedSearch, page, refetch]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (item: Mantenimiento) => {
        setItemToDelete(item);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.mantenimientoID, {
                onSuccess: () => {
                    setOpenDeleteDialog(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    const handleReopenClick = (item: Mantenimiento) => {
        setItemToReopen(item);
        setOpenReopenDialog(true);
    };

    const handleConfirmReopen = () => {
        if (itemToReopen) {
            reopenMutation.mutate(itemToReopen.mantenimientoID);
        }
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
    };

    return {
        // State
        data,
        draftState,
        isLoading,
        isFetching,
        page,
        rowsPerPage,
        searchQuery: appliedSearch,
        appliedFilters,
        initialFilters: INITIAL_FILTERS,

        openDeleteDialog,
        itemToDelete,
        openReopenDialog,
        itemToReopen,
        reopenPending: reopenMutation.isPending,
        
        // Catalogs
        listaFlotas: flotas || [],
        listaEstados: estados || [],

        // Setters
        setOpenDeleteDialog,
        setOpenReopenDialog,

        // Actions
        handleSearch,
        handleDraftChange,
        handleClear,
        handleChangePage,
        handleChangeRowsPerPage,
        handleDeleteClick,
        handleConfirmDelete,
        handleReopenClick,
        handleConfirmReopen,
        handleRefresh
    };
}
