import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon, ListAlt as ListAltIcon } from '@mui/icons-material';
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

    const { data: detallesFetch = [], isLoading } = useFacturaDetalles(factura.facturaID);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (_: unknown, newPage: number) => {
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
    const isReadOnly = factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO || factura.estadoID === ESTADO_FACTURA_ID.EMITIDO;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListAltIcon />
                    Detalle de Factura
                </Typography>
                
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsFormOpen(true)}
                    disabled={factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO || factura.estadoID === ESTADO_FACTURA_ID.EMITIDO}
                    sx={{ borderRadius: 2 }}
                >
                    Agregar Detalle
                </Button>
            </Box>

            <FacturaDetalleForm
                open={isFormOpen}
                facturaId={factura.facturaID}
                monedaId={factura.monedaID}
                clienteId={factura.clienteID}
                onClose={() => setIsFormOpen(false)}
            />

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
