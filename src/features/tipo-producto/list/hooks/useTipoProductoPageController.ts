import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tipoProductoApi } from '@entities/tipo-producto/api/tipo-producto.api';
import type { TipoProducto } from '@entities/tipo-producto/model/types';
import { useDeleteTipoProducto } from '@features/tipo-producto/hooks/useTipoProductoCrud';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useLayoutStore } from '@shared/store/layout.store';

export function useTipoProductoPageController() {
    const canViewTipoProducto = usePermission(PERMISSIONS.CATALOGOS.TIPO_PRODUCTO.VER);
    const canManageTipoProducto = usePermission(PERMISSIONS.CATALOGOS.TIPO_PRODUCTO.GESTIONAR);
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [tipoToEdit, setTipoToEdit] = useState<TipoProducto | null>(null);
    const [selectedTipoId, setSelectedTipoId] = useState<number | null>(null);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tipoToDelete, setTipoToDelete] = useState<TipoProducto | null>(null);

    const deleteMutation = useDeleteTipoProducto();

    useEffect(() => {
        setPageTitle('Tipos de Producto');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['tipo-productos', page, rowsPerPage, debouncedSearch, selectedCategoria],
        queryFn: () =>
            tipoProductoApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: debouncedSearch,
                categoria: selectedCategoria || undefined,
            }),
    });

    const { data: categorias } = useQuery({
        queryKey: ['categorias-select'],
        queryFn: tipoProductoApi.getSelectCategoria,
    });

    const { data: tipoDetail } = useQuery({
        queryKey: ['tipo-producto-detail', selectedTipoId],
        queryFn: () => tipoProductoApi.getById(selectedTipoId as number),
        enabled: modalOpen && viewOnlyMode && selectedTipoId !== null,
    });

    const handleCreate = () => {
        setTipoToEdit(null);
        setSelectedTipoId(null);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleEdit = (tipo: TipoProducto) => {
        setTipoToEdit(tipo);
        setSelectedTipoId(null);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleView = (tipo: TipoProducto) => {
        setTipoToEdit(tipo);
        setSelectedTipoId(tipo.tipoProductoID);
        setViewOnlyMode(true);
        setModalOpen(true);
    };

    const handleDeleteClick = (tipo: TipoProducto) => {
        setTipoToDelete(tipo);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!tipoToDelete) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(tipoToDelete.tipoProductoID);
            setDeleteDialogOpen(false);
            setTipoToDelete(null);
        } catch {
            // El error ya se maneja en useGenericCrud.
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setTipoToEdit(null);
        setSelectedTipoId(null);
        setViewOnlyMode(false);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setTipoToDelete(null);
    };

    const handleSuccess = () => {
        refetch();
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(handleSanitizeSearchInput(value));
    };

    const handleChangeCategoria = (value: string | null) => {
        setSelectedCategoria(value);
        setPage(0);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
        canViewTipoProducto,
        canManageTipoProducto,
        categorias: categorias?.map((categoria) => categoria.text) ?? [],
        data,
        deleteDialogOpen,
        deleteMutation,
        handleChangeCategoria,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCloseDeleteDialog,
        handleCloseModal,
        handleConfirmDelete,
        handleCreate,
        handleDeleteClick,
        handleEdit,
        handleView,
        handleSearchChange,
        handleSuccess,
        isLoading,
        modalOpen,
        page,
        rowsPerPage,
        searchTerm,
        selectedCategoria,
        tipoToDelete,
        tipoToEdit: viewOnlyMode ? tipoDetail ?? tipoToEdit : tipoToEdit,
        viewOnlyMode,
    };
}
