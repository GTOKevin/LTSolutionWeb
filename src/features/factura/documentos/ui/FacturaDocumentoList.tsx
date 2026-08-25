import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Paper,
    TableCell,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Description as FileIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { facturaDocumentoApi } from '@entities/factura-documento/api/factura-documento.api';
import type { FacturaDocumento } from '@entities/factura-documento/model/types';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import { buildInternalFileUrl } from '@/shared/config/env';
import { useDeleteFacturaDocumento } from '../hooks/useFacturaDocumentoCrud';
import { FacturaDocumentoForm } from './FacturaDocumentoForm';

interface FacturaDocumentoListProps {
    facturaId: number;
    viewOnly?: boolean;
}

export function FacturaDocumentoList({ facturaId, viewOnly = false }: FacturaDocumentoListProps) {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [formOpen, setFormOpen] = useState(false);
    const [documentoToEdit, setDocumentoToEdit] = useState<FacturaDocumento | null>(null);
    const [documentoToDelete, setDocumentoToDelete] = useState<FacturaDocumento | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['factura-documentos', facturaId, page, rowsPerPage],
        queryFn: () => facturaDocumentoApi.getAll({ facturaID: facturaId, page: page + 1, size: rowsPerPage }),
        enabled: !!facturaId,
    });

    const deleteMutation = useDeleteFacturaDocumento();

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        setDocumentoToEdit(null);
        setFormOpen(true);
    };

    const handleEdit = (documento: FacturaDocumento) => {
        setDocumentoToEdit(documento);
        setFormOpen(true);
    };

    const handleDelete = (documento: FacturaDocumento) => {
        setDocumentoToDelete(documento);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (documentoToDelete) {
            deleteMutation.mutate(documentoToDelete.facturaDocumentoID, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setDocumentoToDelete(null);
                },
            });
        }
    };

    const handlePreview = (path: string) => {
        setPreviewUrl(buildInternalFileUrl(path) || null);
    };

    const columns: Column[] = [
        { id: 'descripcion', label: 'Descripción', minWidth: 250 },
        { id: 'archivo', label: 'Archivo', minWidth: 200 },
        { id: 'acciones', label: 'Acciones', align: 'center', width: 120 },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Documentos Registrados
                </Typography>
                {!viewOnly && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{ borderRadius: 2 }}
                    >
                        Agregar Documento
                    </Button>
                )}
            </Box>

            {isError ? (
                <Alert
                    severity="error"
                    action={(
                        <Button color="inherit" size="small" onClick={() => void refetch()} disabled={isFetching}>
                            Reintentar
                        </Button>
                    )}
                    sx={{ borderRadius: 2 }}
                >
                    {getErrorMessage(error, 'No se pudieron cargar los documentos de la factura.')}
                </Alert>
            ) : (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <SharedTable
                    data={data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    columns={columns}
                    keyExtractor={(item) => item.facturaDocumentoID}
                    emptyMessage="No hay documentos registrados para esta factura."
                    renderRow={(doc) => (
                        <>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        onClick={() => handlePreview(doc.rutaArchivo)}
                                        sx={{
                                            cursor: 'pointer',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            border: `1px solid ${theme.palette.divider}`,
                                            width: 48,
                                            height: 48,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: theme.palette.action.hover,
                                            color: 'primary.main',
                                        }}
                                    >
                                        <FileIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700}>
                                            {doc.descripcion || 'Sin descripción'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            #{doc.facturaDocumentoID}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                                    {doc.rutaArchivo}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <TableActions
                                    onView={doc.rutaArchivo ? () => handlePreview(doc.rutaArchivo) : undefined}
                                    onEdit={!viewOnly ? () => handleEdit(doc) : undefined}
                                    onDelete={!viewOnly ? () => handleDelete(doc) : undefined}
                                />
                            </TableCell>
                        </>
                    )}
                />
                </Paper>
            )}

            <FacturaDocumentoForm
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setDocumentoToEdit(null);
                }}
                facturaId={facturaId}
                documentoToEdit={documentoToEdit}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Eliminar Documento"
                content={`¿Está seguro que desea eliminar el documento ${documentoToDelete?.descripcion || ''}? Esta acción no se puede deshacer.`}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setDocumentoToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="Eliminar"
                severity="error"
                isLoading={deleteMutation.isPending}
            />

            <DocumentPreviewDialog
                open={!!previewUrl}
                onClose={() => setPreviewUrl(null)}
                previewUrl={previewUrl}
            />
        </Box>
    );
}