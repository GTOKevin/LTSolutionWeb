import {
    Button,
    Box,
    useTheme,
    IconButton,
    Typography,
    Snackbar,
    Alert,
    Dialog,
    DialogContent,
    DialogActions,
    Avatar,
    Grid,
    Card,
    CardContent,
    CardActions,
    Tooltip,
    alpha,
    TablePagination
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as FileIcon,
    Download as DownloadIcon,
    Close as CloseIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { CreateFlotaDocumentoSchema } from '../../model/schema';
import { useState } from 'react';
import type { FlotaDocumento } from '@entities/flota/model/types';
import { parseDateOnly, formatDateLong } from '@/shared/utils/date-utils';

import { FlotaDocumentosForm } from './FlotaDocumentosForm';
import { ROWS_DOC_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface FlotaDocumentosListProps {
    flotaId: number;
    viewOnly?: boolean;
}

const getExpirationStatus = (fechaVencimiento: string) => {
    const vencimiento = parseDateOnly(fechaVencimiento);
    if (!vencimiento) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = vencimiento.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
        return {
            color: 'error' as const,
            icon: <ErrorIcon fontSize="small" />,
            label: 'Vence pronto',
            fullLabel: 'El documento vencerá pronto, actualice el documento.',
            textColor: 'error.main',
            bgColor: 'error.lighter',
            borderColor: 'error.main'
        };
    } else if (diffDays <= 90) {
        return {
            color: 'warning' as const,
            icon: <WarningIcon fontSize="small" />,
            label: 'Próximo a vencer',
            fullLabel: 'El documento está próximo a vencer.',
            textColor: 'warning.main',
            bgColor: 'warning.lighter',
            borderColor: 'warning.main'
        };
    } else {
        return {
            color: 'success' as const,
            icon: <CheckIcon fontSize="small" />,
            label: 'Vigente',
            fullLabel: 'Documento vigente',
            textColor: 'success.main',
            bgColor: 'success.lighter',
            borderColor: 'success.main'
        };
    }
};

export function FlotaDocumentosList({ flotaId, viewOnly = false }: FlotaDocumentosListProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [editingDoc, setEditingDoc] = useState<CreateFlotaDocumentoSchema | undefined>(undefined);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);
    
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['flota-documentos', flotaId, page, rowsPerPage],
        queryFn: () => flotaApi.getDocumentos({ flotaId, page: page + 1, size: rowsPerPage }),
        enabled: !!flotaId
    });

    const totalItems = data?.data?.total || 0;

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handlePreview = (path: string) => {
        setPreviewUrl(path);
    };

    const handleClosePreview = () => {
        setPreviewUrl(null);
    };

    const handleDownload = async () => {
        if (!previewUrl) return;
        try {
            const response = await fetch(previewUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = previewUrl.split('/').pop() || 'documento';
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading:', error);
            window.open(previewUrl, '_blank');
        }
    };

    const handleFormCancel = () => {
        setEditingDoc(undefined);
        setEditingId(null);
        setShowForm(false);
    };

    const createMutation = useMutation({
        mutationFn: (data: CreateFlotaDocumentoSchema) => 
            flotaApi.addDocumento(flotaId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flota-documentos', flotaId] });
            handleFormCancel();
        },
        onError: () => {
            setErrorMessage('Error al crear documento. Verifique los datos.');
            setOpenSnackbar(true);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateFlotaDocumentoSchema) => 
            editingId ? flotaApi.updateDocumento(editingId, data) : Promise.reject('No ID'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flota-documentos', flotaId] });
            handleFormCancel();
        },
        onError: () => {
            setErrorMessage('Error al actualizar documento. Verifique los datos.');
            setOpenSnackbar(true);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => flotaApi.removeDocumento(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flota-documentos', flotaId] });
        },
        onError: () => {
            setErrorMessage('Error al eliminar el documento');
            setOpenSnackbar(true);
        }
    });

    const handleEdit = (doc: FlotaDocumento) => {
        setEditingId(doc.flotaDocumentoID);
        setEditingDoc({
            tipoDocumentoID: doc.tipoDocumentoID,
            numeroDocumento: doc.numeroDocumento,
            rutaArchivo: doc.rutaArchivo || '',
            fechaEmision: doc.fechaEmision,
            fechaVencimiento: doc.fechaVencimiento,
            activo: doc.estado
        });
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setEditingDoc(undefined);
        setShowForm(true);
    }

    const handleSubmit = (data: CreateFlotaDocumentoSchema) => {
        if (editingId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    Documentos del Vehículo
                </Typography>
                {!showForm && !viewOnly && (
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        onClick={handleCreate}
                    >
                        Agregar Documento
                    </Button>
                )}
            </Box>
            
            {showForm ? (
                <FlotaDocumentosForm 
                    defaultValues={editingDoc}
                    onSubmit={handleSubmit}
                    onCancel={handleFormCancel}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                    isEditing={!!editingId}
                    viewOnly={viewOnly}
                />
            ) : (
                <Box sx={{ flex: 1, overflow: 'auto', p: 0.5 }}>
                    {isLoading ? (
                        <Box p={3} textAlign="center">Cargando documentos...</Box>
                    ) : data?.data?.items?.length === 0 ? (
                        <Box 
                            p={5} 
                            textAlign="center" 
                            color="text.secondary"
                            sx={{ 
                                border: `1px dashed ${theme.palette.divider}`,
                                borderRadius: 2,
                                bgcolor: theme.palette.action.hover
                            }}
                        >
                            <Typography variant="body1">No hay documentos registrados.</Typography>
                            {!viewOnly && <Typography variant="caption">Haga clic en "Agregar Documento" para comenzar.</Typography>}
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {data?.data?.items?.map((doc) => {
                                const status = getExpirationStatus(doc.fechaVencimiento);
                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.flotaDocumentoID}>
                                        <Card 
                                            elevation={0}
                                            sx={{ 
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 2,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2, flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box 
                                                        onClick={() => doc.rutaArchivo && handlePreview(doc.rutaArchivo)}
                                                        sx={{ 
                                                            cursor: doc.rutaArchivo ? 'pointer' : 'default',
                                                            borderRadius: 2,
                                                            overflow: 'hidden',
                                                            border: `1px solid ${theme.palette.divider}`
                                                        }}
                                                    >
                                                        {doc.rutaArchivo ? (
                                                            <Avatar
                                                                variant="rounded"
                                                                src={doc.rutaArchivo}
                                                                alt={doc.numeroDocumento}
                                                                sx={{ width: 64, height: 64 }}
                                                            />
                                                        ) : (
                                                            <Box 
                                                                sx={{ 
                                                                    width: 64, 
                                                                    height: 64, 
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'primary.main'
                                                                }}
                                                            >
                                                                <FileIcon fontSize="large" />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    {status && (
                                                        <Tooltip title={status.fullLabel}>
                                                            <Box 
                                                                sx={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    gap: 0.5,
                                                                    px: 1,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    bgcolor: alpha(theme.palette[status.color].main, 0.1),
                                                                    color: status.textColor,
                                                                    border: `1px solid ${alpha(theme.palette[status.color].main, 0.2)}`
                                                                }}
                                                            >
                                                                {status.icon}
                                                                <Typography variant="caption" fontWeight="bold">
                                                                    {status.label}
                                                                </Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                </Box>

                                                <Typography variant="subtitle1" fontWeight={700} noWrap title={doc.numeroDocumento}>
                                                    {doc.numeroDocumento}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {doc.tipoDocumento?.nombre || `Tipo ${doc.tipoDocumentoID}`}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', bgcolor: alpha(theme.palette.background.default, 0.5), p: 1, borderRadius: 1 }}>
                                                    <CalendarIcon fontSize="small" />
                                                    <Box>
                                                        <Typography variant="caption" display="block" color="text.secondary">Vencimiento</Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {formatDateLong(doc.fechaVencimiento)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>

                                            <CardActions sx={{ p: 1.5, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
                                                {doc.rutaArchivo && (
                                                    <Button 
                                                        size="small" 
                                                        startIcon={<DownloadIcon />}
                                                        onClick={() => handlePreview(doc.rutaArchivo!)}
                                                        color="inherit"
                                                    >
                                                        Ver
                                                    </Button>
                                                )}
                                                {!viewOnly && (
                                                    <>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleEdit(doc)}
                                                            color="primary"
                                                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={() => deleteMutation.mutate(doc.flotaDocumentoID)}
                                                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                    <TablePagination
                        component="div"
                        count={totalItems}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={ROWS_DOC_PER_PAGE_OPTIONS}
                        labelRowsPerPage="Items por página"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                        sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
                    />
                </Box>
            )}

            <Dialog 
                open={!!previewUrl} 
                onClose={handleClosePreview}
                maxWidth="lg"
                fullWidth
            >
                <DialogActions sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" sx={{ flex: 1, px: 2, fontWeight: 600 }}>
                        Vista Previa
                    </Typography>
                    <Button onClick={handleDownload} startIcon={<DownloadIcon />} variant="outlined" size="small" sx={{ mr: 1 }}>
                        Descargar
                    </Button>
                    <IconButton onClick={handleClosePreview} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogActions>
                <DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    {previewUrl && (
                        <img 
                            src={previewUrl} 
                            alt="Documento" 
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '80vh', 
                                objectFit: 'contain' 
                            }} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
