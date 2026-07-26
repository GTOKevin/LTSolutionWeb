import { 
    Box, Typography, useTheme, alpha, IconButton, CircularProgress, TablePagination
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useViajeGastos, useDeleteViajeGasto } from '@features/viaje/hooks/useViajeGastos';
import { useViajeGastoOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatCurrencyAmount, formatDecimalAmount } from '@/shared/utils/format-utils';
import { logger } from '@/shared/utils/logger';

interface GastosListProps {
    viajeID: number;
    isViewOnly?: boolean;
}

export function GastosList({ viajeID, isViewOnly }: GastosListProps) {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

    const { data: gastosData, isLoading: isLoadingGastos } = useViajeGastos(viajeID, page + 1, rowsPerPage);
    const deleteMutation = useDeleteViajeGasto();
    const { tiposGasto, monedas } = useViajeGastoOptions(true);

    const gastos = gastosData?.items ?? [];
    const totalsByCurrency = gastosData?.totalsByCurrency ?? [];

    const handleDelete = async (id: number) => {
        try {
            await deleteMutation.mutateAsync({ id, viajeId: viajeID });
        } catch (error) {
            logger.error("Error al eliminar gasto", error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 3, 
                borderRadius: 3, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Resumen de Gastos
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Listado de transacciones registradas para este viaje.
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1, display: 'block', lineHeight: 1 }}>
                            Total Acumulado
                        </Typography>
                        {totalsByCurrency.length > 0 ? (
                            totalsByCurrency.map((t, idx) => (
                                <Typography key={idx} variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                    {t.symbol} {t.total.toFixed(2)}
                                </Typography>
                            ))
                        ) : (
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                {formatDecimalAmount(0)}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box sx={{ overflowX: 'auto' }}>
                    <Box component="table" sx={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <Box component="thead">
                            <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                                <Box component="th" sx={{ pb: 2, typography: 'overline', fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>Producto</Box>
                                <Box component="th" sx={{ pb: 2, typography: 'overline', fontWeight: 800, color: 'text.secondary', letterSpacing: 1, textAlign: 'center' }}>Fecha</Box>
                                <Box component="th" sx={{ pb: 2, typography: 'overline', fontWeight: 800, color: 'text.secondary', letterSpacing: 1, textAlign: 'center' }}>Comprobante</Box>
                                <Box component="th" sx={{ pb: 2, typography: 'overline', fontWeight: 800, color: 'text.secondary', letterSpacing: 1, textAlign: 'right' }}>Total</Box>
                                <Box component="th" sx={{ pb: 2 }}></Box>
                            </Box>
                        </Box>
                        <Box component="tbody" sx={{ '& tr': { transition: 'background-color 0.2s' }, '& tr:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                            {isLoadingGastos ? (
                                <Box component="tr">
                                    <Box component="td" colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                </Box>
                            ) : gastos.length === 0 ? (
                                <Box component="tr">
                                    <Box component="td" colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">No hay gastos registrados</Typography>
                                    </Box>
                                </Box>
                            ) : (
                                gastos.map((gasto) => {
                                    const tipo = tiposGasto?.find(t => t.id === gasto.gastoID)?.text || gasto.gasto?.descripcion || 'Otro';
                                    const moneda = monedas?.find(m => m.id === gasto.monedaID);
                                    const monedaDescriptor = {
                                        codigo: moneda?.extra,
                                        nombre: moneda?.text,
                                    };

                                    return (
                                        <Box component="tr" key={gasto.viajeGastoID} sx={{ borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                                            <Box component="td" sx={{ py: 2 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                        {tipo}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {gasto.descripcion || 'Sin descripción'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box component="td" sx={{ py: 2, textAlign: 'center' }}>
                                                <Typography variant="body2">{formatDateShort(gasto.fechaGasto)}</Typography>
                                            </Box>
                                            <Box component="td" sx={{ py: 2, textAlign: 'center' }}>
                                                {gasto.comprobante ? (
                                                    <Typography variant="caption" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', px: 1, py: 0.5, borderRadius: 1 }}>
                                                        {gasto.numeroComprobante || 'SÍ'}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>No</Typography>
                                                )}
                                            </Box>
                                            <Box component="td" sx={{ py: 2, textAlign: 'right' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                        {formatCurrencyAmount(Number(gasto.monto), monedaDescriptor)}
                                                </Typography>
                                                {gasto.combustible && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                        {gasto.galones} Gal.
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box component="td" sx={{ py: 2, textAlign: 'right', pr: 1 }}>
                                                {!isViewOnly && (
                                                    <IconButton 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => handleDelete(gasto.viajeGastoID)}
                                                        disabled={deleteMutation.isPending}
                                                        sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                    </Box>
                </Box>
                
                {gastosData && gastosData.total > 0 && (
                    <TablePagination
                        component="div"
                        count={gastosData.total}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[10]}
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    />
                )}
            </Box>
        </Box>
    );
}
