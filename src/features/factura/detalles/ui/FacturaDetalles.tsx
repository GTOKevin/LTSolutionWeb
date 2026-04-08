import { useState } from 'react';
import { Box, Typography, IconButton, Paper, Collapse, useTheme, alpha } from '@mui/material';
import { Add as AddIcon, ExpandLess, ExpandMore } from '@mui/icons-material';
import type { Factura } from '@/entities/factura/model/types';
import { useDeleteFacturaDetalle, useFacturaDetalles } from '../../hooks/useFacturaDetalleCrud';
import { FacturaDetalleForm } from './FacturaDetalleForm';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ESTADO_FACTURA_ID } from '@/shared/constants/constantes';
import { FacturaDetalleList } from './FacturaDetalleList';
import { FacturaDetalleMobileList } from './FacturaDetalleMobileList';

interface FacturaDetallesProps {
    factura: Factura;
}

export function FacturaDetalles({ factura }: FacturaDetallesProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detalleToDelete, setDetalleToDelete] = useState<number | null>(null);
    
    const deleteMutation = useDeleteFacturaDetalle();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const { data: detallesFetch = [], isLoading } = useFacturaDetalles(factura.facturaID);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (id: number) => {
        setDetalleToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (detalleToDelete !== null) {
            await deleteMutation.mutateAsync(detalleToDelete, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['factura', factura.facturaID] });
                    setDeleteDialogOpen(false);
                    setDetalleToDelete(null);
                }
            });
        }
    };

    const detalles = detallesFetch;
    const paginatedDetalles = detalles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const isEditing = isFormOpen;
    const isReadOnly = factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO || factura.estadoID === ESTADO_FACTURA_ID.EMITIDO;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 0,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.02),
                    overflow: 'hidden'
                }}
            >
                <Box
                    onClick={() => {
                        if (factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO) return;
                        setIsFormOpen((prev) => !prev);
                    }}
                    sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: isFormOpen ? `1px solid ${theme.palette.divider}` : 'none',
                        cursor: (factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO) ? 'default' : 'pointer'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                            bgcolor: theme.palette.primary.main, 
                            color: 'white', 
                            p: 0.5, 
                            borderRadius: '50%', 
                            display: 'flex' 
                        }}>
                            <AddIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                            Agregar Detalle
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size="small"
                            disabled={factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO}
                        >
                            {isFormOpen ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Box>
                </Box>
                <Collapse in={isFormOpen} unmountOnExit>
                    <Box sx={{ p: 0 }}>
                        <FacturaDetalleForm
                            facturaId={factura.facturaID}
                            monedaId={factura.monedaID}
                            clienteId={factura.clienteID}
                            onClose={() => setIsFormOpen(false)}
                        />
                    </Box>
                </Collapse>
            </Paper>

            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <FacturaDetalleList
                        items={paginatedDetalles}
                        total={detalles.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        isLoading={isLoading}
                        isReadOnly={isReadOnly}
                        isDeleting={deleteMutation.isPending}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        onDelete={handleDeleteClick}
                    />
                </Box>
                <FacturaDetalleMobileList
                    items={paginatedDetalles}
                    total={detalles.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    isReadOnly={isReadOnly}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onDelete={handleDeleteClick}
                />
            </Box>

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Eliminar Detalle"
                content="¿Está seguro que desea eliminar este detalle? Esta acción no se puede deshacer."
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setDetalleToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                confirmText="Eliminar"
            />
        </Box>
    );
}
