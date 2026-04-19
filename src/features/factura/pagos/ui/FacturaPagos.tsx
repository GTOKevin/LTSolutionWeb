import { useState } from 'react';
import { Box, Typography, IconButton, Paper, Collapse, useTheme, alpha } from '@mui/material';
import { Add as AddIcon, ExpandLess, ExpandMore } from '@mui/icons-material';
import type { Factura } from '@/entities/factura/model/types';
import { useDeleteFacturaPago, useFacturaPagos } from '../../hooks/useFacturaPagoCrud';
import { FacturaPagoForm } from './FacturaPagoForm';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ESTADO_FACTURA_ID } from '@/shared/constants/constantes';
import { FacturaPagoList } from './FacturaPagoList';
import { FacturaPagoMobileList } from './FacturaPagoMobileList';


interface FacturaPagosProps {
    factura: Factura;
}

export function FacturaPagos({ factura }: FacturaPagosProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pagoToDelete, setPagoToDelete] = useState<number | null>(null);
    
    const deleteMutation = useDeleteFacturaPago();
    const queryClient = useQueryClient();
    const theme = useTheme();

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
    const isEditing = false; // Just for theme alpha, as there is no edit yet
    const isReadOnly = factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                        if (factura.saldoPendiente <= 0 || factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO) return;
                        setIsFormOpen((prev) => !prev);
                    }}
                    sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: isFormOpen ? `1px solid ${theme.palette.divider}` : 'none',
                        cursor: (factura.saldoPendiente <= 0 || factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO) ? 'default' : 'pointer'
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
                            Agregar Pago
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size="small"
                            disabled={factura.saldoPendiente <= 0 || factura.estadoID === ESTADO_FACTURA_ID.ENTREGADO}
                        >
                            {isFormOpen ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Box>
                </Box>
                <Collapse in={isFormOpen} unmountOnExit>
                    <Box sx={{ p: 0 }}>
                        <FacturaPagoForm
                            onClose={() => setIsFormOpen(false)}
                            facturaId={factura.facturaID}
                            monedaId={factura.monedaID}
                            maxAmount={factura.saldoPendiente}
                        />
                    </Box>
                </Collapse>
            </Paper>

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
