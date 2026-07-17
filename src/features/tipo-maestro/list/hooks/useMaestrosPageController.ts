import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tipoMaestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useLayoutStore } from '@shared/store/layout.store';

export function useMaestrosPageController() {
    const canManageMaestros = usePermission(PERMISSIONS.SISTEMA.MAESTROS.GESTIONAR);
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeccion, setSelectedSeccion] = useState<string | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [maestroToEdit, setMaestroToEdit] = useState<TipoMaestro | null>(null);

    useEffect(() => {
        setPageTitle('Maestros');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['tipo-maestros', page, rowsPerPage, debouncedSearch, selectedSeccion],
        queryFn: () =>
            tipoMaestroApi.getAll({
                page: page + 1,
                size: rowsPerPage,
                search: debouncedSearch,
                seccion: selectedSeccion || undefined,
            }),
    });

    const { data: secciones } = useQuery({
        queryKey: ['secciones-maestro'],
        queryFn: tipoMaestroApi.getSecciones,
    });

    const handleCreate = () => {
        setMaestroToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (maestro: TipoMaestro) => {
        setMaestroToEdit(maestro);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setMaestroToEdit(null);
    };

    const handleSuccess = () => {
        refetch();
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(handleSanitizeSearchInput(value));
    };

    const handleChangeSeccion = (value: string | null) => {
        setSelectedSeccion(value);
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
        canManageMaestros,
        data: data?.data,
        handleChangePage,
        handleChangeRowsPerPage,
        handleChangeSeccion,
        handleCloseModal,
        handleCreate,
        handleEdit,
        handleSearchChange,
        handleSuccess,
        isLoading,
        maestroToEdit,
        modalOpen,
        page,
        rowsPerPage,
        searchTerm,
        selectedSeccion,
        secciones: secciones?.data ?? [],
    };
}
