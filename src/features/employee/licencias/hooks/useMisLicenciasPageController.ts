import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLayoutStore } from '@shared/store/layout.store';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { MiLicenciaDto, MiLicenciaEstadoRevision, MiLicenciaFilters, CreateMiLicenciaRequestDto } from '@entities/employee/model/types';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';
import { useToast } from '@shared/components/ui/Toast';
import { getErrorMessage } from '@shared/utils/api-errors';
import { logger } from '@shared/utils/logger';

export function useMisLicenciasPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const canSolicitarLicencia = usePermission(PERMISSIONS.EMPLOYEE.LICENCIAS.SOLICITAR);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [tipoLicenciaID, setTipoLicenciaID] = useState<number | ''>('');
    const [estadoRevision, setEstadoRevision] = useState<MiLicenciaEstadoRevision | ''>('');
    const [desde, setDesde] = useState(getFirstDayOfCurrentMonthISO(-1));
    const [hasta, setHasta] = useState(getLastDayOfCurrentMonthISO());
    const [filters, setFilters] = useState<Omit<MiLicenciaFilters, 'page' | 'size'>>({
        desde: getFirstDayOfCurrentMonthISO(-1),
        hasta: getLastDayOfCurrentMonthISO(),
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState<MiLicenciaDto | null>(null);
    const [editTarget, setEditTarget] = useState<MiLicenciaDto | null>(null);
    const [detailTarget, setDetailTarget] = useState<MiLicenciaDto | null>(null);

    useEffect(() => {
        setPageTitle('Mis Licencias');
    }, [setPageTitle]);

    const { data: tiposLicencia } = useQuery({
        queryKey: ['employee-portal', 'tipos-licencia'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.LICENCIA),
    });

    const queryFilters = useMemo<MiLicenciaFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const { data, isFetching, isLoading, isError, refetch } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.licencias(queryFilters),
        queryFn: () => employeePortalApi.getMyLicencias(queryFilters),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => employeePortalApi.cancelMyLicencia(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employee-portal', 'licencias'] });
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Licencia cancelada correctamente.', severity: 'success' });
            setCancelTarget(null);
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error, 'No se pudo cancelar la licencia.');
            logger.error('Error al cancelar la licencia propia.', error);
            showToast({ message, severity: 'error' });
        },
    });

    const editMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: CreateMiLicenciaRequestDto }) =>
            employeePortalApi.updateMyLicencia(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employee-portal', 'licencias'] });
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Solicitud de licencia actualizada correctamente.', severity: 'success' });
            setEditTarget(null);
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error, 'No se pudo actualizar la licencia.');
            logger.error('Error al actualizar la licencia propia.', error);
            showToast({ message, severity: 'error' });
        },
    });

    const licenciaStats = useMemo(() => {
        const items = data?.items ?? [];
        return {
            total: data?.total ?? 0,
            visibleCount: items.length,
            pendingVisible: items.filter((item) => item.aceptado == null).length,
            approvedVisible: items.filter((item) => item.aceptado === true).length,
        };
    }, [data]);

    const handleSearch = () => {
        setPage(0);
        setFilters({
            tipoLicenciaID: tipoLicenciaID === '' ? undefined : Number(tipoLicenciaID),
            estadoRevision: estadoRevision === '' ? undefined : estadoRevision,
            desde: desde || undefined,
            hasta: hasta || undefined,
        });
    };

    const handleChangePage = (_: unknown, nextPage: number) => {
        setPage(nextPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const handleOpenCancel = (licencia: MiLicenciaDto) => {
        setCancelTarget(licencia);
    };

    const handleCloseCancel = () => {
        if (cancelMutation.isPending) {
            return;
        }
        setCancelTarget(null);
    };

    const handleConfirmCancel = () => {
        if (!cancelTarget) {
            return;
        }
        cancelMutation.mutate(cancelTarget.colaboradorLicenciaId);
    };

    const canCancel = (licencia: MiLicenciaDto) => licencia.aceptado === null;

    const canEdit = (licencia: MiLicenciaDto) => licencia.aceptado === null;

    const handleOpenEdit = (licencia: MiLicenciaDto) => {
        setEditTarget(licencia);
    };

    const handleCloseEdit = () => {
        if (editMutation.isPending) {
            return;
        }
        setEditTarget(null);
    };

    const handleOpenDetail = (licencia: MiLicenciaDto) => {
        setDetailTarget(licencia);
    };

    const handleCloseDetail = () => {
        setDetailTarget(null);
    };

    return {
        canSolicitarLicencia,
        canCancel,
        canEdit,
        cancelPending: cancelMutation.isPending,
        cancelTarget,
        data,
        desde,
        detailTarget,
        dialogOpen,
        editMutation,
        editPending: editMutation.isPending,
        editTarget,
        estadoRevision,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCloseCancel,
        handleCloseDetail,
        handleCloseEdit,
        handleConfirmCancel,
        handleOpenCancel,
        handleOpenDetail,
        handleOpenEdit,
        handleSearch,
        hasBlockingError: isError && !data,
        hasta,
        isError,
        isFetching,
        isLoading,
        licenciaStats,
        page,
        rowsPerPage,
        setDesde,
        setDialogOpen,
        setEstadoRevision,
        setHasta,
        setTipoLicenciaID,
        tipoLicenciaID,
        tiposLicencia,
        retryLicenciasLoad: () => refetch(),
    };
}
