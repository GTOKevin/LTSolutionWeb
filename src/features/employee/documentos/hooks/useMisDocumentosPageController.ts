import { useEffect, useMemo, useState } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { useToast } from '@shared/components/ui/Toast';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useQuery } from '@tanstack/react-query';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type {
    MiDocumentoDto,
    MiDocumentoFilters,
    MiDocumentoSolicitudesFilters,
} from '@entities/employee/model/types';
import { isPreviewableImageUrl } from '@shared/utils/file-utils';
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

    useEffect(() => {
        setPageTitle('Mis Documentos');
    }, [setPageTitle]);

    const queryFilters = useMemo<MiDocumentoFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const { data: documentos, isLoading: isLoadingDocumentos } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.documentos(queryFilters),
        queryFn: () => employeePortalApi.getMyDocumentos(queryFilters),
        placeholderData: (previousData) => previousData,
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

    const { data: solicitudes, isLoading: isLoadingSolicitudes } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.solicitudes(requestFilters),
        queryFn: () => employeePortalApi.getMyDocumentoSolicitudes(requestFilters),
        placeholderData: (previousData) => previousData,
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

    return {
        activo,
        canRequestDocumentUpdate,
        dialogOpen,
        documentStats,
        documentos,
        documentosEnriquecidos,
        handleChangePage,
        handleChangeRowsPerPage,
        handleDownloadDocument,
        handleOpenDocument,
        handleRequestPageChange,
        handleRequestRowsPerPageChange,
        handleSearch,
        isLoadingDocumentos,
        isLoadingSolicitudes,
        page,
        pendingRequestsVisible,
        previewTitle,
        previewUrl,
        requestPage,
        requestRowsPerPage,
        rowsPerPage,
        selectedDocumentoId,
        setActivo,
        setDialogOpen,
        setPreviewUrl,
        setSelectedDocumentoId,
        setTipoDocumentoID,
        solicitudes,
        tipoDocumentoID,
        tiposDocumento,
    };
}
