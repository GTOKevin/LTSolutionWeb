import {
    Box,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    alpha,
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    Inventory2 as BoxIcon,
} from '@mui/icons-material';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import type { FacturaReporte, FacturaDetalleReporte } from '@/entities/factura/model/types';

interface FacturaLineItemsTableProps {
    factura: FacturaReporte;
}

export function FacturaLineItemsTable({ factura }: FacturaLineItemsTableProps) {
    const theme = useTheme();
    const detalles: FacturaDetalleReporte[] = factura.detalles ?? [];

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                bgcolor: 'background.paper',
                boxShadow: '0 12px 32px -8px rgba(25, 28, 29, 0.05)',
                overflow: 'hidden',
            }}
        >
            {/* Header de la sección */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ShippingIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        Servicios y Viajes Facturados
                    </Typography>
                </Box>
                <Chip
                    label={`${detalles.length} ${detalles.length === 1 ? 'Ítem' : 'Ítems'}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
            </Box>

            {detalles.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <BoxIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No hay ítems registrados en esta factura.
                    </Typography>
                </Box>
            ) : (
                <TableContainer>
                    <Table size="medium">
                        <TableHead
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                '& .MuiTableCell-head': {
                                    color: 'text.primary',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    py: 1.5,
                                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                            }}
                        >
                            <TableRow>
                                <TableCell>
                                    Descripción / Referencia
                                </TableCell>
                                <TableCell>
                                    Ruta y Unidad
                                </TableCell>
                                <TableCell align="right">
                                    Subtotal
                                </TableCell>
                                <TableCell align="right">
                                    IGV (18%)
                                </TableCell>
                                <TableCell align="right">
                                    Total
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detalles.map((detalle, index) => {
                                const isEven = index % 2 === 0;
                                const ruta = detalle.origen && detalle.destino ? `${detalle.origen} → ${detalle.destino}` : null;

                                return (
                                    <TableRow
                                        key={detalle.facturaDetalleID}
                                        sx={{
                                            bgcolor: isEven ? 'transparent' : alpha(theme.palette.action.hover, 0.25),
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                                            transition: 'background-color 0.15s',
                                        }}
                                    >
                                        <TableCell sx={{ verticalAlign: 'top', py: 2 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {detalle.viajeCodigo ? (
                                                        <Chip
                                                            label={`Viaje ${detalle.viajeCodigo}`}
                                                            size="small"
                                                            color="info"
                                                            variant="outlined"
                                                            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                                                        />
                                                    ) : null}
                                                </Box>
                                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                                    {detalle.descripcion || 'Servicio de Flete'}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ verticalAlign: 'top', py: 2 }}>
                                            {ruta && (
                                                <Typography variant="caption" color="text.primary" fontWeight={600} sx={{ display: 'block' }}>
                                                    {ruta}
                                                </Typography>
                                            )}
                                            {detalle.tractoPlaca && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Placa: {detalle.tractoPlaca}
                                                </Typography>
                                            )}
                                            {!ruta && !detalle.tractoPlaca && (
                                                <Typography variant="caption" color="text.disabled">
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell align="right" sx={{ verticalAlign: 'top', py: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {formatCurrencyAmount(detalle.subTotal, factura.moneda)}
                                        </TableCell>

                                        <TableCell align="right" sx={{ verticalAlign: 'top', py: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {formatCurrencyAmount(detalle.igv, factura.moneda)}
                                        </TableCell>

                                        <TableCell align="right" sx={{ verticalAlign: 'top', py: 2, fontFamily: 'monospace', fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
                                            {formatCurrencyAmount(detalle.total, factura.moneda)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}
