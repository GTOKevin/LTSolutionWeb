import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usuarioApi } from '@entities/usuario/api/usuario.api';
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import type { Usuario } from '@entities/usuario/model/types';
import { ESTADO_SECCIONES } from '@entities/master-data/model/constants';
import { useDeleteUsuario } from '@/features/usuario/hooks/useUsuarioCrud';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';

export function useUsuariosPageController() {
    const canManageUsuarios = usePermission(PERMISSIONS.SISTEMA.USUARIOS.GESTIONAR);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(true);
    const [roleFilter, setRoleFilter] = useState('0');
    const [statusFilter, setStatusFilter] = useState('0');
    const [draftRoleFilter, setDraftRoleFilter] = useState('0');
    const [draftStatusFilter, setDraftStatusFilter] = useState('0');
    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [usuarioToChangePassword, setUsuarioToChangePassword] = useState<Usuario | null>(null);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['usuarios', page, rowsPerPage, debouncedSearch, roleFilter, statusFilter],
        queryFn: () => usuarioApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: debouncedSearch,
            rolUsuarioID: roleFilter !== '0' ? Number(roleFilter) : undefined,
            estadoID: statusFilter !== '0' ? Number(statusFilter) : undefined,
        }),
    });

    const { data: roles } = useQuery({
        queryKey: ['roles-select'],
        queryFn: () => rolUsuarioApi.getSelect(),
    });

    const { data: estados } = useQuery({
        queryKey: ['estados-usuario-select'],
        queryFn: () => estadoApi.getSelect(undefined, 20, ESTADO_SECCIONES.USUARIO),
    });

    const deleteMutation = useDeleteUsuario();

    const handleApplyFilters = () => {
        setRoleFilter(draftRoleFilter);
        setStatusFilter(draftStatusFilter);
        setPage(0);
    };

    const handleToggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleCreate = () => {
        setUsuarioToEdit(null);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleEdit = (usuario: Usuario) => {
        setUsuarioToEdit(usuario);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleView = (usuario: Usuario) => {
        setUsuarioToEdit(usuario);
        setViewOnlyMode(true);
        setModalOpen(true);
    };

    const handleDeleteClick = (usuario: Usuario) => {
        setUsuarioToDelete(usuario);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!usuarioToDelete) {
            return;
        }

        deleteMutation.mutate(usuarioToDelete.usuarioID, {
            onSuccess: () => {
                setDeleteConfirmOpen(false);
                setUsuarioToDelete(null);
            },
            onError: () => {
                setDeleteConfirmOpen(false);
                setUsuarioToDelete(null);
            },
        });
    };

    const handleChangePassword = (usuario: Usuario) => {
        setUsuarioToChangePassword(usuario);
        setChangePasswordOpen(true);
    };

    const handlePasswordSuccess = () => {
        setChangePasswordOpen(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setUsuarioToEdit(null);
        setViewOnlyMode(false);
    };

    const handleSuccess = () => {
        refetch();
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
        canManageUsuarios,
        changePasswordOpen,
        data,
        deleteConfirmOpen,
        deleteMutation,
        draftRoleFilter,
        draftStatusFilter,
        estados,
        handleApplyFilters,
        handleChangePage,
        handleChangePassword,
        handleChangeRowsPerPage,
        handleCloseModal,
        handleConfirmDelete,
        handleCreate,
        handleDeleteClick,
        handleEdit,
        handlePasswordSuccess,
        handleSuccess,
        handleToggleFilters,
        handleView,
        isLoading,
        modalOpen,
        page,
        roles,
        rowsPerPage,
        searchTerm,
        setChangePasswordOpen,
        setDraftRoleFilter,
        setDraftStatusFilter,
        setSearchTerm,
        setDeleteConfirmOpen,
        showFilters,
        usuarioToChangePassword,
        usuarioToDelete,
        usuarioToEdit,
        viewOnlyMode,
    };
}
