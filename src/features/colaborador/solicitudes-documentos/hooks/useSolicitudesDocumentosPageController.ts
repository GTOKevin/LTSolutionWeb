import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseFormSetError } from 'react-hook-form';
import { useLayoutStore } from '@shared/store/layout.store';
import { useToast } from '@shared/components/ui/Toast';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useDebounce } from '@shared/hooks/useDebounce';
import { colaboradorDocumentoApi } from '@entities/colaborador-documento/api/colaborador-documento.api';
import type {
    ColaboradorDocumentoSolicitud,
    ColaboradorDocumentoSolicitudesParams,
    ReviewDocumentoActualizacionSolicitudDto,
} from '@entities/colaborador-documento/model/types';
import { tipoDocumentoApi } from '@/entities/tipo-documento/api/tipo-documento.api';
import { PERMISSIONS } from '@shared/constants/permissions';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { getErrorMessage } from '@shared/utils/api-errors';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { isPreviewableImageUrl } from '@shared/utils/file-utils';
import { logger } from '@shared/utils/logger';
import type { ReviewSolicitudDocumentoForm } from '../model/schema';

export const SOLICITUDES_DOCUMENTOS_QUERY_KEY = ['colaborador-documento-solicitudes'] as const;

export type EstadoRevisionFilter = '' | 'pendiente' | 'aprobada' | 'rechazada';

export type SolicitudRevisionAccion = 'approve' | 'reject';

export interface SolicitudReviewTarget {
    solicitud: ColaboradorDocumentoSolicitud;
    accion: SolicitudRevisionAccion;
}

interface ReviewMutationVariables {
    id: number;
    payload: ReviewDocumentoActualizacionSolicitudDto;
}

export function useSolicitudesDocumentosPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const canGestionarSolicitudes = usePermission(PERMISSIONS.COLABORADORES.GESTIONAR_SOLICITUDES_DOCUMENTOS);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoRevision, setEstadoRevision] = useState<EstadoRevisionFilter>('pendiente');
    const [tipoDocumentoID, setTipoDocumentoID] = useState<number | ''>('');
    const [reviewTarget, setReviewTarget] = useState<SolicitudReviewTarget | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState('Vista previa');

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setPageTitle('Solicitudes de Documentos');
    }, [setPageTitle]);

    const queryFilters = useMemo<ColaboradorDocumentoSolicitudesParams>(() => ({
        search: debouncedSearch || undefined,
        tipoDocumentoID: tipoDocumentoID === '' ? undefined : tipoDocumentoID,
        aprobada: estadoRevision === 'aprobada' ? true : estadoRevision === 'rechazada' ? false : undefined,
        page: page + 1,
        size: rowsPerPage,
    }), [debouncedSearch, tipoDocumentoID, estadoRevision, page, rowsPerPage]);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: [...SOLICITUDES_DOCUMENTOS_QUERY_KEY, queryFilters],
        queryFn: () => colaboradorDocumentoApi.getSolicitudes(queryFilters),
    });

    const { data: tiposDocumento } = useQuery({
        queryKey: ['tipos-documento-colaborador'],
        queryFn: () => tipoDocumentoApi.getSelect(undefined, 'COLABORADOR'),
    });

    const invalidateSolicitudes = async () => {
        await queryClient.invalidateQueries({ queryKey: SOLICITUDES_DOCUMENTOS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ['colaborador-documentos'] });
    };

    const approveMutation = useMutation({
        mutationFn: ({ id, payload }: ReviewMutationVariables) => colaboradorDocumentoApi.approveSolicitud(id, payload),
        onSuccess: async () => {
            await invalidateSolicitudes();
            showToast({ message: 'Solicitud aprobada correctamente.', severity: 'success' });
            setReviewTarget(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, payload }: ReviewMutationVariables) => colaboradorDocumentoApi.rejectSolicitud(id, payload),
        onSuccess: async () => {
            await invalidateSolicitudes();
            showToast({ message: 'Solicitud rechazada correctamente.', severity: 'success' });
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

    const handleEstadoRevisionChange = (value: EstadoRevisionFilter) => {
        setEstadoRevision(value);
        setPage(0);
    };

    const handleTipoDocumentoChange = (value: number | '') => {
        setTipoDocumentoID(value);
        setPage(0);
    };

    const handleOpenReview = (solicitud: ColaboradorDocumentoSolicitud, accion: SolicitudRevisionAccion) => {
        setReviewTarget({ solicitud, accion });
    };

    const handleCloseReview = () => {
        if (isProcessingReview) {
            return;
        }
        setReviewTarget(null);
    };

    const handleSubmitReview = (
        values: ReviewSolicitudDocumentoForm,
        setError: UseFormSetError<ReviewSolicitudDocumentoForm>,
    ) => {
        if (!reviewTarget) {
            return;
        }

        const mutation = reviewTarget.accion === 'approve' ? approveMutation : rejectMutation;
        const payload: ReviewDocumentoActualizacionSolicitudDto = {
            comentarioRevision: values.comentarioRevision?.trim() || undefined,
        };

        mutation.mutate(
            { id: reviewTarget.solicitud.solicitudId, payload },
            {
                onError: (error: unknown) => {
                    const message =
                        handleBackendErrors<ReviewSolicitudDocumentoForm>(error, setError)
                        ?? getErrorMessage(error, 'No se pudo procesar la solicitud.');
                    logger.error('Error al procesar la solicitud de actualización de documento.', error);
                    showToast({ message, severity: 'error' });
                },
            },
        );
    };

    const handlePreviewArchivo = async (solicitud: ColaboradorDocumentoSolicitud) => {
        if (!solicitud.rutaArchivoPropuesta) {
            showToast({ message: 'La solicitud no tiene archivo propuesto.', severity: 'warning' });
            return;
        }

        const canPreviewInline = await isPreviewableImageUrl(solicitud.rutaArchivoPropuesta);

        if (canPreviewInline) {
            setPreviewTitle(`${solicitud.tipoDocumentoNombre} — ${solicitud.colaboradorNombre}`);
            setPreviewUrl(solicitud.rutaArchivoPropuesta);
            return;
        }

        window.open(solicitud.rutaArchivoPropuesta, '_blank', 'noopener,noreferrer');
    };

    return {
        canGestionarSolicitudes,
        data,
        estadoRevision,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCloseReview,
        handleEstadoRevisionChange,
        handleOpenReview,
        handlePreviewArchivo,
        handleSearchTermChange,
        handleSubmitReview,
        handleTipoDocumentoChange,
        hasBlockingError: isError && !data,
        isError,
        isFetching,
        isLoading,
        isProcessingReview,
        page,
        previewTitle,
        previewUrl,
        reviewTarget,
        rowsPerPage,
        searchTerm,
        setPreviewUrl,
        tipoDocumentoID,
        tiposDocumento,
        retryLoad: () => refetch(),
    };
}
