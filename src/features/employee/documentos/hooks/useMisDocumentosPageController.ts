import { useEffect, useMemo, useState } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { useToast } from '@shared/components/ui/Toast';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type {
    CreateDocumentoActualizacionSolicitudDto,
    DocumentoActualizacionSolicitudDto,
    MiDocumentoDto,
    MiDocumentoFilters,
    MiDocumentoSolicitudesFilters,
} from '@entities/employee/model/types';
import { isPreviewableImageUrl } from '@shared/utils/file-utils';
import { getErrorMessage } from '@shared/utils/api-errors';
import { PERMISSIONS } from '@shared/constants/permissions';
import { tipoDocumentoApi } from '@/entities/tipo-documento/api/tipo-documento.api';
import { isDocumentNearExpiry, isDocumentVigente } from '@shared/utils/document-vigencia';

export function useMisDocumentosPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();
    const canRequestDocumentUpdate = usePermission(PERMISSIONS.EMPLOYEE.DOCUMENTOS.SOLICITAR_ACTUALIZACION);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [requestPage, setRequestPage] = useState(0);
    const [requestRowsPerPage, setRequestRowsPerPage] = useState(10);
    const [tipoDocumentoID, setTipoDocumentoID] = useState<number | ''>('');
    const [activo, setActivo] = useState<string>('');
    const [filters, setFilters] = useState<Omit<MiDocumentoFilters, 'page' | 'size'>>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState('Vista previa');
    const [selectedDocumentoId, setSelectedDocumentoId] = useState<number | undefined>(undefined);
    const [editandoSolicitud, setEditandoSolicitud] = useState<DocumentoActualizacionSolicitudDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DocumentoActualizacionSolicitudDto | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        setPageTitle('Mis Documentos');
    }, [setPageTitle]);

    const queryFilters = useMemo<MiDocumentoFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const {
        data: documentos,
        isFetching: isFetchingDocumentos,
        isLoading: isLoadingDocumentos,
        isError: isDocumentosError,
        refetch: refetchDocumentos,
    } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.documentos(queryFilters),
        queryFn: () => employeePortalApi.getMyDocumentos(queryFilters),
    });

    const { data: tiposDocumento } = useQuery({
        queryKey: ['tipos-documento-colaborador'],
        queryFn: () => tipoDocumentoApi.getSelect(undefined, 'COLABORADOR'),
    });

    const documentosEnriquecidos = useMemo(() => documentos?.items ?? [], [documentos?.items]);

    const requestFilters = useMemo<MiDocumentoSolicitudesFilters>(() => ({
        page: requestPage + 1,
        size: requestRowsPerPage,
    }), [requestPage, requestRowsPerPage]);

    const {
        data: solicitudes,
        isFetching: isFetchingSolicitudes,
        isLoading: isLoadingSolicitudes,
        isError: isSolicitudesError,
        refetch: refetchSolicitudes,
    } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.solicitudes(requestFilters),
        queryFn: () => employeePortalApi.getMyDocumentoSolicitudes(requestFilters),
    });

    const pendingRequestsVisible = useMemo(
        () => (solicitudes?.items ?? []).filter((item) => item.aprobada == null).length,
        [solicitudes],
    );

    const documentStats = useMemo(() => {
        const items = documentos?.items ?? [];
        const nearExpiry = items.filter((item) => isDocumentNearExpiry(item.vigenciaEstado)).length;

        return {
            total: documentos?.total ?? 0,
            vigentes: items.filter((item) => isDocumentVigente(item.vigenciaEstado)).length,
            nearExpiry,
        };
    }, [documentos]);

    const updateSolicitudMutation = useMutation({
        mutationFn: (payload: { id: number; body: CreateDocumentoActualizacionSolicitudDto }) =>
            employeePortalApi.updateDocumentoSolicitud(payload.id, payload.body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            setEditandoSolicitud(null);
            setDialogOpen(false);
            showToast({ message: 'Solicitud actualizada correctamente.', severity: 'success' });
        },
        onError: (error: unknown) => {
            showToast({ message: getErrorMessage(error, 'No se pudo actualizar la solicitud.'), severity: 'error' });
        },
    });

    const deleteSolicitudMutation = useMutation({
        mutationFn: (id: number) => employeePortalApi.deleteDocumentoSolicitud(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            setDeleteTarget(null);
            showToast({ message: 'Solicitud eliminada correctamente.', severity: 'success' });
        },
        onError: (error: unknown) => {
            showToast({ message: getErrorMessage(error, 'No se pudo eliminar la solicitud.'), severity: 'error' });
        },
    });

    const handleChangePage = (_: unknown, nextPage: number) => {
        setPage(nextPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const handleRequestPageChange = (_: unknown, nextPage: number) => {
        setRequestPage(nextPage);
    };

    const handleRequestRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRequestRowsPerPage(Number(event.target.value));
        setRequestPage(0);
    };

    const handleSearch = (nextFilters?: { activo?: string; tipoDocumentoID?: number | '' }) => {
        const resolvedActivo = nextFilters?.activo ?? activo;
        const resolvedTipoDocumentoID = nextFilters?.tipoDocumentoID ?? tipoDocumentoID;

        if (nextFilters?.activo !== undefined) {
            setActivo(nextFilters.activo);
        }

        if (nextFilters?.tipoDocumentoID !== undefined) {
            setTipoDocumentoID(nextFilters.tipoDocumentoID);
        }

        setPage(0);
        setFilters({
            activo: resolvedActivo === '' ? undefined : resolvedActivo === 'true',
            tipoDocumentoID: resolvedTipoDocumentoID === '' ? undefined : Number(resolvedTipoDocumentoID),
        });
    };

    const handleOpenDocument = async (item: MiDocumentoDto) => {
        if (!item.rutaArchivo) {
            showToast({ message: 'El documento no tiene archivo asociado.', severity: 'warning' });
            return;
        }

        const canPreviewInline = await isPreviewableImageUrl(item.rutaArchivo);

        if (canPreviewInline) {
            setPreviewTitle(item.tipoDocumentoNombre);
            setPreviewUrl(item.rutaArchivo);
            return;
        }

        window.open(item.rutaArchivo, '_blank', 'noopener,noreferrer');
    };

    const handleDownloadDocument = (item: MiDocumentoDto) => {
        if (!item.rutaArchivo) {
            showToast({ message: 'El documento no tiene archivo asociado.', severity: 'warning' });
            return;
        }

        window.open(item.rutaArchivo, '_blank', 'noopener,noreferrer');
    };

    const canEditSolicitud = (item: DocumentoActualizacionSolicitudDto) => item.aprobada == null || item.aprobada === false;

    const canDeleteSolicitud = (item: DocumentoActualizacionSolicitudDto) => item.aprobada == null;

    const handleOpenCreateSolicitud = (documentoId?: number) => {
        setEditandoSolicitud(null);
        setSelectedDocumentoId(documentoId);
        setDialogOpen(true);
    };

    const handleEditSolicitud = (item: DocumentoActualizacionSolicitudDto) => {
        setEditandoSolicitud(item);
        setDialogOpen(true);
    };

    const handleDeleteSolicitud = (item: DocumentoActualizacionSolicitudDto) => {
        setDeleteTarget(item);
    };

    const handleUpdateSolicitud = (id: number, body: CreateDocumentoActualizacionSolicitudDto) => {
        updateSolicitudMutation.mutate({ id, body });
    };

    const confirmDeleteSolicitud = () => {
        if (deleteTarget) {
            deleteSolicitudMutation.mutate(deleteTarget.solicitudId);
        }
    };

    return {
        activo,
        canDeleteSolicitud,
        canEditSolicitud,
        canRequestDocumentUpdate,
        confirmDeleteSolicitud,
        deleteSolicitudMutation,
        deleteTarget,
        dialogOpen,
        documentStats,
        documentos,
        documentosEnriquecidos,
        editandoSolicitud,
        hasBlockingDocumentosError: isDocumentosError && !documentos,
        hasBlockingSolicitudesError: isSolicitudesError && !solicitudes,
        handleChangePage,
        handleChangeRowsPerPage,
        handleDeleteSolicitud,
        handleDownloadDocument,
        handleEditSolicitud,
        handleOpenCreateSolicitud,
        handleOpenDocument,
        handleRequestPageChange,
        handleRequestRowsPerPageChange,
        handleSearch,
        handleUpdateSolicitud,
        isFetchingDocumentos,
        isFetchingSolicitudes,
        isDocumentosError,
        isLoadingDocumentos,
        isLoadingSolicitudes,
        isSolicitudesError,
        page,
        pendingRequestsVisible,
        previewTitle,
        previewUrl,
        requestPage,
        requestRowsPerPage,
        rowsPerPage,
        selectedDocumentoId,
        setActivo,
        setDeleteTarget,
        setDialogOpen,
        setPreviewUrl,
        setSelectedDocumentoId,
        setTipoDocumentoID,
        solicitudes,
        tipoDocumentoID,
        tiposDocumento,
        updateSolicitudMutation,
        retryDocumentosLoad: () => refetchDocumentos(),
        retrySolicitudesLoad: () => refetchSolicitudes(),
    };
}
