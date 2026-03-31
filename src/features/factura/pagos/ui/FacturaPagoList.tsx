import { useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Paper, Collapse, useTheme, alpha } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ExpandLess, ExpandMore } from '@mui/icons-material';
import type { Factura } from '@/entities/factura/model/types';
import { formatCurrency } from '@/shared/utils/format-utils';
import { formatDateLong } from '@/shared/utils/date-utils';
import { useDeleteFacturaPago } from '../../hooks/useFacturaPagoCrud';
import { FacturaPagoForm } from './FacturaPagoForm';
import { useQueryClient } from '@tanstack/react-query';

interface FacturaPagoListProps {
    factura: Factura;
}

export function FacturaPagoList({ factura }: FacturaPagoListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const deleteMutation = useDeleteFacturaPago();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const isEditing = false; // Just for theme alpha, as there is no edit yet
    
    const handleDelete = async (id: number) => {
        if (window.confirm('¿Está seguro que desea eliminar este pago?')) {
            await deleteMutation.mutateAsync(id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['factura', factura.facturaID] });
                }
            });
        }
    };

    const pagos = factura.facturaPagos || [];

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
                        if (factura.saldoPendiente <= 0 || factura.estadoID === 3) return; // Pagada o Anulada
                        setIsFormOpen((prev) => !prev);
                    }}
                    sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: isFormOpen ? `1px solid ${theme.palette.divider}` : 'none',
                        cursor: (factura.saldoPendiente <= 0 || factura.estadoID === 3) ? 'default' : 'pointer'
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
                            disabled={factura.saldoPendiente <= 0 || factura.estadoID === 3}
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

            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Acreditación</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Operación</TableCell>
                            <TableCell>Observación</TableCell>
                            <TableCell align="right">Monto</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pagos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No hay pagos registrados</TableCell>
                            </TableRow>
                        ) : (
                            pagos.map((pago) => (
                                <TableRow key={pago.facturaPagoID}>
                                    <TableCell>{formatDateLong(pago.fechaPago)}</TableCell>
                                    <TableCell>{pago.fechaAcreditacion ? formatDateLong(pago.fechaAcreditacion) : '-'}</TableCell>
                                    <TableCell>{pago.tipoPago?.descripcion}</TableCell>
                                    <TableCell>{pago.estado?.descripcion || '-'}</TableCell>
                                    <TableCell>{pago.numeroOperacion || '-'}</TableCell>
                                    <TableCell>{pago.observacion || '-'}</TableCell>
                                    <TableCell align="right">
                                        <strong>{formatCurrency(pago.montoAbonado, pago.moneda?.simbolo)}</strong>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => handleDelete(pago.facturaPagoID)}
                                            disabled={deleteMutation.isPending || factura.estadoID === 3}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
}
