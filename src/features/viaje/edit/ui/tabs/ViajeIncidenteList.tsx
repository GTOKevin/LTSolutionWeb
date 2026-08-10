import { logger } from '@/shared/utils/logger';
import {
    Box,
    Typography,
    useTheme,
    alpha,
    CircularProgress,
    IconButton,
    Button,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    PictureAsPdf as PdfIcon,
    LocationOn as LocationOnIcon,
    MoreVert as MoreVertIcon,
    Download as DownloadIcon,
    ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { ViajeIncidente } from '@/entities/viaje/model/types';
import { viajeIncidenteApi } from '@/entities/viaje/api/viaje-incidente.api';
import { getIncidenteImageRoutes } from '@/entities/viaje/model/incidente-images';
import { ViajeIncidentePdf } from '@features/viaje/reports/ui/ViajeIncidentePdf';
import type { SelectItem } from '@/shared/model/types';
import { useViajeIncidentes, useDeleteViajeIncidente } from '@/features/viaje/hooks/useViajeIncidentes';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { formatDateShort, formatTime } from '@/shared/utils/date-utils';
import { buildInternalFileUrl } from '@/shared/config/env';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    tiposIncidente: SelectItem[];
    onEdit?: (item: ViajeIncidente) => void;
}

export function ViajeIncidenteList({ viajeId, viewOnly, tiposIncidente, onEdit }: Props) {
    const theme = useTheme();
    const { data, isLoading } = useViajeIncidentes(viajeId, 1, 100);
    const deleteMutation = useDeleteViajeIncidente();
    const incidentes = data?.items ?? [];

    const [previewState, setPreviewState] = useState<{
        previewUrl: string | null;
        previewUrls: string[];
        currentIndex: number;
    }>({
        previewUrl: null,
        previewUrls: [],
        currentIndex: 0,
    });
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    const handleDelete = async () => {
        if (!viajeId || !selectedId) return;
        try {
            await deleteMutation.mutateAsync({ id: selectedId, viajeId });
            handleMenuClose();
        } catch (error) {
            logger.error('Error deleting incidente:', error);
        }
    };

    const handleEditClick = () => {
        if (selectedId && onEdit) {
            const item = incidentes.find((incidente) => incidente.viajeIncidenteID === selectedId);
            if (item) onEdit(item);
        }
        handleMenuClose();
    };

    const handlePreview = (paths: string[], currentIndex: number) => {
        const previewUrls = paths
            .map((path) => buildInternalFileUrl(path))
            .filter((url): url is string => Boolean(url));

        setPreviewState({
            previewUrl: previewUrls[currentIndex] ?? previewUrls[0] ?? null,
            previewUrls,
            currentIndex,
        });
    };

    const handleDownload = (path: string) => {
        const url = buildInternalFileUrl(path);
        if (url) {
            window.open(url, '_blank');
        }
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
            logger.error('Error exporting PDF:', error);
        } finally {
            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
            setIsExportingPdf(false);
        }
    };

    const getIncidenteSeverity = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('accidente') || lower.includes('robo') || lower.includes('siniestro')) {
            return {
                label: 'Crítico',
                color: theme.palette.error.main,
                bg: alpha(theme.palette.error.main, 0.1),
                text: theme.palette.error.dark,
            };
        }
        if (lower.includes('falla') || lower.includes('bloqueo')) {
            return {
                label: 'Advertencia',
                color: theme.palette.warning.main,
                bg: alpha(theme.palette.warning.main, 0.15),
                text: theme.palette.warning.dark,
            };
        }
        return {
            label: 'Informativo',
            color: theme.palette.info.main,
            bg: alpha(theme.palette.info.main, 0.1),
            text: theme.palette.info.dark,
        };
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
                        Historial de Incidentes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {incidentes.length} reporte{incidentes.length !== 1 && 's'} registrado{incidentes.length !== 1 && 's'} en este viaje
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleExportPdf}
                        disabled={isExportingPdf || incidentes.length === 0}
                        startIcon={isExportingPdf ? <CircularProgress size={16} color="inherit" /> : <PdfIcon />}
                        sx={{
                            borderRadius: 6,
                            textTransform: 'none',
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Exportar Log
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, pr: 1 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : incidentes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 3, border: `1px dashed ${theme.palette.divider}` }}>
                        <Typography variant="body2" color="text.secondary">
                            No hay incidentes registrados en el historial.
                        </Typography>
                    </Box>
                ) : (
                    incidentes.map((item) => {
                        const tipoText = tiposIncidente.find((tipo) => tipo.id === item.tipoIncidenteID)?.text || item.tipoIncidente?.descripcion || 'Otro';
                        const severity = getIncidenteSeverity(tipoText);
                        const imageRoutes = getIncidenteImageRoutes(item).filter(Boolean);
                        const hasImage = imageRoutes.length > 0;

                        return (
                            <Box
                                key={item.viajeIncidenteID}
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    borderLeft: '4px solid',
                                    borderLeftColor: severity.color,
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateX(4px)' },
                                }}
                            >
                                <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: severity.bg,
                                                        color: severity.text,
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: 1,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1,
                                                    }}
                                                >
                                                    {severity.label}
                                                </Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {formatDateShort(item.fechaHora)} • {formatTime(item.fechaHora)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                                {tipoText}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationOnIcon sx={{ fontSize: 14 }} />
                                                {item.lugar || 'Ubicación no especificada'}
                                            </Typography>
                                        </Box>
                                        {!viewOnly && (
                                            <IconButton
                                                size="small"
                                                onClick={(event) => handleMenuOpen(event, item.viajeIncidenteID)}
                                                sx={{ bgcolor: 'background.default', '&:hover': { color: 'primary.main' } }}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, maxWidth: '85%' }}>
                                        {item.descripcion || 'Sin detalles adicionales.'}
                                    </Typography>

                                    {hasImage && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, flexWrap: 'wrap' }}>
                                            {imageRoutes.map((route, index) => {
                                                const imageUrl = buildInternalFileUrl(route);
                                                if (!imageUrl) {
                                                    return null;
                                                }

                                                return (
                                                    <Box
                                                        key={`${item.viajeIncidenteID}-${route}-${index}`}
                                                        onClick={() => handlePreview(imageRoutes, index)}
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 2,
                                                            border: '2px solid white',
                                                            overflow: 'hidden',
                                                            bgcolor: 'grey.100',
                                                            cursor: 'zoom-in',
                                                            boxShadow: 1,
                                                            position: 'relative',
                                                            '&:hover .zoom-icon': { opacity: 1 },
                                                        }}
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Evidencia ${index + 1}`}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                        <Box className="zoom-icon" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                                            <ZoomInIcon sx={{ color: 'white', fontSize: 20 }} />
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                            <Button
                                                size="small"
                                                onClick={() => handleDownload(imageRoutes[0]!)}
                                                startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                                                sx={{
                                                    ml: 'auto',
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    borderRadius: 2,
                                                    px: 2,
                                                    '&:hover': { bgcolor: 'primary.dark' },
                                                }}
                                            >
                                                Descargar Evidencias
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })
                )}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 120, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
            >
                <MenuItem onClick={handleEditClick} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    Editar
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'error.main' }}>
                    Eliminar
                </MenuItem>
            </Menu>

            <DocumentPreviewDialog
                open={!!previewState.previewUrl}
                onClose={() => setPreviewState({ previewUrl: null, previewUrls: [], currentIndex: 0 })}
                previewUrl={previewState.previewUrl}
                previewUrls={previewState.previewUrls}
                initialIndex={previewState.currentIndex}
            />
        </Box>
    );
}
