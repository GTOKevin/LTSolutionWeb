import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import type { Colaborador } from '@entities/colaborador/model/types';
import { useDeleteColaborador } from '@features/colaborador/hooks/useColaboradorCrud';
import { COLABORADOR_QUERY_KEYS } from '@features/colaborador/model/query-keys';
import { APP_PATHS, buildAppCreatePath, buildAppDetailPath, buildAppViewPath } from '@app/router/model/navigation';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { PERMISSIONS } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';

export function useColaboradoresPageController() {
    const navigate = useNavigate();
    const canManageColaboradores = usePermission(PERMISSIONS.COLABORADORES.GESTIONAR);
    const canViewColaboradores = usePermission(PERMISSIONS.COLABORADORES.VER);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: COLABORADOR_QUERY_KEYS.list(page, rowsPerPage, searchTerm),
        queryFn: () =>
            colaboradorApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: searchTerm || undefined,
            }),
    });

    const deleteMutation = useDeleteColaborador();

    const handleCreate = () => {
        navigate(buildAppCreatePath(APP_PATHS.colaboradores));
    };

    const handleEdit = (colaborador: Colaborador) => {
        navigate(buildAppDetailPath(APP_PATHS.colaboradores, colaborador.colaboradorID));
    };

    const handleView = (colaborador: Colaborador) => {
        navigate(buildAppViewPath(APP_PATHS.colaboradores, colaborador.colaboradorID));
    };

    const handleDeleteClick = (colaborador: Colaborador) => {
        setColaboradorToDelete(colaborador);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (!colaboradorToDelete) {
            return;
        }

        deleteMutation.mutate(colaboradorToDelete.colaboradorID, {
            onSuccess: () => {
                setOpenDeleteDialog(false);
                setColaboradorToDelete(null);
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
        canManageColaboradores,
        canViewColaboradores,
        colaboradorToDelete,
        data,
        deleteMutation,
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
