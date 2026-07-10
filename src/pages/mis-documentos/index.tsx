import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Grid,
    TableCell,
    TextField,
    Typography,
} from '@mui/material';
import {
    PendingActionsOutlined,
    SyncOutlined,
    VisibilityOutlined,
    WarningAmberOutlined,
    Download as DownloadIcon,
    Verified as VerifiedIcon,
    ChevronRight as ChevronRightIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useLayoutStore } from '@shared/store/layout.store';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { useToast } from '@shared/components/ui/Toast';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type {
    MiDocumentoDto,
    MiDocumentoFilters,
    MiDocumentoSolicitudesFilters,
} from '@entities/employee/model/types';
import { formatDateOnly, formatDateTime } from '@shared/utils/date-utils';
import { isImageUrl } from '@shared/utils/file-utils';
import { getEstadoColor } from '@entities/employee/lib/status-utils';
import { SolicitudActualizacionModal } from '@features/employee/documentos/ui/SolicitudActualizacionModal';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { portalTableContainerFlatSx, portalTableHeaderFlatSx } from '@shared/components/ui/employee-portal-shell.styles';
import { tipoDocumentoApi } from '@/entities/tipo-documento/api/tipo-documento.api';

const documentColumns: Column[] = [
    { id: 'documento', label: 'Documento' },
    { id: 'numero', label: 'Número' },
    { id: 'emision', label: 'Emisión' },
    { id: 'vencimiento', label: 'Vencimiento' },
    { id: 'estado', label: 'Estado' },
    { id: 'acciones', label: 'Acciones', align: 'right' },
];

const requestColumns: Column[] = [
    { id: 'documento', label: 'Documento' },
    { id: 'fecha', label: 'Fecha Solicitud' },
    { id: 'motivo', label: 'Motivo' },
    { id: 'estado', label: 'Estado Revisión' },
];

export function MisDocumentosPage() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activo, setActivo] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
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
        const tipoDocumentoNameById = new Map(
            (tiposDocumento ?? []).map((item) => [item.id, item.text]),
        );

        return (documentos?.items ?? []).map((item) => ({
            ...item,
            tipoDocumentoNombre: item.tipoDocumentoNombre || tipoDocumentoNameById.get(item.tipoDocumentoId) || '',
        }));
    }, [documentos?.items, tiposDocumento]);

    const filteredDocumentos = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) {
            return documentosEnriquecidos;
        }

        return documentosEnriquecidos.filter((item) =>
            item.tipoDocumentoNombre.toLowerCase().includes(normalizedSearch) ||
            (item.numeroDocumento ?? '').toLowerCase().includes(normalizedSearch)
        );
    }, [documentosEnriquecidos, searchTerm]);

    const documentosData = useMemo(() => {
        if (!documentos) {
            return documentos;
        }

        return {
            ...documentos,
            items: filteredDocumentos,
            total: filteredDocumentos.length,
        };
    }, [documentos, filteredDocumentos]);

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
        [solicitudes]
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

    const handleSearch = () => {
        setPage(0);
        setFilters({
            activo: activo === '' ? undefined : activo === 'true',
        });
    };

    const handleOpenDocument = (item: MiDocumentoDto) => {
        if (!item.rutaArchivo) {
            showToast({ message: 'El documento no tiene archivo asociado.', severity: 'warning' });
            return;
        }

        if (isImageUrl(item.rutaArchivo)) {
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

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: '100%', flex: '1 0 auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between', gap: 4, borderBottom: '1px solid', borderColor: 'divider', pb: 4 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inicio</Typography>
                        <ChevronRightIcon fontSize="small" color="action" />
                        <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mis Documentos</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                        Mis Documentos
                    </Typography>
                </Box>
            </Box>

            {/* KPI Grid */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'success.50', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <VerifiedIcon />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>Documentos Vigentes</Typography>
                            <Typography variant="h5" fontWeight={800} color="text.primary">{documentStats.activos}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'error.50', color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <WarningAmberOutlined />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>Próximos a Vencer</Typography>
                            <Typography variant="h5" fontWeight={800} color="text.primary">{documentStats.nearExpiry}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.50', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PendingActionsOutlined />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>Solicitudes Pendientes</Typography>
                            <Typography variant="h5" fontWeight={800} color="text.primary">{pendingRequests}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Filter Section */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <TextField
                    placeholder="Buscar por nombre o número..."
                    size="small"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    sx={{ width: { xs: '100%', md: 384 }, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant={activo === '' ? 'contained' : 'outlined'} onClick={() => { setActivo(''); handleSearch(); }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Todos</Button>
                    <Button variant={activo === 'true' ? 'contained' : 'outlined'} onClick={() => { setActivo('true'); handleSearch(); }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: activo === 'true' ? undefined : 'text.secondary', borderColor: activo === 'true' ? undefined : 'divider' }}>Activos</Button>
                    <Button variant={activo === 'false' ? 'contained' : 'outlined'} onClick={() => { setActivo('false'); handleSearch(); }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: activo === 'false' ? undefined : 'text.secondary', borderColor: activo === 'false' ? undefined : 'divider' }}>Inactivos</Button>
                </Box>
            </Box>

            {/* Document List Table */}
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">Documentos Oficiales</Typography>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => { setSelectedDocumentoId(undefined); setDialogOpen(true); }} sx={{ borderRadius: 2, boxShadow: 'none' }}>
                        Nueva Solicitud
                    </Button>
                </Box>
                <SharedTable
                    data={documentosData}
                    isLoading={isLoadingDocumentos}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    columns={documentColumns}
                    keyExtractor={(item) => item.colaboradorDocumentoId}
                    emptyMessage="No se encontraron documentos con los filtros seleccionados."
                    containerSx={portalTableContainerFlatSx}
                    headerSx={portalTableHeaderFlatSx}
                    variant="flat"
                    renderRow={(item) => (
                        <>
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Typography variant="body2" fontWeight={600} color="text.primary">{item.tipoDocumentoNombre}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Typography variant="body2" color="text.secondary">{item.numeroDocumento || '—'}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Typography variant="body2" color="text.secondary">{formatDateOnly(item.fechaEmision)}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Typography variant="body2" color="text.secondary">{formatDateOnly(item.fechaVencimiento)}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Box sx={{ display: 'inline-flex', px: 1, py: 0.5, borderRadius: 1, bgcolor: item.activo ? 'success.50' : 'error.50', color: item.activo ? 'success.main' : 'error.main' }}>
                                    <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                        {item.activo ? 'Activo' : 'Inactivo'}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2, px: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => handleOpenDocument(item)}>
                                        <VisibilityOutlined fontSize="small" />
                                    </Button>
                                    <Button sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => handleDownloadDocument(item)}>
                                        <DownloadIcon fontSize="small" />
                                    </Button>
                                    <Button 
                                        sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                        onClick={() => {
                                            setSelectedDocumentoId(item.colaboradorDocumentoId);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <SyncOutlined fontSize="small" />
                                    </Button>
                                </Box>
                            </TableCell>
                        </>
                    )}
                />
            </Box>

            {/* Request History Section */}
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">Historial de Solicitudes</Typography>
                </Box>
                <SharedTable
                    data={solicitudes}
                    isLoading={isLoadingSolicitudes}
                    page={0}
                    rowsPerPage={10}
                    onPageChange={() => undefined}
                    onRowsPerPageChange={() => undefined}
                    columns={requestColumns}
                    keyExtractor={(item) => item.solicitudId}
                    emptyMessage="Aún no tienes solicitudes de actualización."
                    containerSx={portalTableContainerFlatSx}
                    headerSx={portalTableHeaderFlatSx}
                    variant="flat"
                    renderRow={(item) => {
                        const statusColor = getEstadoColor(item.aprobada);
                        return (
                            <>
                                <TableCell sx={{ py: 2, px: 3 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">{documentNameById.get(item.colaboradorDocumentoId) || `Documento #${item.colaboradorDocumentoId}`}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2, px: 3 }}>
                                    <Typography variant="body2" color="text.secondary">{formatDateTime(item.fechaRegistro)}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2, px: 3 }}>
                                    <Typography variant="body2" color="text.secondary">{item.motivoSolicitud || 'Sin motivo'}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2, px: 3 }}>
                                    <Box sx={{ display: 'inline-flex', px: 1, py: 0.5, borderRadius: 1, bgcolor: `${statusColor}.50`, color: `${statusColor}.main` }}>
                                        <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                            {item.estadoRevision}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </>
                        );
                    }}
                />
            </Box>

            <SolicitudActualizacionModal
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                documentos={documentosEnriquecidos}
                initialDocumentoId={selectedDocumentoId}
            />

            <DocumentPreviewDialog
                open={Boolean(previewUrl)}
                onClose={() => setPreviewUrl(null)}
                previewUrl={previewUrl}
                title={previewTitle}
            />
        </Box>
    );
}
