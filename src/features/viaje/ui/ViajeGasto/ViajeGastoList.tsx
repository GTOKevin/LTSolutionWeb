import { 
    Box, 
    Typography, 
    useTheme, 
    alpha, 
    Card, 
    CardContent, 
    Divider, 
    useMediaQuery, 
    CircularProgress,
    TableCell,
    Paper
} from '@mui/material';
import { 
    Receipt as ReceiptIcon,
    CalendarToday as CalendarIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeGasto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useViajeGastos, useDeleteViajeGasto } from '@/features/viaje/hooks/useViajeGastos';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableLoading } from '@/shared/components/ui/TableLoading';
import { TableActions } from '@/shared/components/ui/TableActions';
import { formatDateShort } from '@/shared/utils/date-utils';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    tiposGasto: SelectItem[];
    monedas: SelectItem[];
    onEdit?: (item: ViajeGasto) => void;
}

export function ViajeGastoList({ viajeId, viewOnly, tiposGasto, monedas, onEdit }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Query & Mutations
    const { data: gastos = [], isLoading } = useViajeGastos(viajeId);
    const deleteMutation = useDeleteViajeGasto();

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async (id: number) => {
        if (!viajeId) return;
        try {
            await deleteMutation.mutateAsync({ id, viajeId });
        } catch (error) {
            console.error("Error deleting gasto:", error);
        }
    };

    // Calculate totals
    const totalPEN = gastos.reduce((acc: number, item: ViajeGasto) => {
        const moneda = monedas.find(m => m.id === item.monedaID);
        return acc + (moneda?.extra === 'PEN' || item.monedaID === 1 ? Number(item.monto) : 0);
    }, 0);

    const totalUSD = gastos.reduce((acc: number, item: ViajeGasto) => {
        const moneda = monedas.find(m => m.id === item.monedaID);
        return acc + (moneda?.extra === 'USD' || item.monedaID === 2 ? Number(item.monto) : 0);
    }, 0);

    const getGastoColor = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('combustible')) return theme.palette.primary.main;
        if (lower.includes('peaje')) return theme.palette.success.main;
        if (lower.includes('viatico')) return theme.palette.warning.main;
        if (lower.includes('mantenimiento')) return theme.palette.error.main;
        return theme.palette.info.main;
    };

    const getGastoBg = (text: string = '') => {
        return alpha(getGastoColor(text), 0.1);
    };

    // Client-side pagination
    const paginatedGastos = gastos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const pagedData = {
        items: paginatedGastos,
        total: gastos.length,
        page: page + 1,
        size: rowsPerPage,
        totalPages: Math.ceil(gastos.length / rowsPerPage)
    };

    const columns: Column[] = [
        { id: 'tipo', label: 'Tipo de Gasto' },
        { id: 'fecha', label: 'Fecha Gasto' },
        { id: 'comprobante', label: 'Comprobante' },
        { id: 'monto', label: 'Monto' },
        { id: 'acciones', label: 'Acciones', align: 'center' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: isMobile ? 10 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="action" />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Gastos Registrados
                    </Typography>
                    {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Box>
                <Box sx={{ 
                    px: 1.5, py: 0.5, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    Total: {gastos.length} registros
                </Box>
            </Box>

            {/* Desktop Table View */}
            {!isMobile ? (
                <>
                    <SharedTable
                        data={pagedData}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        columns={columns}
                        keyExtractor={(item) => item.viajeGastoID}
                        emptyMessage="No hay gastos registrados"
                        renderRow={(item) => {
                            const tipo = tiposGasto.find(t => t.id === item.gastoID);
                            const moneda = monedas.find(m => m.id === item.monedaID);
                            const tipoText = tipo?.text || item.gasto?.descripcion || 'Otro';

                            return (
                                <>
                                    <TableCell>
                                        <Box sx={{ 
                                            display: 'inline-block',
                                            px: 1.5, py: 0.5, 
                                            borderRadius: 1, 
                                            bgcolor: getGastoBg(tipoText),
                                            color: getGastoColor(tipoText),
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {tipoText}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                        {formatDateShort(item.fechaGasto)}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>
                                        {item.comprobante ? item.numeroComprobante : 'Sin comprobante'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                        {moneda?.extra || 'PEN'} {Number(item.monto).toFixed(2)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <TableActions
                                            onEdit={() => onEdit?.(item)}
                                            onDelete={() => handleDelete(item.viajeGastoID)}
                                            disableEdit={viewOnly}
                                            disableDelete={viewOnly || deleteMutation.isPending}
                                            editTooltip="Editar gasto"
                                            deleteTooltip="Eliminar gasto"
                                        />
                                    </TableCell>
                                </>
                            );
                        }}
                    />
                    
                    {/* Summary Footer for Desktop */}
                    {gastos.length > 0 && (
                        <Paper 
                            elevation={0}
                            sx={{ 
                                mt: 2,
                                p: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: 4
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Total Gastos
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">PEN</Typography>
                                    <Typography variant="subtitle2" fontWeight="bold">S/ {totalPEN.toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">USD</Typography>
                                    <Typography variant="subtitle2" fontWeight="bold">$ {totalUSD.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {isLoading ? (
                        <TableLoading />
                    ) : (
                        <>
                            {gastos.map((item: ViajeGasto) => {
                        const tipo = tiposGasto.find(t => t.id === item.gastoID);
                        const moneda = monedas.find(m => m.id === item.monedaID);
                        const tipoText = tipo?.text || item.gasto?.descripcion || 'Otro';
                        
                        return (
                            <Card key={item.viajeGastoID} elevation={0} sx={{ 
                                borderRadius: 3, 
                                border: `1px solid ${theme.palette.divider}`,
                                borderLeft: `4px solid ${getGastoColor(tipoText)}`
                            }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ 
                                            px: 1.5, py: 0.5, 
                                            borderRadius: 1, 
                                            bgcolor: getGastoBg(tipoText),
                                            color: getGastoColor(tipoText),
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {tipoText}
                                        </Box>
                                        <TableActions
                                            onEdit={() => onEdit?.(item)}
                                            onDelete={() => handleDelete(item.viajeGastoID)}
                                            disableEdit={viewOnly}
                                            disableDelete={viewOnly || deleteMutation.isPending}
                                            editTooltip="Editar gasto"
                                            deleteTooltip="Eliminar gasto"
                                        />
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <CalendarIcon sx={{ fontSize: 14 }} />
                                                <Typography variant="caption">{formatDateShort(item.fechaGasto)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <TicketIcon sx={{ fontSize: 14 }} />
                                                <Typography variant="caption">
                                                    {item.comprobante ? item.numeroComprobante : 'S/C'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight="900">
                                            {moneda?.extra || 'PEN'} {Number(item.monto).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                        })}
                        {!isLoading && gastos.length === 0 && (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                No hay gastos registrados
                            </Typography>
                        )}
                    </>
                )}
                </Box>
            )}

            {/* Mobile Fixed Summary Bar */}
            {isMobile && gastos.length > 0 && (
                <Paper 
                    elevation={4}
                    sx={{ 
                        position: 'fixed', 
                        bottom: 16, 
                        left: 16, 
                        right: 16, 
                        zIndex: 1000,
                        bgcolor: theme.palette.primary.main,
                        color: 'primary.contrastText',
                        borderRadius: 3,
                        p: 2
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1 }}>TOTAL (PEN)</Typography>
                            <Typography variant="h6" fontWeight="900">S/ {totalPEN.toFixed(2)}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1 }}>TOTAL (USD)</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">$ {totalUSD.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}
