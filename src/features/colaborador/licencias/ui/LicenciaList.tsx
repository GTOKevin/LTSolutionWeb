import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Button,
    useTheme,
    alpha,
    Card,
    CardContent,
    Stack,
    TablePagination,
    Grid,
    TextField,
    MenuItem,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    CalendarToday as CalendarIcon,
    PictureAsPdf as PdfIcon,
    TableView as ExcelIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { licenciaApi } from '@entities/licencia/api/licencia.api';
import type { Licencia } from '@entities/licencia/model/types';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { useState } from 'react';
import { LicenciaForm } from './LicenciaForm';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@/shared/utils/date-utils';
import { useDeleteLicencia } from '../../hooks/useLicenciaCrud';
import { maestroApi } from '@/shared/api/maestro.api';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import { pdf } from '@react-pdf/renderer';
import { ColaboradorLicenciasPdf } from '../reports/ColaboradorLicenciasPdf';
import { ColaboradorLicenciasExcelGenerator } from '../lib/ColaboradorLicenciasExcelGenerator';
import { logger } from '@/shared/utils/logger';

interface LicenciaListProps {
    colaboradorId: number;
    viewOnly?: boolean;
}

export function LicenciaList({ colaboradorId, viewOnly = false }: LicenciaListProps) {
    const theme = useTheme();
    const [openForm, setOpenForm] = useState(false);
    const [licenciaToEdit, setLicenciaToEdit] = useState<Licencia | null>(null);
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
        setOpenForm(true);
    };

    const handleEdit = (licencia: Licencia) => {
        console.log("licencia:", licencia);
        setLicenciaToEdit(licencia);
        setOpenForm(true);
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

    if (isLoading) {
        return <Box p={3} textAlign="center">Cargando ausencias/licencias...</Box>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                    {!viewOnly && (
                        <Button 
                            startIcon={<AddIcon />} 
                            variant="contained" 
                            size="small"
                            onClick={handleCreate}
                        >
                            Registrar Ausencia
                        </Button>
                    )}
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
            <Paper sx={{ 
                display: { xs: 'none', md: 'block' },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Desde</TableCell>
                                <TableCell>Hasta</TableCell>
                                <TableCell>Detalle</TableCell>
                                {!viewOnly && <TableCell align="right">Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.data?.items.map((licencia) => (
                                <TableRow key={licencia.colaboradorLicenciaID} hover>
                                    <TableCell>{licencia.tipoLicencia?.nombre || '-'}</TableCell>
                                    <TableCell>{new Date(licencia.fechaInicial).toLocaleDateString()}</TableCell>
                                    <TableCell>{licencia.fechaFinal ? new Date(licencia.fechaFinal).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>
                                        {licencia.descripcion || '-'}
                                    </TableCell>
                                    {!viewOnly && (
                                        <TableCell align="right">
                                            <IconButton size="small" color="primary" onClick={() => handleEdit(licencia)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(licencia)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {data?.data?.items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No hay ausencias o licencias registradas
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Mobile List */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                {data?.data?.items.map((licencia) => (
                    <Card key={licencia.colaboradorLicenciaID} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {licencia.tipoLicencia?.nombre || 'Ausencia'}
                                </Typography>
                            </Box>
                            
                            <Stack spacing={1} sx={{ mb: 2 }}>
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

                            {!viewOnly && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: `1px solid ${theme.palette.divider}`, pt: 1, mt: 1 }}>
                                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(licencia)}>
                                        Editar
                                    </Button>
                                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(licencia)}>
                                        Eliminar
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))}
                 {data?.data?.items.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', bgcolor: 'background.paper', borderRadius: 2 }}>
                        No hay registros
                    </Box>
                )}
            </Box>

            <TablePagination
                component="div"
                count={data?.data?.total || 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
                rowsPerPageOptions={[5, 10, 25]}
            />

            <LicenciaForm 
                open={openForm}
                onClose={() => setOpenForm(false)}
                colaboradorId={colaboradorId}
                licenciaToEdit={licenciaToEdit}
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
