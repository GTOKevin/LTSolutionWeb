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
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as FileIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { CreateFlotaDocumentoSchema } from '../../model/schema';
import { useState } from 'react';
import type { FlotaDocumento } from '@entities/flota/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';

import { FlotaDocumentosForm } from './FlotaDocumentosForm';

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

    const { data, isLoading } = useQuery({
        queryKey: ['flota-documentos', flotaId],
        queryFn: () => flotaApi.getDocumentos({ flotaId, page: 1, size: 100 }),
        enabled: !!flotaId
    });

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
                                <Box mr={2} color="primary.main"><FileIcon /></Box>
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
                                {!viewOnly && (
                                    <ListItemSecondaryAction>
                                        <IconButton size="small" onClick={() => handleEdit(doc)} sx={{ mr: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(doc.flotaDocumentoID)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>
                        ))
                    )}
                </List>
            )}

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
