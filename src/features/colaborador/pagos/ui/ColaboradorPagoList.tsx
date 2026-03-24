import {
    Box,
    Typography,
    Button,
    useTheme,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    TablePagination,
    Chip,
    Grid,
    TextField,
    MenuItem,
    Tooltip,
    CircularProgress,
    Stack,
    Paper,
    Collapse,
    IconButton as MuiIconButton,
    alpha
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Payment as PaymentIcon,
    PictureAsPdf as PdfIcon,
    TableView as ExcelIcon,
    Search as SearchIcon,
    ExpandLess,
    ExpandMore,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { colaboradorPagoApi } from '@entities/colaborador-pago/api/colaborador-pago.api';
import type { ColaboradorPago } from '@entities/colaborador-pago/model/types';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { useState, useRef } from 'react';
import { ColaboradorPagoForm } from './ColaboradorPagoForm';
import { formatDateShort, getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@/shared/utils/date-utils';
import { useDeleteColaboradorPago } from '../../hooks/useColaboradorPagoCrud';
import { maestroApi } from '@/shared/api/maestro.api';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import { pdf } from '@react-pdf/renderer';
import { ColaboradorPagosPdf } from '../reports/ColaboradorPagosPdf';
import { ColaboradorPagosExcelGenerator } from '../lib/ColaboradorPagosExcelGenerator';
import { logger } from '@/shared/utils/logger';

interface ColaboradorPagoListProps {
    colaboradorId: number;
    viewOnly?: boolean;
}

export function ColaboradorPagoList({ colaboradorId, viewOnly = false }: ColaboradorPagoListProps) {
    const theme = useTheme();
    const [isFormExpanded, setIsFormExpanded] = useState(true);
    const [pagoToEdit, setPagoToEdit] = useState<ColaboradorPago | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [pagoToDelete, setPagoToDelete] = useState<ColaboradorPago | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Filters (Input State)
    const [tipoPagoID, setTipoPagoID] = useState<number | ''>('');
    const [desde, setDesde] = useState<string>(getFirstDayOfCurrentMonthISO(-1));
    const [hasta, setHasta] = useState<string>(getLastDayOfCurrentMonthISO());

    // Filter params that trigger the query
    const [filterParams, setFilterParams] = useState({
        tipoPagoID: '' as number | '',
        desde: getFirstDayOfCurrentMonthISO(-1),
        hasta: getLastDayOfCurrentMonthISO()
    });

    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const { data: tiposPago } = useQuery({
        queryKey: ['tipos-pago'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_PAGO)
    });

    const { data, isLoading } = useQuery({
        queryKey: ['colaborador-pagos', colaboradorId, page, rowsPerPage, filterParams],
        queryFn: () => colaboradorPagoApi.getAll({ 
            colaboradorID: colaboradorId, 
            tipoPagoID: filterParams.tipoPagoID ? Number(filterParams.tipoPagoID) : undefined,
            desde: filterParams.desde || undefined,
            hasta: filterParams.hasta || undefined,
            page: page + 1, 
            size: rowsPerPage 
        })
    });

    const items = data?.data?.items || [];
    const totalItems = data?.data?.total || 0;

    const deleteMutation = useDeleteColaboradorPago();

    const handleDeleteConfirm = () => {
        if (pagoToDelete) {
            deleteMutation.mutate(pagoToDelete.colaboradorPagoID, {
                onSuccess: () => {
                    setOpenDelete(false);
                    setPagoToDelete(null);
                }
            });
        }
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        setPagoToEdit(null);
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleEdit = (pago: ColaboradorPago) => {
        setPagoToEdit(pago);
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = (pago: ColaboradorPago) => {
        setPagoToDelete(pago);
        setOpenDelete(true);
    };

    const formatMoney = (amount: number, symbol?: string) => {
        return `${symbol || ''} ${amount.toFixed(2)}`;
    };

    const handleSearch = () => {
        setPage(0);
        setFilterParams({
            tipoPagoID,
            desde,
            hasta
        });
    };

    const handleExportExcel = async () => {
        try {
            setIsExportingExcel(true);
            const reportData = await colaboradorPagoApi.getReportData(colaboradorId, {
                tipoPagoID: filterParams.tipoPagoID ? Number(filterParams.tipoPagoID) : undefined,
                desde: filterParams.desde || undefined,
                hasta: filterParams.hasta || undefined,
            });
            const generator = new ColaboradorPagosExcelGenerator(reportData);
            await generator.generateAndDownload();
        } catch (error) {
            logger.error('Error exporting Excel:', error);
        } finally {
            setIsExportingExcel(false);
        }
    };

    const handleExportPdf = async () => {
        let objectUrl: string | null = null;
        try {
            setIsExportingPdf(true);
            const reportData = await colaboradorPagoApi.getReportData(colaboradorId, {
                tipoPagoID: filterParams.tipoPagoID ? Number(filterParams.tipoPagoID) : undefined,
                desde: filterParams.desde || undefined,
                hasta: filterParams.hasta || undefined,
            });
            const blob = await pdf(<ColaboradorPagosPdf data={reportData} />).toBlob();
            
            objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `Pagos_${reportData.numeroDocumento}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            logger.error('Error exporting PDF:', error);
        } finally {
            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
            setIsExportingPdf(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            {!viewOnly && (
                <Paper
                    ref={formRef}
                    elevation={0}
                    sx={{
                        p: 0,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: alpha(pagoToEdit ? theme.palette.warning.main : theme.palette.primary.main, 0.02),
                        overflow: 'hidden',
                        mb: 2
                    }}
                >
                    <Box
                        onClick={() => {
                            if (isFormExpanded && pagoToEdit) {
                                setPagoToEdit(null);
                                setIsFormExpanded(false);
                            } else if (!isFormExpanded && !pagoToEdit) {
                                handleCreate();
                            } else {
                                setIsFormExpanded((prev) => !prev);
                            }
                        }}
                        sx={{
                            px: 3,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: isFormExpanded ? `1px solid ${theme.palette.divider}` : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                                bgcolor: pagoToEdit ? theme.palette.warning.main : theme.palette.primary.main, 
                                color: 'white', 
                                p: 0.5, 
                                borderRadius: '50%', 
                                display: 'flex' 
                            }}>
                                {pagoToEdit ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                {pagoToEdit ? 'Editar Pago' : 'Agregar Pago'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {pagoToEdit && (
                                <Button 
                                    size="small" 
                                    color="inherit" 
                                    startIcon={<CancelIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPagoToEdit(null);
                                        setIsFormExpanded(false);
                                    }}
                                >
                                    Cancelar Edición
                                </Button>
                            )}
                            <MuiIconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsFormExpanded((prev) => !prev);
                                }}
                            >
                                {isFormExpanded ? <ExpandLess /> : <ExpandMore />}
                            </MuiIconButton>
                        </Box>
                    </Box>
                    <Collapse in={isFormExpanded} unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            <ColaboradorPagoForm
                                open={true}
                                onClose={() => {
                                    setPagoToEdit(null);
                                    setIsFormExpanded(false);
                                }}
                                colaboradorId={colaboradorId}
                                pagoToEdit={pagoToEdit}
                            />
                        </Box>
                    </Collapse>
                </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Historial de Pagos
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Exportar a Excel">
                        <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            startIcon={isExportingExcel ? <CircularProgress size={16} /> : <ExcelIcon />}
                            disabled={isExportingExcel || items.length === 0}
                            onClick={handleExportExcel}
                        >
                            Excel
                        </Button>
                    </Tooltip>
                    <Tooltip title="Exportar a PDF">
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={isExportingPdf ? <CircularProgress size={16} /> : <PdfIcon />}
                            disabled={isExportingPdf || items.length === 0}
                            onClick={handleExportPdf}
                        >
                            PDF
                        </Button>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid size={{xs:12,sm:3}}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Tipo de Pago"
                        value={tipoPagoID}
                        onChange={(e) => setTipoPagoID(e.target.value as number | '')}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {tiposPago?.data?.map((t) => (
                            <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid size={{xs:12,sm:3}}>
                    <TextField
                        fullWidth
                        type="date"
                        size="small"
                        label="Desde"
                        InputLabelProps={{ shrink: true }}
                        value={desde}
                        onChange={(e) => setDesde(e.target.value)}
                    />
                </Grid>
                <Grid size={{xs:12,sm:3}}>
                    <TextField
                        fullWidth
                        type="date"
                        size="small"
                        label="Hasta"
                        InputLabelProps={{ shrink: true }}
                        value={hasta}
                        onChange={(e) => setHasta(e.target.value)}
                    />
                </Grid>
                <Grid size={{xs:12,sm:3}}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                    >
                        Buscar
                    </Button>
                </Grid>
            </Grid>

            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {isLoading ? (
                    <Box p={3} textAlign="center">Cargando pagos...</Box>
                ) : items.length === 0 ? (
                    <Box 
                        p={5} 
                        textAlign="center" 
                        color="text.secondary"
                        sx={{ 
                            border: `1px dashed ${theme.palette.divider}`,
                            borderRadius: 2,
                            bgcolor: theme.palette.action.hover
                        }}
                    >
                        <Typography variant="body1">No hay pagos registrados.</Typography>
                        {!viewOnly && <Typography variant="caption">Haga clic en "Registrar Pago" para comenzar.</Typography>}
                    </Box>
                ) : (
                    items.map((pago) => (
                        <ListItem 
                            key={pago.colaboradorPagoID} 
                            divider
                            sx={{ 
                                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.05)' },
                                borderRadius: 1,
                                mb: 1,
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Box mr={2}>
                                <Box 
                                    color="success.main" 
                                    sx={{ 
                                        p: 1, 
                                        border: `1px solid ${theme.palette.divider}`, 
                                        borderRadius: 1,
                                        bgcolor: 'success.lighter' 
                                    }}
                                >
                                    <PaymentIcon fontSize="large" />
                                </Box>
                            </Box>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {pago.tipoPago?.nombre || 'Pago'}
                                        </Typography>
                                        <Chip 
                                            label={formatMoney(pago.monto, pago.moneda?.simbolo)} 
                                            size="small" 
                                            color="success" 
                                            variant="outlined" 
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                        <Typography variant="body2" component="span" color="text.primary">
                                            Periodo: {formatDateShort(pago.fechaInico)} - {formatDateShort(pago.fechaCierre)}
                                        </Typography>
                                        <Typography variant="body2" component="span" color="text.primary">
                                            Fecha Pago: {formatDateShort(pago.fechaPago)}
                                        </Typography>
                                        {pago.observaciones && (
                                            <Typography variant="caption" component="span" color="text.secondary">
                                                Nota: {pago.observaciones}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                            <ListItemSecondaryAction>
                                {!viewOnly && (
                                    <>
                                        <IconButton size="small" color='primary' onClick={() => handleEdit(pago)} sx={{ mr: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(pago)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))
                )}
            </List>

            <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />

            <ConfirmDialog
                open={openDelete}
                title="Eliminar Pago"
                content={`¿Está seguro que desea eliminar este registro de pago?`}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
