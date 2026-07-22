import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { Factura } from '@/entities/factura/model/types';
import { isFacturaGenerada } from '@/entities/factura/model/status';
import { useDeleteFacturaPago, useFacturaPagos } from '../../hooks/useFacturaPagoCrud';
import { FacturaPagoForm } from './FacturaPagoForm';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { FacturaPagoList } from './FacturaPagoList';
import { FacturaPagoMobileList } from './FacturaPagoMobileList';


interface FacturaPagosProps {
    factura: Factura;
    viewOnly?: boolean;
}

export function FacturaPagos({ factura, viewOnly = false }: FacturaPagosProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pagoToDelete, setPagoToDelete] = useState<number | null>(null);
    
    const deleteMutation = useDeleteFacturaPago();
    const queryClient = useQueryClient();

    const { data: pagosFetch = [], isLoading } = useFacturaPagos(factura.facturaID);

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
        setPagoToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (pagoToDelete !== null) {
            await deleteMutation.mutateAsync(pagoToDelete, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['factura', factura.facturaID] });
                    setDeleteDialogOpen(false);
                    setPagoToDelete(null);
                }
            });
        }
    };

    const pagos = pagosFetch;
    const paginatedPagos = pagos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const isReadOnly = viewOnly || isFacturaGenerada(factura) || factura.saldoPendiente <= 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt:2 }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span className="material-symbols-outlined">payments</span>
                    Amortizaciones
                </Typography>
                
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsFormOpen(true)}
                    disabled={factura.saldoPendiente <= 0 || isReadOnly}
                    sx={{ borderRadius: 2 }}
                >
                    Agregar Pago
                </Button>
            </Box>

            <FacturaPagoForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                factura={factura}
                facturaId={factura.facturaID}
                monedaId={factura.monedaID}
                maxAmount={factura.saldoPendiente}
            />

            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <FacturaPagoList
                        items={paginatedPagos}
                        total={pagos.length}
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
                <FacturaPagoMobileList
                    items={paginatedPagos}
                    total={pagos.length}
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
                title="Eliminar Pago"
                content="¿Está seguro que desea eliminar este pago? Esta acción no se puede deshacer."
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setPagoToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                confirmText="Eliminar"
            />
        </Box>
    );
}
