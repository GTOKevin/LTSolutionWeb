import {
    Box,
    Typography,
    Button,
    Stack,
    Grid,
    TextField,
    MenuItem,
    Tooltip,
    CircularProgress,
    TableCell,
    Paper,
    IconButton,
    Collapse,
    useTheme,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    CalendarToday as CalendarIcon,
    PictureAsPdf as PdfIcon,
    TableView as ExcelIcon,
    Search as SearchIcon,
    ExpandLess,
    ExpandMore,
    Edit as EditIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { licenciaApi } from '@entities/licencia/api/licencia.api';
import type { Licencia } from '@entities/licencia/model/types';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { useState, useRef } from 'react';
import { LicenciaForm } from './LicenciaForm';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@/shared/utils/date-utils';
import { useDeleteLicencia } from '../../hooks/useLicenciaCrud';
import { maestroApi } from '@/shared/api/maestro.api';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import { pdf } from '@react-pdf/renderer';
import { ColaboradorLicenciasPdf } from '../reports/ColaboradorLicenciasPdf';
import { ColaboradorLicenciasExcelGenerator } from '../lib/ColaboradorLicenciasExcelGenerator';
import { logger } from '@/shared/utils/logger';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { TableActions } from '@/shared/components/ui/TableActions';

interface LicenciaListProps {
    colaboradorId: number;
    viewOnly?: boolean;
}

export function LicenciaList({ colaboradorId, viewOnly = false }: LicenciaListProps) {
    const theme = useTheme();
    const [isFormExpanded, setIsFormExpanded] = useState(true);
    const [licenciaToEdit, setLicenciaToEdit] = useState<Licencia | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [licenciaToDelete, setLicenciaToDelete] = useState<Licencia | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters (Input State)
    const [tipoLicenciaID, setTipoLicenciaID] = useState<number | ''>('');
    const [desde, setDesde] = useState<string>(getFirstDayOfCurrentMonthISO(-1));
    const [hasta, setHasta] = useState<string>(getLastDayOfCurrentMonthISO());

    // Filter params that trigger the query
    const [filterParams, setFilterParams] = useState({
        tipoLicenciaID: '' as number | '',
        desde: getFirstDayOfCurrentMonthISO(-1),
        hasta: getLastDayOfCurrentMonthISO()
    });

    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const { data: tiposLicencia } = useQuery({
        queryKey: ['tipos-licencia'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_LICENCIA)
    });

    const { data, isLoading } = useQuery({
        queryKey: ['colaborador-licencias', colaboradorId, page, rowsPerPage, filterParams],
        queryFn: () => licenciaApi.getAll({ 
            colaboradorID: colaboradorId, 
            tipoLicenciaID: filterParams.tipoLicenciaID ? Number(filterParams.tipoLicenciaID) : undefined,
            desde: filterParams.desde || undefined,
            hasta: filterParams.hasta || undefined,
            page: page + 1,
            size: rowsPerPage 
        })
    });

    const deleteMutation = useDeleteLicencia();

    const handleDeleteConfirm = () => {
        if (licenciaToDelete) {
            deleteMutation.mutate(licenciaToDelete.colaboradorLicenciaID, {
                onSuccess: () => {
                    setOpenDelete(false);
                    setLicenciaToDelete(null);
                }
            });
        }
    };

    const handleCreate = () => {
        setLicenciaToEdit(null);
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleEdit = (licencia: Licencia) => {
        setLicenciaToEdit(licencia);
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = (licencia: Licencia) => {
        setLicenciaToDelete(licencia);
        setOpenDelete(true);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = () => {
        setPage(0);
        setFilterParams({
            tipoLicenciaID,
            desde,
            hasta
        });
    };

    const handleExportExcel = async () => {
        try {
            setIsExportingExcel(true);
            const reportData = await licenciaApi.getReportData(colaboradorId, {
                tipoLicenciaID: filterParams.tipoLicenciaID ? Number(filterParams.tipoLicenciaID) : undefined,
                desde: filterParams.desde || undefined,
                hasta: filterParams.hasta || undefined,
            });
            const generator = new ColaboradorLicenciasExcelGenerator(reportData);
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
            const reportData = await licenciaApi.getReportData(colaboradorId, {
                tipoLicenciaID: filterParams.tipoLicenciaID ? Number(filterParams.tipoLicenciaID) : undefined,
                desde: filterParams.desde || undefined,
                hasta: filterParams.hasta || undefined,
            });
            const blob = await pdf(<ColaboradorLicenciasPdf data={reportData} />).toBlob();
            
            objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `Ausencias_${reportData.numeroDocumento}.pdf`);
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

    const columns: Column[] = [
        { id: 'tipo', label: 'Tipo' },
        { id: 'desde', label: 'Desde' },
        { id: 'hasta', label: 'Hasta' },
        { id: 'detalle', label: 'Detalle' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!viewOnly && (
                <Paper
                    ref={formRef}
                    elevation={0}
                    sx={{
                        p: 0,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: alpha(licenciaToEdit ? theme.palette.warning.main : theme.palette.primary.main, 0.02),
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        onClick={() => {
                            if (isFormExpanded && licenciaToEdit) {
                                setLicenciaToEdit(null);
                                setIsFormExpanded(false);
                            } else if (!isFormExpanded && !licenciaToEdit) {
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
                                bgcolor: licenciaToEdit ? theme.palette.warning.main : theme.palette.primary.main, 
                                color: 'white', 
                                p: 0.5, 
                                borderRadius: '50%', 
                                display: 'flex' 
                            }}>
                                {licenciaToEdit ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                {licenciaToEdit ? 'Editar Ausencia/Licencia' : 'Agregar Ausencia/Licencia'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {licenciaToEdit && (
                                <Button 
                                    size="small" 
                                    color="inherit" 
                                    startIcon={<CancelIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLicenciaToEdit(null);
                                        setIsFormExpanded(false);
                                    }}
                                >
                                    Cancelar Edición
                                </Button>
                            )}
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsFormExpanded((prev) => !prev);
                                }}
                            >
                                {isFormExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    </Box>
                    <Collapse in={isFormExpanded} unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            <LicenciaForm
                                open={true}
                                onClose={() => {
                                    setLicenciaToEdit(null);
                                    setIsFormExpanded(false);
                                }}
                                colaboradorId={colaboradorId}
                                licenciaToEdit={licenciaToEdit}
                            />
                        </Box>
                    </Collapse>
                </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Registro de Ausencias y Licencias
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Exportar a Excel">
                        <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            startIcon={isExportingExcel ? <CircularProgress size={16} /> : <ExcelIcon />}
                            disabled={isExportingExcel || !data?.data?.items || data.data.items.length === 0}
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
                            disabled={isExportingPdf || !data?.data?.items || data.data.items.length === 0}
                            onClick={handleExportPdf}
                        >
                            PDF
                        </Button>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} alignItems="center">
                <Grid size={{xs:12,sm:3}}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Tipo de Ausencia/Licencia"
                        value={tipoLicenciaID}
                        onChange={(e) => setTipoLicenciaID(e.target.value as number | '')}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {tiposLicencia?.data?.map((t) => (
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

            {/* Desktop Table */}
            <SharedTable
                data={data?.data}
                isLoading={isLoading}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                columns={columns}
                keyExtractor={(item) => item.colaboradorLicenciaID}
                emptyMessage="No hay ausencias o licencias registradas"
                renderRow={(licencia) => (
                    <>
                        <TableCell>{licencia.tipoLicencia?.nombre || '-'}</TableCell>
                        <TableCell>{new Date(licencia.fechaInicial).toLocaleDateString()}</TableCell>
                        <TableCell>{licencia.fechaFinal ? new Date(licencia.fechaFinal).toLocaleDateString() : '-'}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                            {licencia.descripcion || '-'}
                        </TableCell>
                        <TableCell align="right">
                            <TableActions
                                onEdit={!viewOnly ? () => handleEdit(licencia) : undefined}
                                onDelete={!viewOnly ? () => handleDelete(licencia) : undefined}
                            />
                        </TableCell>
                    </>
                )}
            />

            {/* Mobile List */}
            <MobileListShell
                items={data?.data?.items || []}
                total={data?.data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                emptyMessage="No hay registros"
                keyExtractor={(item) => item.colaboradorLicenciaID}
                onEdit={viewOnly ? undefined : handleEdit}
                onDelete={viewOnly ? undefined : handleDelete}
                renderHeader={(licencia) => (
                    <Typography variant="subtitle2" fontWeight="bold">
                        {licencia.tipoLicencia?.nombre || 'Ausencia'}
                    </Typography>
                )}
                renderBody={(licencia) => (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">
                                {new Date(licencia.fechaInicial).toLocaleDateString()} 
                                {licencia.fechaFinal ? ` - ${new Date(licencia.fechaFinal).toLocaleDateString()}` : ''}
                            </Typography>
                        </Box>
                        {licencia.descripcion && (
                            <Typography variant="body2" color="text.secondary">
                                {licencia.descripcion}
                            </Typography>
                        )}
                    </Stack>
                )}
            />

            <ConfirmDialog
                open={openDelete}
                title="Eliminar Registro"
                content={`¿Está seguro que desea eliminar este registro?`}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
