import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gastoApi } from '@entities/gasto/api/gasto.api';
import type { Gasto } from '@entities/gasto/model/types';
import { useDeleteGasto } from '@features/gasto/hooks/useGastoCrud';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useLayoutStore } from '@shared/store/layout.store';

export function useGastoPageController() {
    const canManageGasto = usePermission(PERMISSIONS.CATALOGOS.GASTO.GESTIONAR);
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [gastoToEdit, setGastoToEdit] = useState<Gasto | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);

    const deleteMutation = useDeleteGasto();

    useEffect(() => {
        setPageTitle('Gastos');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['gastos', page, rowsPerPage, debouncedSearch],
        queryFn: () =>
            gastoApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: debouncedSearch,
            }),
    });

    const handleCreate = () => {
        setGastoToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (gasto: Gasto) => {
        setGastoToEdit(gasto);
        setModalOpen(true);
    };

    const handleDeleteClick = (gasto: Gasto) => {
        setGastoToDelete(gasto);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!gastoToDelete) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(gastoToDelete.gastoID);
            setDeleteDialogOpen(false);
            setGastoToDelete(null);
        } catch {
            // El error ya se maneja en useGenericCrud.
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setGastoToEdit(null);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setGastoToDelete(null);
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
        canManageGasto,
        data: data?.data,
        deleteDialogOpen,
        deleteMutation,
        gastoToDelete,
        gastoToEdit,
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
        modalOpen,
        page,
        rowsPerPage,
        searchTerm,
    };
}
