import { 
    Box, Typography, TextField, 
    FormControlLabel, Switch, Paper, 
    Grid, Divider, Avatar
} from '@mui/material';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MinorCrashIcon from '@mui/icons-material/MinorCrash';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import SquareFootOutlinedIcon from '@mui/icons-material/SquareFootOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

export interface ResumenGeneralData {
    fechaPartida: Dayjs | null;
    fechaLlegada: Dayjs | null;
    kmInicio: number | '';
    kmLlegada: number | '';
    largo: number | '';
    ancho: number | '';
    alto: number | '';
    peso: number | '';
    requiereEscolta: boolean;
}

interface ResumenGeneralTabProps {
    viajeListItem: ViajeListItem;
    formData: ResumenGeneralData;
    onChange: (data: Partial<ResumenGeneralData>) => void;
}

export function ResumenGeneralTab({ viajeListItem, formData, onChange }: ResumenGeneralTabProps) {
    const handleNumberChange = (field: keyof ResumenGeneralData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange({ [field]: val === '' ? '' : Number(val) });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Section: INFORMACIÓN DEL SERVICIO (Read-only) */}
            <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <InfoOutlinedIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Información del Servicio
                    </Typography>
                </Box>
                
                <Grid container spacing={2}>
                    {/* Cliente Card */}
                    <Grid size={{ xs: 12, md: 12 }}>
                        <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5, letterSpacing: 1 }}>
                                Cliente
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {viajeListItem.clienteRazonSocial || 'N/A'}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Conductor */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: 1 }}>
                                Conductor
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                                    <PersonIcon fontSize="small" />
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {viajeListItem.conductorNombreCompleto || 'N/A'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Tracto */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: 1 }}>
                                Tracto / Unidad
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalShippingIcon color="primary" fontSize="small" />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {viajeListItem.tractoPlaca || 'N/A'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Carreta */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: 1 }}>
                                Carreta / Remolque
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MinorCrashIcon color="primary" fontSize="small" />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {viajeListItem.carretaPlaca || 'N/A'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Route Path */}
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 3, position: 'relative' }}>
                                {/* Origen */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'flex', alignItems: 'center', mb: 1, letterSpacing: 1 }}>
                                        <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                                        Origen
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {viajeListItem.origenDescripcion || 'N/A'}
                                    </Typography>
                                </Box>

                                {/* Connecting Line (Desktop) */}
                                <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, alignItems: 'center', px: 2 }}>
                                    <Divider sx={{ width: '100%', borderStyle: 'dashed', borderColor: 'text.disabled' }} />
                                </Box>

                                {/* Destino */}
                                <Box sx={{ flex: 1, textAlign: { md: 'right' } }}>
                                    <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: { md: 'flex-end' }, mb: 1, letterSpacing: 1 }}>
                                        <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main', mr: 1 }} />
                                        Destino
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {viajeListItem.destinoDescripcion || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Grid container spacing={4}>
                {/* Section: SEGUIMIENTO Y CONTROL (Editable) */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <AnalyticsOutlinedIcon fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Seguimiento y Control
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Fecha de Partida
                                </Typography>
                                <DatePicker 
                                    slotProps={{ textField: { fullWidth: true, size: "small", sx: { bgcolor: 'background.default' } } }}
                                    value={formData.fechaPartida}
                                    onChange={(date) => onChange({ fechaPartida: date })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Fecha de Llegada
                                </Typography>
                                <DatePicker 
                                    slotProps={{ textField: { fullWidth: true, size: "small", sx: { bgcolor: 'background.default' } } }}
                                    value={formData.fechaLlegada}
                                    onChange={(date) => onChange({ fechaLlegada: date })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Km. Inicio
                                </Typography>
                                <TextField 
                                    fullWidth 
                                    type="number"
                                    size="small" 
                                    sx={{ bgcolor: 'background.default' }}
                                    InputProps={{
                                        endAdornment: <Typography variant="caption" fontWeight="bold" color="text.secondary">KM</Typography>
                                    }}
                                    value={formData.kmInicio}
                                    onChange={handleNumberChange('kmInicio')}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Km. Final
                                </Typography>
                                <TextField 
                                    fullWidth 
                                    type="number"
                                    size="small" 
                                    sx={{ bgcolor: 'background.default' }}
                                    InputProps={{
                                        endAdornment: <Typography variant="caption" fontWeight="bold" color="text.secondary">KM</Typography>
                                    }}
                                    value={formData.kmLlegada}
                                    onChange={handleNumberChange('kmLlegada')}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Section: DIMENSIONES Y PESO (Editable) */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <SquareFootOutlinedIcon fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Dimensiones y Peso
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Largo (m)
                                </Typography>
                                <TextField 
                                    fullWidth 
                                    type="number" 
                                    size="small" 
                                    sx={{ bgcolor: 'background.default' }}
                                    value={formData.largo} 
                                    onChange={handleNumberChange('largo')} 
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Ancho (m)
                                </Typography>
                                <TextField 
                                    fullWidth 
                                    type="number" 
                                    size="small" 
                                    sx={{ bgcolor: 'background.default' }}
                                    value={formData.ancho} 
                                    onChange={handleNumberChange('ancho')} 
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Alto (m)
                                </Typography>
                                <TextField 
                                    fullWidth 
                                    type="number" 
                                    size="small" 
                                    sx={{ bgcolor: 'background.default' }}
                                    value={formData.alto} 
                                    onChange={handleNumberChange('alto')} 
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Peso Bruto Total
                                </Typography>
                                <TextField 
                                    fullWidth 
                                    type="number" 
                                    size="small" 
                                    sx={{ bgcolor: 'background.default' }}
                                    InputProps={{
                                        endAdornment: <Typography variant="caption" fontWeight="bold" color="text.secondary">KG</Typography>
                                    }}
                                    value={formData.peso} 
                                    onChange={handleNumberChange('peso')} 
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>

            {/* Special Options Switch */}
            <Box component="section">
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1, position: 'absolute' }} />
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                                <VerifiedUserOutlinedIcon />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    Opciones de Seguridad
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Requerimientos especiales para el trayecto.
                                </Typography>
                            </Box>
                        </Box>
                        
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={formData.requiereEscolta}
                                    onChange={(e) => onChange({ requiereEscolta: e.target.checked })} 
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    Requiere escolta
                                </Typography>
                            }
                            sx={{ m: 0 }}
                        />
                    </Box>
                </Paper>
            </Box>

        </Box>
    );
}
