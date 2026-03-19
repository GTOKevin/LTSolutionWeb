import { 
    Box, 
    Typography, 
    useTheme, 
    alpha,
    Chip,
    Grid,
    Button
} from '@mui/material';
import { 
    History as HistoryIcon,
    Place as PlaceIcon,
    Image as ImageIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import type { ViajeIncidente } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { formatDate, formatTime } from '@/shared/utils/date-utils';
import { MobileListShell } from '../MobileListShell';

interface Props {
    items: ViajeIncidente[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposIncidente: SelectItem[];
    onEdit?: (item: ViajeIncidente) => void;
    onDelete?: (id: number) => void;
    onPreview?: (path: string) => void;
}

export function ViajeIncidenteMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposIncidente,
    onEdit, 
    onDelete,
    onPreview
}: Props) {
    const theme = useTheme();

    const getIncidenteColor = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('accidente')) return theme.palette.error;
        if (lower.includes('robo')) return theme.palette.error;
        if (lower.includes('falla')) return theme.palette.warning;
        if (lower.includes('clima')) return theme.palette.info;
        if (lower.includes('bloqueo')) return theme.palette.warning;
        return theme.palette.primary;
    };

    return (
        <MobileListShell
            items={items}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            viewOnly={viewOnly}
            emptyMessage="No hay incidentes registrados"
            keyExtractor={(item) => item.viajeIncidenteID}
            onEdit={onEdit}
            onDelete={onDelete ? (item) => onDelete(item.viajeIncidenteID) : undefined}
            onPreview={onPreview ? (item) => item.rutaFoto && onPreview(item.rutaFoto) : undefined}
            getCardStyle={(item) => {
                const tipo = tiposIncidente.find(t => t.id === item.tipoIncidenteID);
                const tipoText = tipo?.text || item.tipoIncidente?.descripcion || 'Otro';
                const colorPalette = getIncidenteColor(tipoText);
                return { borderLeft: `4px solid ${colorPalette.main}` };
            }}
            renderHeader={(item) => {
                const tipo = tiposIncidente.find(t => t.id === item.tipoIncidenteID);
                const tipoText = tipo?.text || item.tipoIncidente?.descripcion || 'Otro';
                const colorPalette = getIncidenteColor(tipoText);
                return (
                    <Chip 
                        label={tipoText} 
                        size="small" 
                        sx={{ 
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            bgcolor: alpha(colorPalette.main, 0.1),
                            color: colorPalette.dark,
                            border: `1px solid ${alpha(colorPalette.main, 0.2)}`
                        }} 
                    />
                );
            }}
            renderBody={(item) => (
                <Grid container spacing={2}>
                    <Grid size={{xs:12}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                            <HistoryIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">Fecha y Hora</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                            {formatDate(item.fechaHora)} - {formatTime(item.fechaHora)}
                        </Typography>
                    </Grid>

                    <Grid size={{xs:12}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                            <PlaceIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">Lugar</Typography>
                        </Box>
                        <Typography variant="body2">
                            {item.lugar || 'N/A'}
                        </Typography>
                    </Grid>

                    <Grid size={{xs:12}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                            <DescriptionIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">Descripción</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3
                        }}>
                            {item.descripcion}
                        </Typography>
                    </Grid>

                    {item.rutaFoto && (
                        <Grid size={{xs:12}}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ImageIcon />}
                                onClick={() => onPreview?.(item.rutaFoto!)}
                                fullWidth
                                sx={{ 
                                    mt: 1, 
                                    borderColor: theme.palette.divider,
                                    color: 'text.secondary',
                                    justifyContent: 'flex-start'
                                }}
                            >
                                Ver Evidencia
                            </Button>
                        </Grid>
                    )}
                </Grid>
            )}
        />
    );
}
