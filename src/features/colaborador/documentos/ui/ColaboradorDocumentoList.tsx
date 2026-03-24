import {
    Box,
    Typography,
    Button,
    useTheme,
    Avatar,
    Tooltip,
    alpha,
    TableCell,
    Stack,
    Paper,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    Description as FileIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    CalendarToday as CalendarIcon,
    ExpandLess,
    ExpandMore,
    Edit as EditIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { colaboradorDocumentoApi } from '@entities/colaborador-documento/api/colaborador-documento.api';
import type { ColaboradorDocumento } from '@entities/colaborador-documento/model/types';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { useState, useRef } from 'react';
import { ColaboradorDocumentoForm } from './ColaboradorDocumentoForm';
import { parseDateOnly, formatDateLong } from '@/shared/utils/date-utils';
import { useDeleteColaboradorDocumento } from '../../hooks/useColaboradorDocumentoCrud';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { TableActions } from '@/shared/components/ui/TableActions';

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
    const [isFormExpanded, setIsFormExpanded] = useState(true);
    const [documentoToEdit, setDocumentoToEdit] = useState<ColaboradorDocumento | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [documentoToDelete, setDocumentoToDelete] = useState<ColaboradorDocumento | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading } = useQuery({
        queryKey: ['colaborador-documentos', colaboradorId, page, rowsPerPage],
        queryFn: () => colaboradorDocumentoApi.getAll({ 
            colaboradorID: colaboradorId, 
            page: page + 1, 
            size: rowsPerPage 
        })
    });

    const items = data?.data?.items || [];
    const totalItems = data?.data?.total || 0;

    const deleteMutation = useDeleteColaboradorDocumento();

    const handleDeleteConfirm = () => {
        if (documentoToDelete) {
            deleteMutation.mutate(documentoToDelete.colaboradorDocumentoID, {
                onSuccess: () => {
                    setOpenDelete(false);
                    setDocumentoToDelete(null);
                }
            });
        }
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        setDocumentoToEdit(null);
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleEdit = (documento: ColaboradorDocumento) => {
        setDocumentoToEdit(documento);
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = (documento: ColaboradorDocumento) => {
        setDocumentoToDelete(documento);
        setOpenDelete(true);
    };

    const handlePreview = (path: string) => {
        setPreviewUrl(path);
    };

    const handleClosePreview = () => {
        setPreviewUrl(null);
    };

    const columns: Column[] = [
        { id: 'documento', label: 'Documento', minWidth: 250 },
        { id: 'vencimiento', label: 'Vencimiento', minWidth: 150 },
        { id: 'acciones', label: 'Acciones', align: 'center', width: 120 }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            {!viewOnly && (
                <Paper
                    ref={formRef}
                    elevation={0}
                    sx={{
                        p: 0,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: alpha(documentoToEdit ? theme.palette.warning.main : theme.palette.primary.main, 0.02),
                        overflow: 'hidden',
                        mb: 2
                    }}
                >
                    <Box
                        onClick={() => {
                            if (isFormExpanded && documentoToEdit) {
                                setDocumentoToEdit(null);
                                setIsFormExpanded(false);
                            } else if (!isFormExpanded && !documentoToEdit) {
                                handleCreate();
                            } else {
                                setIsFormExpanded((prev) => !prev);
                            }
                        }}
                        sx={{
                            px: 3,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: isFormExpanded ? `1px solid ${theme.palette.divider}` : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                                bgcolor: documentoToEdit ? theme.palette.warning.main : theme.palette.primary.main, 
                                color: 'white', 
                                p: 0.5, 
                                borderRadius: '50%', 
                                display: 'flex' 
                            }}>
                                {documentoToEdit ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                {documentoToEdit ? 'Editar Documento' : 'Agregar Documento'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {documentoToEdit && (
                                <Button 
                                    size="small" 
                                    color="inherit" 
                                    startIcon={<CancelIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDocumentoToEdit(null);
                                        setIsFormExpanded(false);
                                    }}
                                >
                                    Cancelar Edición
                                </Button>
                            )}
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsFormExpanded((prev) => !prev);
                                }}
                            >
                                {isFormExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    </Box>
                    <Collapse in={isFormExpanded} unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            <ColaboradorDocumentoForm
                                open={true}
                                onClose={() => {
                                    setDocumentoToEdit(null);
                                    setIsFormExpanded(false);
                                }}
                                colaboradorId={colaboradorId}
                                documentoToEdit={documentoToEdit}
                            />
                        </Box>
                    </Collapse>
                </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    Documentos Registrados
                </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 0.5 }}>
                <SharedTable
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    columns={columns}
                    keyExtractor={(item) => item.colaboradorDocumentoID}
                    emptyMessage="No hay documentos registrados."
                    renderRow={(doc) => {
                        const status = getExpirationStatus(doc.fechaVencimiento);
                        return (
                            <>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box 
                                            onClick={() => doc.rutaArchivo && handlePreview(doc.rutaArchivo)}
                                            sx={{ 
                                                cursor: doc.rutaArchivo ? 'pointer' : 'default',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: `1px solid ${theme.palette.divider}`,
                                                width: 48,
                                                height: 48,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: doc.rutaArchivo ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main'
                                            }}
                                        >
                                            {doc.rutaArchivo ? (
                                                <Avatar variant="rounded" src={doc.rutaArchivo} alt="Doc" sx={{ width: '100%', height: '100%' }} />
                                            ) : (
                                                <FileIcon />
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {doc.numeroDocumento || 'S/N'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {doc.tipoDocumento?.nombre || 'Documento'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatDateLong(doc.fechaVencimiento)}
                                        </Typography>
                                        {status && (
                                            <Tooltip title={status.fullLabel}>
                                                <Box 
                                                    sx={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: 0.5,
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: 1,
                                                        bgcolor: alpha(theme.palette[status.color].main, 0.1),
                                                        color: status.textColor,
                                                        width: 'fit-content'
                                                    }}
                                                >
                                                    {status.icon}
                                                    <Typography variant="caption" fontWeight="bold">
                                                        {status.label}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </TableCell>
                                <TableCell align="center">
                                    <TableActions
                                        onView={doc.rutaArchivo ? () => handlePreview(doc.rutaArchivo!) : undefined}
                                        onEdit={!viewOnly ? () => handleEdit(doc) : undefined}
                                        onDelete={!viewOnly ? () => handleDelete(doc) : undefined}
                                    />
                                </TableCell>
                            </>
                        );
                    }}
                />

                <MobileListShell
                    items={items}
                    total={totalItems}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    emptyMessage="No hay documentos registrados."
                    keyExtractor={(item) => item.colaboradorDocumentoID}
                    onView={viewOnly ? undefined : undefined} // Handled via actions
                    onEdit={viewOnly ? undefined : handleEdit}
                    onDelete={viewOnly ? undefined : handleDelete}
                    onPreview={(item) => item.rutaArchivo ? handlePreview(item.rutaArchivo) : undefined}
                    renderHeader={(doc) => {
                        return (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box 
                                        onClick={() => doc.rutaArchivo && handlePreview(doc.rutaArchivo)}
                                        sx={{ 
                                            cursor: doc.rutaArchivo ? 'pointer' : 'default',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            border: `1px solid ${theme.palette.divider}`,
                                            width: 48,
                                            height: 48,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: doc.rutaArchivo ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main'
                                        }}
                                    >
                                        {doc.rutaArchivo ? (
                                            <Avatar variant="rounded" src={doc.rutaArchivo} alt="Doc" sx={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            <FileIcon />
                                        )}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {doc.numeroDocumento || 'S/N'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {doc.tipoDocumento?.nombre || 'Documento'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    }}
                    renderBody={(doc) => {
                        const status = getExpirationStatus(doc.fechaVencimiento);
                        return (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', bgcolor: alpha(theme.palette.background.default, 0.5), p: 1, borderRadius: 1 }}>
                                <CalendarIcon fontSize="small" />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" display="block" color="text.secondary">Vencimiento</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {formatDateLong(doc.fechaVencimiento)}
                                    </Typography>
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
                        );
                    }}
                />
            </Box>

            <ConfirmDialog
                open={openDelete}
                title="Eliminar Documento"
                content={`¿Está seguro que desea eliminar el documento ${documentoToDelete?.numeroDocumento || ''}?`}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />

            <DocumentPreviewDialog 
                open={!!previewUrl}
                onClose={handleClosePreview}
                previewUrl={previewUrl}
            />
        </Box>
    );
}
