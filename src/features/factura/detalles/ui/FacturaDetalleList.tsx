import { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Paper, Collapse, useTheme, alpha } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ExpandLess, ExpandMore } from '@mui/icons-material';
import { formatCurrency } from '@/shared/utils/format-utils';
import { useDeleteFacturaDetalle } from '../../hooks/useFacturaDetalleCrud';
import type { Factura } from '@/entities/factura/model/types';
import { FacturaDetalleForm } from './FacturaDetalleForm';
import { useQueryClient } from '@tanstack/react-query';

interface FacturaDetalleListProps {
    factura: Factura;
}

export function FacturaDetalleList({ factura }: FacturaDetalleListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const deleteMutation = useDeleteFacturaDetalle();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Está seguro que desea eliminar este detalle?')) {
            await deleteMutation.mutateAsync(id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['factura', factura.facturaID] });
                }
            });
        }
    };

    const detalles = factura.facturaDetalles || [];
    const isEditing = isFormOpen;

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
                        if (factura.estadoID === 2 || factura.estadoID === 3) return; // pagada o anulada
                        setIsFormOpen((prev) => !prev);
                    }}
                    sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: isFormOpen ? `1px solid ${theme.palette.divider}` : 'none',
                        cursor: (factura.estadoID === 2 || factura.estadoID === 3) ? 'default' : 'pointer'
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
                            disabled={factura.estadoID === 2 || factura.estadoID === 3}
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

            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Viaje</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell align="right">SubTotal</TableCell>
                            <TableCell align="right">IGV</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detalles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No hay detalles registrados</TableCell>
                            </TableRow>
                        ) : (
                            detalles.map((detalle) => (
                                <TableRow key={detalle.facturaDetalleID}>
                                    <TableCell>{detalle.viajeID}</TableCell>
                                    <TableCell>{detalle.descripcion || '-'}</TableCell>
                                    <TableCell align="right">{formatCurrency(detalle.subTotal, detalle.moneda?.simbolo)}</TableCell>
                                    <TableCell align="right">{formatCurrency(detalle.igv, detalle.moneda?.simbolo)}</TableCell>
                                    <TableCell align="right"><strong>{formatCurrency(detalle.total, detalle.moneda?.simbolo)}</strong></TableCell>
                                    <TableCell align="center">
                                        <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => handleDelete(detalle.facturaDetalleID)}
                                            disabled={deleteMutation.isPending || factura.estadoID === 2 || factura.estadoID === 3}
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
