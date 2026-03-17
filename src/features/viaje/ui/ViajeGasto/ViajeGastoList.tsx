import { 
    Box, 
    Typography, 
    useTheme, 
    alpha, 
    Divider, 
    useMediaQuery, 
    CircularProgress,
    TableCell,
    Paper,
    Button,
    Stack,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import { 
    Receipt as ReceiptIcon,
    PictureAsPdf as PdfIcon,
    TableView as ExcelIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeGasto } from '@/entities/viaje/model/types';
import { viajeGastoApi } from '@/entities/viaje/api/viaje-gasto.api';
import type { SelectItem } from '@/shared/model/types';
import { useViajeGastos, useDeleteViajeGasto } from '@/features/viaje/hooks/useViajeGastos';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableLoading } from '@/shared/components/ui/TableLoading';
import { TableActions } from '@/shared/components/ui/TableActions';
import { formatDateShort } from '@/shared/utils/date-utils';

import { ViajeGastoMobileList } from './Index';

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

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Query & Mutations
    const { data, isLoading } = useViajeGastos(viajeId, page + 1, rowsPerPage);
    const deleteMutation = useDeleteViajeGasto();
    const gastos = data?.items ?? [];

    const handleExportExcel = async () => {
        try {
            setIsExportingExcel(true);
            const blob = await viajeGastoApi.getReportExcel(viajeId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Gastos_Viaje_${viajeId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            setSnackbar({ open: true, message: 'Reporte Excel descargado correctamente', severity: 'success' });
        } catch (error) {
            console.error('Error exporting Excel:', error);
            setSnackbar({ open: true, message: 'Error al descargar reporte Excel', severity: 'error' });
        } finally {
            setIsExportingExcel(false);
        }
    };

    const handleExportPdf = async () => {
        try {
            setIsExportingPdf(true);
            const blob = await viajeGastoApi.getReportPdf(viajeId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Gastos_Viaje_${viajeId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            setSnackbar({ open: true, message: 'Reporte PDF descargado correctamente', severity: 'success' });
        } catch (error) {
            console.error('Error exporting PDF:', error);
            setSnackbar({ open: true, message: 'Error al descargar reporte PDF', severity: 'error' });
        } finally {
            setIsExportingPdf(false);
        }
    };

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

    const totalsByCurrency = data?.totalsByCurrency ?? [];

    const getCurrencySummary = (code: string, defaultSymbol: string) => {
        const currency = totalsByCurrency.find(item => item.code === code);
        return {
            symbol: currency?.symbol || defaultSymbol,
            total: currency?.total ?? 0
        };
    };

    const penSummary = getCurrencySummary('PEN', 'S/.');
    const usdSummary = getCurrencySummary('USD', '$');
    const eurSummary = getCurrencySummary('EUR', '€');

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

    const columns: Column[] = [
        { id: 'tipo', label: 'Tipo de Gasto' },
        { id: 'fecha', label: 'Fecha Gasto' },
        { id: 'comprobante', label: 'Comprobante' },
        { id: 'combustible', label: 'Combustible' },
        { id: 'galones', label: 'Galones' },
        { id: 'monto', label: 'Monto' },
        { id: 'acciones', label: 'Acciones', align: 'center' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: isMobile ? 10 : 0 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <ReceiptIcon color="action" />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Gastos Registrados
                    </Typography>
                    {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Box>
                <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <Tooltip title="Exportar a Excel">
                        <span style={{ flex: isMobile ? 1 : 'none', width: isMobile ? '100%' : 'auto' }}>
                            <Button
                                fullWidth={isMobile}
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={isExportingExcel ? <CircularProgress size={16} /> : <ExcelIcon />}
                                disabled={isExportingExcel || gastos.length === 0}
                                onClick={handleExportExcel}
                            >
                                Excel
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip title="Exportar a PDF">
                        <span style={{ flex: isMobile ? 1 : 'none', width: isMobile ? '100%' : 'auto' }}>
                            <Button
                                fullWidth={isMobile}
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={isExportingPdf ? <CircularProgress size={16} /> : <PdfIcon />}
                                disabled={isExportingPdf || gastos.length === 0}
                                onClick={handleExportPdf}
                            >
                                PDF
                            </Button>
                        </span>
                    </Tooltip>
                    <Box sx={{ 
                        px: 1.5, py: 0.5, 
                        borderRadius: 1, 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: { xs: 'none', sm: 'block' }
                    }}>
                        Total: {data?.total ?? 0} registros
                    </Box>
                </Stack>
            </Box>

            {/* Desktop Table View */}
            {!isMobile ? (
                <>
                    <SharedTable
                        data={data}
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
                                    <TableCell sx={{ color: 'text.secondary' }}>
                                        {item.combustible ? 'SÍ' : 'NO'}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>
                                        {item.galones ? Number(item.galones).toFixed(2) : '-'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                        {moneda?.extra || 'PEN'} {Number(item.monto).toFixed(2)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <TableActions
                                            onEdit={!viewOnly ? () => onEdit?.(item) : undefined}
                                            onDelete={!viewOnly ? () => handleDelete(item.viajeGastoID) : undefined}
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
                                    <Typography variant="subtitle2" fontWeight="bold">{penSummary.symbol} {penSummary.total.toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">USD</Typography>
                                    <Typography variant="subtitle2" fontWeight="bold">{usdSummary.symbol} {usdSummary.total.toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">EUR</Typography>
                                    <Typography variant="subtitle2" fontWeight="bold">{eurSummary.symbol} {eurSummary.total.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </>
            ) : (
                isLoading ? (
                    <TableLoading />
                ) : (
                    <ViajeGastoMobileList 
                        items={gastos}
                        total={data?.total || 0}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        viewOnly={viewOnly}
                        tiposGasto={tiposGasto}
                        monedas={monedas}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                    />
                )
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
                            <Typography variant="h6" fontWeight="900">{penSummary.symbol} {penSummary.total.toFixed(2)}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1 }}>TOTAL (USD)</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">{usdSummary.symbol} {usdSummary.total.toFixed(2)}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1 }}>TOTAL (EUR)</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">{eurSummary.symbol} {eurSummary.total.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                </Paper>
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
