import { 
    Box, Button, Typography, Paper, TextField, MenuItem, Grid,
    useTheme, alpha, CircularProgress
} from '@mui/material';
import { 
    ReportProblem as ReportProblemIcon,
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { CreateViajeIncidenteDto, ViajeIncidente } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { useCreateViajeIncidente, useUpdateViajeIncidente } from '@/features/viaje/hooks/useViajeIncidentes';

interface Props {
    viajeId: number;
    tiposIncidente: SelectItem[];
    incidente?: ViajeIncidente | null;
    onCancel?: () => void;
}

export function ViajeIncidenteCreateEdit({ viajeId, tiposIncidente, incidente, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeIncidente();
    const updateMutation = useUpdateViajeIncidente();

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

    const isEditing = !!incidente;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (incidente) {
            const fecha = new Date(incidente.fechaHora);
            // Handle timezone offset if needed, or assume UTC/Local consistency. 
            // Using local time for inputs
            const yyyy = fecha.getFullYear();
            const mm = String(fecha.getMonth() + 1).padStart(2, '0');
            const dd = String(fecha.getDate()).padStart(2, '0');
            const hh = String(fecha.getHours()).padStart(2, '0');
            const min = String(fecha.getMinutes()).padStart(2, '0');

            setDate(`${yyyy}-${mm}-${dd}`);
            setTime(`${hh}:${min}`);

            setNewItem({
                fechaHora: incidente.fechaHora,
                tipoIncidenteID: incidente.tipoIncidenteID,
                descripcion: incidente.descripcion || '',
                ubigeoID: incidente.ubigeoID,
                lugar: incidente.lugar || '',
                rutaFoto: incidente.rutaFoto || ''
            });
        } else {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            
            setDate(`${yyyy}-${mm}-${dd}`);
            setTime(`${hh}:${min}`);

            setNewItem({
                fechaHora: now.toISOString(),
                tipoIncidenteID: 0,
                descripcion: '',
                ubigeoID: 0,
                lugar: '',
                rutaFoto: ''
            });
        }
    }, [incidente]);

    useEffect(() => {
        // Combine date and time into ISO string when either changes
        try {
            const combined = new Date(`${date}T${time}:00`);
            setNewItem(prev => ({ ...prev, fechaHora: combined.toISOString() }));
        } catch (e) {
            console.error("Invalid date/time format");
        }
    }, [date, time]);

    const handleSave = async () => {
        if (!viajeId) return;
        if (!newItem.tipoIncidenteID || !newItem.ubigeoID || !newItem.fechaHora) return;
        
        try {
            if (isEditing && incidente) {
                await updateMutation.mutateAsync({ 
                    id: incidente.viajeIncidenteID, 
                    data: newItem, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: newItem });
            }
            
            // Reset form
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');

            setDate(`${yyyy}-${mm}-${dd}`);
            setTime(`${hh}:${min}`);

            setNewItem({
                fechaHora: now.toISOString(),
                tipoIncidenteID: 0,
                descripcion: '',
                ubigeoID: 0,
                lugar: '',
                rutaFoto: ''
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Error saving incidente:", error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        bgcolor: isEditing ? theme.palette.warning.main : 'transparent',
                        color: isEditing ? 'white' : 'text.secondary',
                        p: isEditing ? 0.5 : 0,
                        borderRadius: 1,
                        display: 'flex'
                    }}>
                        {isEditing ? <EditIcon /> : <ReportProblemIcon />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        {isEditing ? "Editar Incidente" : "Registro de Nuevo Incidente"}
                    </Typography>
                </Box>
                {isEditing && (
                    <Button 
                        size="small" 
                        color="inherit" 
                        onClick={onCancel}
                        startIcon={<CancelIcon />}
                    >
                        Cancelar
                    </Button>
                )}
            </Box>

            <Paper 
                elevation={0}
                sx={{ 
                    p: 3, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.background.paper, 0.05)
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
                                    onChange={(e) => setNewItem({ ...newItem, tipoIncidenteID: Number(e.target.value) })}
                                    sx={{ bgcolor: 'background.paper' }}
                                >
                                    <MenuItem value={0} disabled>Seleccione tipo</MenuItem>
                                    {tiposIncidente.map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid size={{xs:7}}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                        Fecha
                                    </Typography>
                                    <TextField
                                        type="date"
                                        fullWidth
                                        size="small"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        sx={{ bgcolor: 'background.paper' }}
                                    />
                                </Grid>
                                <Grid size={{xs:5}}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                        Hora
                                    </Typography>
                                    <TextField
                                        type="time"
                                        fullWidth
                                        size="small"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        sx={{ bgcolor: 'background.paper' }}
                                    />
                                </Grid>
                            </Grid>

                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Ubicación (Distrito)
                                </Typography>
                                <UbigeoSelect
                                    value={newItem.ubigeoID}
                                    onChange={(id) => setNewItem({ ...newItem, ubigeoID: id })} label={''}                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Column 2 */}
                    <Grid size={{xs:12, md:5}}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Lugar Específico / Referencia
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Km 45, Frente al grifo..."
                                    value={newItem.lugar}
                                    onChange={(e) => setNewItem({ ...newItem, lugar: e.target.value })}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            </Box>
                            
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Descripción del Incidente
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    size="small"
                                    placeholder="Detalles de lo sucedido..."
                                    value={newItem.descripcion}
                                    onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Column 3 - Foto & Actions */}
                    <Grid size={{xs:12, md:3}}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
                            <Box sx={{ flex: 1, minHeight: 150 }}>
                                <ImageUpload
                                    value={newItem.rutaFoto}
                                    onChange={(path) => setNewItem({ ...newItem, rutaFoto: path })}
                                    label="Evidencia Fotográfica"
                                />
                            </Box>
                            <Button
                                fullWidth
                                variant="contained"
                                color={isEditing ? "warning" : "error"}
                                size="large"
                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={handleSave}
                                disabled={!newItem.tipoIncidenteID || !newItem.ubigeoID || !newItem.fechaHora || isLoading}
                                sx={{ 
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    boxShadow: theme.shadows[4]
                                }}
                            >
                                {isEditing ? "Guardar Cambios" : "Registrar Incidente"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
