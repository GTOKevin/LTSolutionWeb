import { 
    Box, Button, IconButton, Table, TableBody, TableCell, 
    TableHead, TableRow, Typography, Paper, TextField, MenuItem, Grid,
    useTheme, alpha, Chip, Tooltip
} from '@mui/material';
import { 
    Delete as DeleteIcon,
    ReportProblem as ReportProblemIcon,
    History as HistoryIcon,
    Warning as WarningIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import type { CreateViajeIncidenteDto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';

interface Props {
    viewOnly?: boolean;
    tiposIncidente: SelectItem[];
}

export function ViajeIncidenteList({ viewOnly, tiposIncidente }: Props) {
    const theme = useTheme();
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "viajeIncidentes"
    });

    const [newItem, setNewItem] = useState<CreateViajeIncidenteDto>({
        fechaHora: new Date().toISOString(),
        tipoIncidenteID: 0,
        descripcion: '',
        ubigeoID: 0,
        lugar: '',
        rutaFoto: ''
    });

    // Local state for separate date and time inputs
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

    useEffect(() => {
        // Combine date and time into ISO string when either changes
        try {
            const combined = new Date(`${date}T${time}:00`);
            setNewItem(prev => ({ ...prev, fechaHora: combined.toISOString() }));
        } catch (e) {
            console.error("Invalid date/time format");
        }
    }, [date, time]);

    const handleAdd = () => {
        if (!newItem.tipoIncidenteID || !newItem.ubigeoID || !newItem.fechaHora) return;
        
        append(newItem);
        
        // Reset form
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setTime(now.toTimeString().slice(0, 5));
        setNewItem({
            fechaHora: now.toISOString(),
            tipoIncidenteID: 0,
            descripcion: '',
            ubigeoID: 0,
            lugar: '',
            rutaFoto: ''
        });
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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Form Section: Registro de Nuevo Incidente */}
            {!viewOnly && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ReportProblemIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            Registro de Nuevo Incidente
                        </Typography>
                    </Box>

                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3, 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.5)
                        }}
                    >
                        <Grid container spacing={3}>
                            {/* Column 1 */}
                            <Grid size={{xs:12,md:4}}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                            Tipo de Incidente
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={newItem.tipoIncidenteID}
                                            onChange={e => setNewItem({...newItem, tipoIncidenteID: Number(e.target.value)})}
                                            SelectProps={{ displayEmpty: true }}
                                            sx={{ bgcolor: 'background.paper' }}
                                        >
                                            <MenuItem value={0} disabled>Seleccione tipo...</MenuItem>
                                            {tiposIncidente.map(t => (
                                                <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid size={{xs:6}}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                                Fecha
                                            </Typography>
                                            <TextField
                                                type="date"
                                                fullWidth
                                                size="small"
                                                value={date}
                                                onChange={e => setDate(e.target.value)}
                                                sx={{ bgcolor: 'background.paper' }}
                                            />
                                        </Grid>
                                        <Grid size={{xs:6}}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                                Hora
                                            </Typography>
                                            <TextField
                                                type="time"
                                                fullWidth
                                                size="small"
                                                value={time}
                                                onChange={e => setTime(e.target.value)}
                                                sx={{ bgcolor: 'background.paper' }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>

                            {/* Column 2 */}
                            <Grid size={{xs:12,md:8}}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                            Ubicación (Ubigeo)
                                        </Typography>
                                        <Box sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                            <UbigeoSelect
                                                label="Ubicación (Ubigeo)"
                                                value={newItem.ubigeoID}
                                                onChange={(id) => setNewItem({...newItem, ubigeoID: id})}
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                            Lugar / Referencia
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Ej: Km 45 Panamericana Sur"
                                            value={newItem.lugar}
                                            onChange={e => setNewItem({...newItem, lugar: e.target.value})}
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Column 3 */}
                            <Grid size={{xs:12}}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                            Descripción
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            size="small"
                                            placeholder="Detalles del suceso..."
                                            value={newItem.descripcion}
                                            onChange={e => setNewItem({...newItem, descripcion: e.target.value})}
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                            Evidencia (Imagen)
                                        </Typography>
                                        <ImageUpload
                                            folder="incidentes"
                                            value={newItem.rutaFoto}
                                            onChange={(url) => setNewItem({...newItem, rutaFoto: url})}
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Submit Button */}
                            <Grid size={{xs:12}} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleAdd}
                                    disabled={!newItem.tipoIncidenteID || !newItem.ubigeoID}
                                    startIcon={<WarningIcon />}
                                    sx={{ 
                                        fontWeight: 'bold',
                                        px: 4,
                                        py: 1,
                                        boxShadow: theme.shadows[2],
                                        '&:hover': { boxShadow: theme.shadows[4] }
                                    }}
                                >
                                    Reportar Incidente
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}

            {/* Table Section: Incidentes Registrados */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            Incidentes Registrados
                        </Typography>
                    </Box>
                </Box>

                <Paper 
                    elevation={0} 
                    sx={{ 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <Table size="small">
                        <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha / Hora</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Lugar</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Descripción / Referencia</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Evidencia</TableCell>
                                {!viewOnly && <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((item: any, index) => {
                                const tipo = tiposIncidente.find(t => t.id === item.tipoIncidenteID);
                                const tipoText = tipo?.text || 'Otro';
                                const colorPalette = getIncidenteColor(tipoText);
                                const fecha = new Date(item.fechaHora);

                                return (
                                    <TableRow key={item.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium" color="text.primary">
                                                {fecha.toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                                        href={item.rutaFoto} 
                                                        target="_blank"
                                                        sx={{ 
                                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                        }}
                                                    >
                                                        <ImageIcon fontSize="small" color="action" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">-</Typography>
                                            )}
                                        </TableCell>
                                        {!viewOnly && (
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => remove(index)}
                                                    sx={{ 
                                                        bgcolor: alpha(theme.palette.error.main, 0.05),
                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                            {fields.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                            <HistoryIcon sx={{ fontSize: 40, opacity: 0.2 }} />
                                            <Typography variant="body2">No hay incidentes registrados</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        </Box>
    );
}
