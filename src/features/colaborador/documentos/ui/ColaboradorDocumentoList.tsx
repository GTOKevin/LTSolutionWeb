import {
    Box,
    Typography,
    Button,
    useTheme,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    Snackbar,
    Alert,
    TablePagination,
    Dialog,
    DialogActions
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Description as FileIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colaboradorDocumentoApi } from '@entities/colaborador-documento/api/colaborador-documento.api';
import type { ColaboradorDocumento } from '@entities/colaborador-documento/model/types';
import { ExpirationStatus } from '@shared/components/ui/ExpirationStatus';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { useState } from 'react';
import { ColaboradorDocumentoForm } from './ColaboradorDocumentoForm';

const API_URL = import.meta.env.VITE_IMG_URL_BASE || 'https://localhost:44332';

interface ColaboradorDocumentoListProps {
    colaboradorId: number;
    viewOnly?: boolean;
}

export function ColaboradorDocumentoList({ colaboradorId, viewOnly = false }: ColaboradorDocumentoListProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [openForm, setOpenForm] = useState(false);
    const [documentoToEdit, setDocumentoToEdit] = useState<ColaboradorDocumento | null>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [documentoToDelete, setDocumentoToDelete] = useState<ColaboradorDocumento | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['colaborador-documentos', colaboradorId, page, rowsPerPage],
        queryFn: () => colaboradorDocumentoApi.getAll({ 
            colaboradorID: colaboradorId, 
            page: page + 1, 
            size: rowsPerPage 
        })
    });

    const items = data?.data?.items || [];
    const totalItems = data?.data?.total || 0;

    const deleteMutation = useMutation({
        mutationFn: (id: number) => colaboradorDocumentoApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colaborador-documentos', colaboradorId] });
            setOpenDelete(false);
            setDocumentoToDelete(null);
        },
        onError: () => {
            setErrorMessage('Error al eliminar el documento');
            setOpenSnackbar(true);
        }
    });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        setDocumentoToEdit(null);
        setOpenForm(true);
    };

    const handleEdit = (documento: ColaboradorDocumento) => {
        setDocumentoToEdit(documento);
        setOpenForm(true);
    };

    const handleDelete = (documento: ColaboradorDocumento) => {
        setDocumentoToDelete(documento);
        setOpenDelete(true);
    };

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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    Documentos Registrados
                </Typography>
                {!viewOnly && (
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        onClick={handleCreate}
                    >
                        Agregar Documento
                    </Button>
                )}
            </Box>

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
                            key={doc.colaboradorDocumentoID} 
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
                                        alt={doc.numeroDocumento || 'Doc'}
                                        sx={{ 
                                            width: 50, 
                                            height: 50,
                                            border: `1px solid ${theme.palette.divider}`
                                        }}
                                    />
                                ) : (
                                    <Box color="primary.main" sx={{ p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                        <FileIcon fontSize="large" />
                                    </Box>
                                )}
                            </Box>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {doc.numeroDocumento || 'S/N'}
                                        </Typography>
                                        <ExpirationStatus expirationDate={doc.fechaVencimiento} />
                                    </Box>
                                }
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                        <Typography variant="body2" component="span" color="text.primary">
                                            {doc.tipoDocumento?.nombre || 'Documento'}
                                        </Typography>
                                        <Typography variant="caption" component="span" color="text.secondary">
                                            Vence: {new Date(doc.fechaVencimiento).toLocaleDateString()}
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
                                        <ViewIcon fontSize="small" />
                                    </IconButton>
                                )}
                                {!viewOnly && (
                                    <>
                                        <IconButton size="small" color='primary' onClick={() => handleEdit(doc)} sx={{ mr: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(doc)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))
                )}
            </List>

            <TablePagination
                component="div"
                count={data?.data?.totalItems || 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />

            <ColaboradorDocumentoForm 
                open={openForm}
                onClose={() => setOpenForm(false)}
                colaboradorId={colaboradorId}
                documentoToEdit={documentoToEdit}
            />

            <ConfirmDialog
                open={openDelete}
                title="Eliminar Documento"
                content={`¿Está seguro que desea eliminar el documento ${documentoToDelete?.numeroDocumento || ''}?`}
                onClose={() => setOpenDelete(false)}
                onConfirm={() => documentoToDelete && deleteMutation.mutate(documentoToDelete.colaboradorDocumentoID)}
                isLoading={deleteMutation.isPending}
            />

            <DocumentPreviewDialog 
                open={!!previewUrl}
                onClose={handleClosePreview}
                previewUrl={previewUrl}
            />

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
