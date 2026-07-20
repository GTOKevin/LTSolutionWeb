import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mercaderiaApi } from '@entities/mercaderia/api/mercaderia.api';
import type { Mercaderia } from '@entities/mercaderia/model/types';
import { useDeleteMercaderia } from '@features/mercaderia/hooks/useMercaderiaCrud';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useLayoutStore } from '@shared/store/layout.store';

export function useMercaderiaPageController() {
    const canManageMercaderia = usePermission(PERMISSIONS.CATALOGOS.MERCADERIA.GESTIONAR);
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [mercaderiaToEdit, setMercaderiaToEdit] = useState<Mercaderia | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [mercaderiaToDelete, setMercaderiaToDelete] = useState<Mercaderia | null>(null);

    const deleteMutation = useDeleteMercaderia();

    useEffect(() => {
        setPageTitle('Mercaderías');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['mercaderias', page, rowsPerPage, debouncedSearch],
        queryFn: () =>
            mercaderiaApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: debouncedSearch,
            }),
    });

    const handleCreate = () => {
        setMercaderiaToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (mercaderia: Mercaderia) => {
        setMercaderiaToEdit(mercaderia);
        setModalOpen(true);
    };

    const handleDeleteClick = (mercaderia: Mercaderia) => {
        setMercaderiaToDelete(mercaderia);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!mercaderiaToDelete) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(mercaderiaToDelete.mercaderiaID);
            setDeleteDialogOpen(false);
            setMercaderiaToDelete(null);
        } catch {
            // El error ya se maneja en useGenericCrud.
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setMercaderiaToEdit(null);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setMercaderiaToDelete(null);
    };

    const handleSuccess = () => {
        refetch();
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(handleSanitizeSearchInput(value));
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
        canManageMercaderia,
        data: data?.data,
        deleteDialogOpen,
        deleteMutation,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCloseDeleteDialog,
        handleCloseModal,
        handleConfirmDelete,
        handleCreate,
        handleDeleteClick,
        handleEdit,
        handleSearchChange,
        handleSuccess,
        isLoading,
        mercaderiaToDelete,
        mercaderiaToEdit,
        modalOpen,
        page,
        rowsPerPage,
        searchTerm,
    };
}
