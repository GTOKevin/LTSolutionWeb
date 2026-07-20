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

export function useMisDocumentosPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();
    const canRequestDocumentUpdate = usePermission(PERMISSIONS.EMPLOYEE.DOCUMENTOS.SOLICITAR_ACTUALIZACION);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
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
        queryFn: async () => (await tipoDocumentoApi.getSelect(undefined, 'COLABORADOR')).data,
    });

    const documentosEnriquecidos = useMemo(() => {
        const tipoDocumentoNameById = new Map((tiposDocumento ?? []).map((item) => [item.id, item.text]));

        return (documentos?.items ?? []).map((item) => ({
            ...item,
            tipoDocumentoNombre: item.tipoDocumentoNombre || tipoDocumentoNameById.get(item.tipoDocumentoId) || '',
        }));
    }, [documentos?.items, tiposDocumento]);

    const requestFilters = useMemo<MiDocumentoSolicitudesFilters>(() => ({
        page: 1,
        size: 10,
    }), []);

    const { data: solicitudes, isLoading: isLoadingSolicitudes } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.solicitudes(requestFilters),
        queryFn: () => employeePortalApi.getMyDocumentoSolicitudes(requestFilters),
        placeholderData: (previousData) => previousData,
    });

    const pendingRequests = useMemo(
        () => (solicitudes?.items ?? []).filter((item) => item.aprobada == null).length,
        [solicitudes],
    );

    const documentStats = useMemo(() => {
        const items = documentos?.items ?? [];
        const today = new Date();
        const nearExpiry = items.filter((item) => {
            const expiryDate = new Date(item.fechaVencimiento);
            const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return item.activo && diffDays >= 0 && diffDays <= 30;
        }).length;

        return {
            total: documentos?.total ?? 0,
            activos: items.filter((item) => item.activo).length,
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

    const documentNameById = useMemo(() => {
        const map = new Map<number, string>();
        documentosEnriquecidos.forEach((item) => {
            map.set(item.colaboradorDocumentoId, item.tipoDocumentoNombre);
        });
        return map;
    }, [documentosEnriquecidos]);

    return {
        activo,
        canRequestDocumentUpdate,
        dialogOpen,
        documentNameById,
        documentStats,
        documentos,
        documentosEnriquecidos,
        handleChangePage,
        handleChangeRowsPerPage,
        handleDownloadDocument,
        handleOpenDocument,
        handleSearch,
        isLoadingDocumentos,
        isLoadingSolicitudes,
        page,
        pendingRequests,
        previewTitle,
        previewUrl,
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
