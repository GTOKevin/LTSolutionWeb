import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { Flota } from '@entities/flota/model/types';
import { useDeleteFlota } from '@features/flota/hooks/useFlotaCrud';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { APP_PATHS, buildAppCreatePath, buildAppDetailPath, buildAppViewPath } from '@app/router/model/navigation';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { PERMISSIONS } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';

export function useFlotasPageController() {
    const navigate = useNavigate();
    const canManageFlotas = usePermission(PERMISSIONS.FLOTA.GESTIONAR);
    const canViewFlotas = usePermission(PERMISSIONS.FLOTA.VER);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [flotaToDelete, setFlotaToDelete] = useState<Flota | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.list(page, rowsPerPage, debouncedSearch),
        queryFn: () =>
            flotaApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: debouncedSearch || undefined,
            }),
    });

    const deleteMutation = useDeleteFlota();

    const handleCreate = () => {
        navigate(buildAppCreatePath(APP_PATHS.flotas));
    };

    const handleEdit = (flota: Flota) => {
        navigate(buildAppDetailPath(APP_PATHS.flotas, flota.flotaID));
    };

    const handleView = (flota: Flota) => {
        navigate(buildAppViewPath(APP_PATHS.flotas, flota.flotaID));
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
    };

    return {
        canManageFlotas,
        canViewFlotas,
        data,
        deleteMutation,
        flotaToDelete,
        handleChangePage,
        handleChangeRowsPerPage,
        handleConfirmDelete,
        handleCreate,
        handleDeleteClick,
        handleEdit,
        handleSearchTermChange,
        handleView,
        isError,
        isLoading,
        openDeleteDialog,
        page,
        refetch,
        rowsPerPage,
        searchTerm,
        setOpenDeleteDialog,
    };
}
