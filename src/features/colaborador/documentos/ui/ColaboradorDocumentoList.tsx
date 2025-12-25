import {
    Box,
    Typography,
    Button,
    useTheme,
    IconButton,
    Avatar,
    Snackbar,
    Alert,
    TablePagination,
    Grid,
    Card,
    CardContent,
    CardActions,
    Tooltip,
    alpha
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Description as FileIcon,
    Visibility as ViewIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colaboradorDocumentoApi } from '@entities/colaborador-documento/api/colaborador-documento.api';
import type { ColaboradorDocumento } from '@entities/colaborador-documento/model/types';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { useState } from 'react';
import { ColaboradorDocumentoForm } from './ColaboradorDocumentoForm';
import { parseDateOnly, formatDateLong } from '@/shared/utils/date-utils';
import { ROWS_DOC_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

const API_URL = import.meta.env.VITE_IMG_URL_BASE || 'https://localhost:44332';

interface ColaboradorDocumentoListProps {
    colaboradorId: number;
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
    const [rowsPerPage, setRowsPerPage] = useState(6);

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

            <Box sx={{ flex: 1, overflow: 'auto', p: 0.5 }}>
                {isLoading ? (
                    <Box p={3} textAlign="center">Cargando documentos...</Box>
                ) : items.length === 0 ? (
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
                        {items.map((doc) => {
                            const status = getExpirationStatus(doc.fechaVencimiento);
                            return (
                                <Grid size={{xs:12,sm:6,md:4}} key={doc.colaboradorDocumentoID}>
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
                                                            src={getFullUrl(doc.rutaArchivo)}
                                                            alt={doc.numeroDocumento || 'Doc'}
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

                                            <Typography variant="subtitle1" fontWeight={700} noWrap title={doc.numeroDocumento || 'S/N'}>
                                                {doc.numeroDocumento || 'S/N'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {doc.tipoDocumento?.nombre || 'Documento'}
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
                                                    startIcon={<ViewIcon />}
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
                                                        onClick={() => handleDelete(doc)}
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
                    labelRowsPerPage="Filas por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
                />
            </Box>

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
