import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { estadoApi } from '@shared/api/estado.api';
import { TIPO_ESTADO } from '@/shared/constants/constantes';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { INITIAL_FILTERS } from '../model/types';
import type { MantenimientoFiltersState } from '../model/types';

export function useMantenimientos() {
    const queryClient = useQueryClient();
    
    // --- Pagination ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // --- Search & Filters ---
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<MantenimientoFiltersState>(INITIAL_FILTERS);

    // --- Modal State ---
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Mantenimiento | null>(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Mantenimiento | null>(null);

    // --- Data Fetching ---
    // Catalogs
    const { data: flotas } = useQuery({ 
        queryKey: ['flotas-select'], 
        queryFn: () => flotaApi.getSelect() 
    });
    
    const { data: estados } = useQuery({ 
        queryKey: ['estados-select'], 
        queryFn: () => estadoApi.getSelect(undefined, undefined, TIPO_ESTADO.MANTENIMIENTO) 
    });

    // Main Query
    // Refetch only when page, rowsPerPage, searchQuery, or appliedFilters change
    const { data, isLoading } = useQuery({
        queryKey: ['mantenimientos', page, rowsPerPage, searchQuery, appliedFilters],
        queryFn: () => mantenimientoApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: searchQuery || undefined,
            flotaID: appliedFilters.flotaID || undefined,
            estadoID: appliedFilters.estadoID || undefined,
            desde: appliedFilters.desde || undefined,
            hasta: appliedFilters.hasta || undefined
        })
    });

    // --- Mutations ---
    const deleteMutation = useMutation({
        mutationFn: (id: number) => mantenimientoApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
            setOpenDeleteDialog(false);
            setItemToDelete(null);
        }
    });

    // --- Handlers ---
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPage(0);
    }, []);

    const handleFilter = useCallback((filters: MantenimientoFiltersState) => {
        setAppliedFilters(filters);
        setPage(0);
    }, []);

    const handleClear = useCallback(() => {
        setSearchQuery('');
        setAppliedFilters(INITIAL_FILTERS);
        setPage(0);
    }, []);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleEdit = (item: Mantenimiento) => {
        setSelectedItem(item);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleView = (item: Mantenimiento) => {
        setSelectedItem(item);
        setViewOnly(true);
        setOpenModal(true);
    };

    const handleDeleteClick = (item: Mantenimiento) => {
        setItemToDelete(item);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.mantenimientoID);
        }
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
    };

    return {
        // State
        data,
        isLoading,
        page,
        rowsPerPage,
        searchQuery,
        appliedFilters,
        initialFilters: INITIAL_FILTERS,
        
        // Modal State
        openModal,
        selectedItem,
        viewOnly,
        openDeleteDialog,
        itemToDelete,
        
        // Catalogs
        listaFlotas: flotas?.data || [],
        listaEstados: estados?.data || [],

        // Setters
        setOpenModal,
        setOpenDeleteDialog,

        // Actions
        handleSearch,
        handleFilter,
        handleClear,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCreate,
        handleEdit,
        handleView,
        handleDeleteClick,
        handleConfirmDelete,
        handleRefresh
    };
}
