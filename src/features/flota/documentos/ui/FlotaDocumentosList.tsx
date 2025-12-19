import {
    Button,
    Box,
    useTheme,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    Snackbar,
    Alert,
    Dialog,
    DialogContent,
    DialogActions,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as FileIcon,
    Download as DownloadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { CreateFlotaDocumentoSchema } from '../../model/schema';
import { useState } from 'react';
import type { FlotaDocumento } from '@entities/flota/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';

import { FlotaDocumentosForm } from './FlotaDocumentosForm';

const API_URL = import.meta.env.VITE_IMG_URL_BASE || 'https://localhost:44332';

interface FlotaDocumentosListProps {
    flotaId: number;
    viewOnly?: boolean;
}

export function FlotaDocumentosList({ flotaId, viewOnly = false }: FlotaDocumentosListProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [editingDoc, setEditingDoc] = useState<CreateFlotaDocumentoSchema | undefined>(undefined);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    
    // Preview state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['flota-documentos', flotaId],
        queryFn: () => flotaApi.getDocumentos({ flotaId, page: 1, size: 100 }),
        enabled: !!flotaId
    });

    const getFullUrl = (path?: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = API_URL.replace(/\/api\/?$/, '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handlePreview = (path: string) => {
        setPreviewUrl(getFullUrl(path));
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
            // Fallback
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
        onError: (error: any) => {
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
        onError: (error: any) => {
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
                <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
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
                        data?.data?.items?.map((doc) => (
                            <ListItem 
                                key={doc.flotaDocumentoID} 
                                divider
                                sx={{ 
                                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.05)' },
                                    borderRadius: 1,
                                    mb: 1,
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Box mr={2} sx={{ cursor: doc.rutaArchivo ? 'pointer' : 'default' }} onClick={() => doc.rutaArchivo && handlePreview(doc.rutaArchivo)}>
                                    {doc.rutaArchivo ? (
                                        <Avatar
                                            variant="rounded"
                                            src={getFullUrl(doc.rutaArchivo)}
                                            alt={doc.numeroDocumento}
                                            sx={{ 
                                                width: 50, 
                                                height: 50,
                                                border: `1px solid ${theme.palette.divider}`
                                            }}
                                        />
                                    ) : (
                                        <Box color="primary.main"><FileIcon fontSize="large" /></Box>
                                    )}
                                </Box>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle1" fontWeight={600}>{doc.numeroDocumento}</Typography>
                                            <StatusChip active={doc.estado} />
                                        </Box>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                            <Typography variant="body2" component="span" color="text.primary">
                                                {doc.tipoDocumento?.nombre || `Tipo ${doc.tipoDocumentoID}`}
                                            </Typography>
                                            <Typography variant="caption" component="span" color="text.secondary">
                                                Vence: {doc.fechaVencimiento}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    {doc.rutaArchivo && (
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handlePreview(doc.rutaArchivo!)} 
                                            sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}
                                            title="Ver documento"
                                        >
                                            <Box component="span" sx={{ display: 'none' }}>Descargar</Box>
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    {!viewOnly && (
                                        <>
                                            <IconButton size="small" onClick={() => handleEdit(doc)} sx={{ mr: 1 }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(doc.flotaDocumentoID)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    )}
                </List>
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
