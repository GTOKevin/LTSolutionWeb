import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useLayoutStore } from '@shared/store/layout.store';

export function useRolesColaboradorPageController() {
    const canViewRoles = usePermission(PERMISSIONS.SISTEMA.ROLES.VER);
    const canManageRoles = usePermission(PERMISSIONS.SISTEMA.ROLES.GESTIONAR);
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [rolToEdit, setRolToEdit] = useState<RolColaborador | null>(null);
    const [selectedRolId, setSelectedRolId] = useState<number | null>(null);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);

    useEffect(() => {
        setPageTitle('Roles de Colaborador');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['roles-colaborador', page, rowsPerPage, debouncedSearch],
        queryFn: () =>
            rolColaboradorApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: debouncedSearch,
            }),
    });

    const { data: rolDetail } = useQuery({
        queryKey: ['rol-colaborador-detail', selectedRolId],
        queryFn: () => rolColaboradorApi.getById(selectedRolId as number),
        enabled: modalOpen && viewOnlyMode && selectedRolId !== null,
    });

    const handleCreate = () => {
        setRolToEdit(null);
        setSelectedRolId(null);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleEdit = (rol: RolColaborador) => {
        setRolToEdit(rol);
        setSelectedRolId(null);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleView = (rol: RolColaborador) => {
        setRolToEdit(rol);
        setSelectedRolId(rol.rolColaboradorID);
        setViewOnlyMode(true);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setRolToEdit(null);
        setSelectedRolId(null);
        setViewOnlyMode(false);
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
        canViewRoles,
        canManageRoles,
        data,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCloseModal,
        handleCreate,
        handleEdit,
        handleView,
        handleSearchChange,
        handleSuccess,
        isLoading,
        modalOpen,
        page,
        rolToEdit: viewOnlyMode ? rolDetail ?? rolToEdit : rolToEdit,
        rowsPerPage,
        searchTerm,
        viewOnlyMode,
    };
}
