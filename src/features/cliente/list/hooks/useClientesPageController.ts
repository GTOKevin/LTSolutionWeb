import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import type { Cliente } from '@entities/cliente/model/types';
import { PERMISSIONS } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { useDeleteCliente } from '@features/cliente/hooks/useClienteCrud';

export function useClientesPageController() {
    const navigate = useNavigate();
    const canViewClientes = usePermission(PERMISSIONS.CLIENTES.VER);
    const canManageClientes = usePermission(PERMISSIONS.CLIENTES.GESTIONAR);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState(' ');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    const queryKey = useMemo(
        () => ['clientes', page, rowsPerPage, debouncedSearch, statusFilter],
        [debouncedSearch, page, rowsPerPage, statusFilter],
    );

    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: () =>
            clienteApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: debouncedSearch,
                active: statusFilter === ' ' ? undefined : statusFilter,
            }),
    });

    const deleteMutation = useDeleteCliente();

    const handleCreate = () => {
        navigate('/app/clientes/nuevo');
    };

    const handleEdit = (cliente: Cliente) => {
        navigate(`/app/clientes/${cliente.clienteID}`);
    };

    const handleView = (cliente: Cliente) => {
        navigate(`/app/clientes/${cliente.clienteID}/ver`);
    };

    const handleDeleteClick = (cliente: Cliente) => {
        setClienteToDelete(cliente);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!clienteToDelete) {
            return;
        }

        deleteMutation.mutate(clienteToDelete.clienteID, {
            onSuccess: () => {
                setDeleteConfirmOpen(false);
                setClienteToDelete(null);
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
        canManageClientes,
        canViewClientes,
        clienteToDelete,
        data: data?.data,
        deleteConfirmOpen,
        deleteMutation,
        handleChangePage,
        handleChangeRowsPerPage,
        handleConfirmDelete,
        handleCreate,
        handleDeleteClick,
        handleEdit,
        handleSearchTermChange,
        handleView,
        isLoading,
        page,
        rowsPerPage,
        searchTerm,
        setDeleteConfirmOpen,
        setStatusFilter,
        statusFilter,
    };
}
