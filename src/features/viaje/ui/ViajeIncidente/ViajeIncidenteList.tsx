import { logger } from '@/shared/utils/logger';
import { 
    Box, 
    Typography, 
    useTheme, 
    alpha, 
    Chip, 
    Tooltip, 
    CircularProgress,
    IconButton,
    TableCell,
    Button
} from '@mui/material';
import { 
    History as HistoryIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { ViajeIncidente } from '@/entities/viaje/model/types';
import { viajeIncidenteApi } from '@/entities/viaje/api/viaje-incidente.api';
import { ViajeIncidentePdf } from '@features/viaje/reports/ui/ViajeIncidentePdf';
import type { SelectItem } from '@/shared/model/types';
import { useViajeIncidentes, useDeleteViajeIncidente } from '@/features/viaje/hooks/useViajeIncidentes';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { formatDate, formatTime } from '@/shared/utils/date-utils';
import { buildInternalFileUrl } from '@/shared/config/env';
import { ViajeIncidenteMobileList } from './Index';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    tiposIncidente: SelectItem[];
    onEdit?: (item: ViajeIncidente) => void;
}

export function ViajeIncidenteList({ viajeId, viewOnly, tiposIncidente, onEdit }: Props) {
    const theme = useTheme();

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Query & Mutations
    const { data, isLoading } = useViajeIncidentes(viajeId, page + 1, rowsPerPage);
    const deleteMutation = useDeleteViajeIncidente();
    const incidentes = data?.items ?? [];

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

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
            logger.error("Error deleting incidente:", error);
        }
    };

    const handlePreview = (path: string) => {
        const fullUrl = buildInternalFileUrl(path);
        setPreviewUrl(fullUrl || null);
    };

    const handleClosePreview = () => {
        setPreviewUrl(null);
    };

    const handleExportPdf = async () => {
        let objectUrl: string | null = null;
        try {
            setIsExportingPdf(true);
            const reportData = await viajeIncidenteApi.getReportData(viajeId);
            const blob = await pdf(<ViajeIncidentePdf data={reportData} />).toBlob();
            
            objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `Incidentes_Viaje_${viajeId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            logger.error("Error exporting PDF:", error);
        } finally {
            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
            setIsExportingPdf(false);
        }
    };

    const getIncidenteColor = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('accidente')) return theme.palette.error;
        if (lower.includes('robo')) return theme.palette.error;
        if (lower.includes('falla')) return theme.palette.warning;
        if (lower.includes('clima')) return theme.palette.info;
        if (lower.includes('bloqueo')) return theme.palette.warning;
        return theme.palette.primary;
    };

    const columns: Column[] = [
        { id: 'fecha', label: 'Fecha / Hora' },
        { id: 'tipo', label: 'Tipo' },
        { id: 'lugar', label: 'Lugar' },
        { id: 'descripcion', label: 'Descripción / Referencia' },
        { id: 'evidencia', label: 'Evidencia', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Incidentes Registrados
                </Typography>
                {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
            </Box>
            
            <Tooltip title="Exportar Reporte de Incidentes">
                <span>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleExportPdf}
                        disabled={isExportingPdf || incidentes.length === 0}
                        startIcon={isExportingPdf ? <CircularProgress size={16} /> : <PdfIcon />}
                    >
                        Reporte PDF
                    </Button>
                </span>
            </Tooltip>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <SharedTable
                    data={data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    columns={columns}
                    keyExtractor={(item) => item.viajeIncidenteID}
                    emptyMessage="No hay incidentes registrados"
                    renderRow={(item) => {
                        const tipo = tiposIncidente.find(t => t.id === item.tipoIncidenteID);
                        const tipoText = tipo?.text || item.tipoIncidente?.descripcion || 'Otro';
                        const colorPalette = getIncidenteColor(tipoText);

                        return (
                            <>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                                        {formatDate(item.fechaHora)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatTime(item.fechaHora)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={tipoText} 
                                        size="small" 
                                        sx={{ 
                                            height: 24,
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            bgcolor: alpha(colorPalette.main, 0.1),
                                            color: colorPalette.dark,
                                            border: `1px solid ${alpha(colorPalette.main, 0.2)}`
                                        }} 
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.lugar || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 300 }}>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {item.descripcion}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    {item.rutaFoto ? (
                                        <Tooltip title="Ver Evidencia">
                                            <IconButton 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                }}
                                                onClick={() => handlePreview(item.rutaFoto!)}
                                            >
                                                <ImageIcon fontSize="small" color="action" />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Typography variant="caption" color="text.disabled">-</Typography>
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <TableActions
                                        onEdit={!viewOnly ? () => onEdit?.(item) : undefined}
                                        onDelete={!viewOnly ? () => handleDelete(item.viajeIncidenteID) : undefined}
                                        editTooltip="Editar incidente"
                                        deleteTooltip="Eliminar incidente"
                                    />
                                </TableCell>
                            </>
                        );
                    }}
                />
            </Box>

            <ViajeIncidenteMobileList 
                items={incidentes}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                viewOnly={viewOnly}
                tiposIncidente={tiposIncidente}
                onEdit={onEdit}
                onDelete={handleDelete}
                onPreview={handlePreview}
            />
            <DocumentPreviewDialog 
                open={!!previewUrl}
                onClose={handleClosePreview}
                previewUrl={previewUrl}
            />
        </Box>
    );
}
