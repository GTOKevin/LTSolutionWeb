import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseFormSetError } from 'react-hook-form';
import { useLayoutStore } from '@shared/store/layout.store';
import { useToast } from '@shared/components/ui/Toast';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useDebounce } from '@shared/hooks/useDebounce';
import { licenciaApi } from '@entities/licencia/api/licencia.api';
import type {
    LicenciaEstadoRevisionFilter,
    LicenciaSolicitudDto,
    LicenciaSolicitudParams,
    ReviewLicenciaDto,
} from '@entities/licencia/model/types';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import { PERMISSIONS } from '@shared/constants/permissions';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { getErrorMessage } from '@shared/utils/api-errors';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { logger } from '@shared/utils/logger';
import type { ReviewLicenciaForm } from '../model/schema';

export const SOLICITUDES_LICENCIAS_QUERY_KEY = ['colaborador-licencia-solicitudes'] as const;

export type EstadoRevisionFilter = LicenciaEstadoRevisionFilter;

export type LicenciaRevisionAccion = 'approve' | 'reject' | 'view';

export interface LicenciaReviewTarget {
    solicitud: LicenciaSolicitudDto;
    accion: LicenciaRevisionAccion;
}

interface ReviewMutationVariables {
    id: number;
    payload: ReviewLicenciaDto;
}

export function useSolicitudesLicenciasPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const canAprobarLicencias = usePermission(PERMISSIONS.COLABORADORES.APROBAR_LICENCIAS);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoRevision, setEstadoRevision] = useState<LicenciaEstadoRevisionFilter>('pendiente');
    const [tipoLicenciaID, setTipoLicenciaID] = useState<number | ''>('');
    const [reviewTarget, setReviewTarget] = useState<LicenciaReviewTarget | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setPageTitle('Solicitudes de Licencias');
    }, [setPageTitle]);

    const queryFilters = useMemo<LicenciaSolicitudParams>(() => ({
        search: debouncedSearch || undefined,
        tipoLicenciaID: tipoLicenciaID === '' ? undefined : tipoLicenciaID,
        estadoRevision: estadoRevision === '' ? undefined : estadoRevision,
        page: page + 1,
        size: rowsPerPage,
    }), [debouncedSearch, tipoLicenciaID, estadoRevision, page, rowsPerPage]);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: [...SOLICITUDES_LICENCIAS_QUERY_KEY, queryFilters],
        queryFn: () => licenciaApi.getSolicitudes(queryFilters),
    });

    const { data: tiposLicencia } = useQuery({
        queryKey: ['tipos-licencia-colaborador'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.LICENCIA),
    });

    const invalidateSolicitudes = async () => {
        await queryClient.invalidateQueries({ queryKey: SOLICITUDES_LICENCIAS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ['colaborador-licencias'] });
        await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
    };

    const approveMutation = useMutation({
        mutationFn: ({ id, payload }: ReviewMutationVariables) => licenciaApi.approveLicencia(id, payload),
        onSuccess: async () => {
            await invalidateSolicitudes();
            showToast({ message: 'Licencia aprobada correctamente.', severity: 'success' });
            setReviewTarget(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, payload }: ReviewMutationVariables) => licenciaApi.rejectLicencia(id, payload),
        onSuccess: async () => {
            await invalidateSolicitudes();
            showToast({ message: 'Licencia rechazada correctamente.', severity: 'success' });
            setReviewTarget(null);
        },
    });

    const isProcessingReview = approveMutation.isPending || rejectMutation.isPending;

    const handleChangePage = (_: unknown, nextPage: number) => {
        setPage(nextPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const handleSearchTermChange = (value: string) => {
        setSearchTerm(handleSanitizeSearchInput(value));
        setPage(0);
    };

    const handleEstadoRevisionChange = (value: LicenciaEstadoRevisionFilter) => {
        setEstadoRevision(value);
        setPage(0);
    };

    const handleTipoLicenciaChange = (value: number | '') => {
        setTipoLicenciaID(value);
        setPage(0);
    };

    const handleOpenReview = (solicitud: LicenciaSolicitudDto, accion: LicenciaRevisionAccion) => {
        setReviewTarget({ solicitud, accion });
    };

    const handleCloseReview = () => {
        if (isProcessingReview) {
            return;
        }
        setReviewTarget(null);
    };

    const handleSubmitReview = (
        values: ReviewLicenciaForm,
        setError: UseFormSetError<ReviewLicenciaForm>,
    ) => {
        if (!reviewTarget) {
            return;
        }

        const mutation = reviewTarget.accion === 'approve' ? approveMutation : rejectMutation;
        const payload: ReviewLicenciaDto = {
            comentarioRevision: values.comentarioRevision?.trim() || undefined,
        };

        mutation.mutate(
            { id: reviewTarget.solicitud.colaboradorLicenciaId, payload },
            {
                onError: (error: unknown) => {
                    const message =
                        handleBackendErrors<ReviewLicenciaForm>(error, setError)
                        ?? getErrorMessage(error, 'No se pudo procesar la solicitud de licencia.');
                    logger.error('Error al procesar la solicitud de licencia.', error);
                    showToast({ message, severity: 'error' });
                },
            },
        );
    };

    return {
        canAprobarLicencias,
        data,
        estadoRevision,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCloseReview,
        handleEstadoRevisionChange,
        handleOpenReview,
        handleSearchTermChange,
        handleSubmitReview,
        handleTipoLicenciaChange,
        hasBlockingError: isError && !data,
        isError,
        isFetching,
        isLoading,
        isProcessingReview,
        page,
        reviewTarget,
        rowsPerPage,
        searchTerm,
        tipoLicenciaID,
        tiposLicencia,
        retryLoad: () => refetch(),
    };
}
