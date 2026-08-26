import {
    Box, Typography, TextField,
    FormControlLabel, Switch,
    Grid, Divider, Button, CircularProgress
} from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import {
    resolveViajeEstadoProyectado,
} from '@entities/viaje/model/status';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import type { ResumenGeneralData } from '../../model/viaje-edit-tabs';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import SquareFootOutlinedIcon from '@mui/icons-material/SquareFootOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

interface ResumenGeneralTabProps {
    viaje: Viaje;
    formData: ResumenGeneralData;
    onChange: (data: Partial<ResumenGeneralData>) => void;
    onSave?: () => void;
    isSaving?: boolean;
    isViewOnly?: boolean;
    viajeEstados?: SelectItem[];
}

const getConductorNombre = (viaje: Viaje) =>
    [viaje.colaborador?.nombres, viaje.colaborador?.primerApellido, viaje.colaborador?.segundoApellido]
        .filter(Boolean)
        .join(' ')
        .trim();

const getUbigeoDescripcion = (ubigeo?: Viaje['origen']) =>
    [ubigeo?.departamento, ubigeo?.provincia, ubigeo?.distrito]
        .filter(Boolean)
        .join(', ')
        .trim();

const getDisplayValue = (value: string | null | undefined, fallback: string) =>
    value?.trim() ? value : fallback;

export function ResumenGeneralTab({ viaje, formData, onChange, onSave, isSaving = false, isViewOnly, viajeEstados }: ResumenGeneralTabProps) {
    const handleNumberChange = (field: keyof ResumenGeneralData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange({ [field]: val === '' ? '' : Number(val) });
    };

    const handleFechaChange = (field: 'fechaPartida' | 'fechaDescarga') => (date: Dayjs | null) => {
        const next: Partial<ResumenGeneralData> = { [field]: date };
        const fechaActualStr = (value: Dayjs | null | undefined) => (value ? value.format('YYYY-MM-DD') : undefined);

        const estadoPendienteCodigo =
            viajeEstados?.find((item) => item.id === formData.estadoID)?.extra
            ?? viaje.estado?.codigo
            ?? null;

        const estadoProyectado = resolveViajeEstadoProyectado(
            {
                fechaPartida: field === 'fechaPartida' ? fechaActualStr(date) : fechaActualStr(formData.fechaPartida),
                fechaDescarga: field === 'fechaDescarga' ? fechaActualStr(date) : fechaActualStr(formData.fechaDescarga),
            },
            estadoPendienteCodigo,
            viajeEstados,
        );

        if (estadoProyectado) {
            next.estadoID = estadoProyectado.estadoID;
            next.estadoNombre = estadoProyectado.estadoNombre;
        }

        onChange(next);
    };

    const conductorNombre = getConductorNombre(viaje);
    const origenDescripcion = getUbigeoDescripcion(viaje.origen);
    const destinoDescripcion = getUbigeoDescripcion(viaje.destino);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Información del Servicio
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                Cliente
                            </Typography>
                            <Box sx={{
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                px: 1.5,
                                py: 1.5,
                                bgcolor: 'background.paper'
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {getDisplayValue(viaje.cliente?.razonSocial, 'Sin cliente asociado')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                Conductor
                            </Typography>
                            <Box sx={{
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                px: 1.5,
                                py: 1.5,
                                bgcolor: 'background.paper'
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {getDisplayValue(conductorNombre, 'Sin conductor asignado')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                Tracto
                            </Typography>
                            <Box sx={{
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                px: 1.5,
                                py: 1.5,
                                bgcolor: 'background.paper'
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {getDisplayValue(viaje.tracto?.placa, 'Sin tracto asignado')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                Carreta
                            </Typography>
                            <Box sx={{
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                px: 1.5,
                                py: 1.5,
                                bgcolor: 'background.paper'
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {getDisplayValue(viaje.carreta?.placa, 'Sin carreta asignada')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                            <Box sx={{ flex: 1, p: 2.5, border: '1px dashed', borderColor: 'divider', borderRadius: 3, bgcolor: 'action.hover' }}>
                                <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1, lineHeight: 1 }}>
                                    PUNTO DE ORIGEN
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {getDisplayValue(origenDescripcion, 'Origen no registrado')}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1, p: 2.5, border: '1px dashed', borderColor: 'divider', borderRadius: 3, bgcolor: 'action.hover' }}>
                                <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1, lineHeight: 1 }}>
                                    PUNTO DE DESTINO
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {getDisplayValue(destinoDescripcion, 'Destino no registrado')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <AnalyticsOutlinedIcon fontSize="small" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Seguimiento y Control
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Fecha Carga
                                    </Typography>
                                    <DatePicker
                                        slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                        value={formData.fechaCarga}
                                        onChange={(date) => onChange({ fechaCarga: date })}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Fecha Partida
                                    </Typography>
                                    <DatePicker
                                        slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                        value={formData.fechaPartida}
                                        onChange={handleFechaChange('fechaPartida')}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Fecha Llegada
                                    </Typography>
                                    <DatePicker
                                        slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                        value={formData.fechaLlegada}
                                        onChange={(date) => onChange({ fechaLlegada: date })}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Fecha Descarga
                                    </Typography>
                                    <DatePicker
                                        slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                        value={formData.fechaDescarga}
                                        onChange={handleFechaChange('fechaDescarga')}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Fecha Llegada Base
                                    </Typography>
                                    <DatePicker
                                        slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                        value={formData.fechaLlegadaBase}
                                        onChange={(date) => onChange({ fechaLlegadaBase: date })}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Km Inicio
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        value={formData.kmInicio}
                                        onChange={handleNumberChange('kmInicio')}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Km Llegada
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        value={formData.kmLlegada}
                                        onChange={handleNumberChange('kmLlegada')}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Km Base
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        value={formData.kmLlegadaBase ?? ''}
                                        onChange={handleNumberChange('kmLlegadaBase')}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <SquareFootOutlinedIcon fontSize="small" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Configuración de Carga
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                        Peso Total
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        value={formData.peso}
                                        onChange={handleNumberChange('peso')}
                                        disabled={isViewOnly}
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                    Dimensiones (Largo x Ancho x Alto)
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            placeholder="Largo (m)"
                                            sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            value={formData.largo}
                                            onChange={handleNumberChange('largo')}
                                            disabled={isViewOnly}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            placeholder="Ancho (m)"
                                            sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            value={formData.ancho}
                                            onChange={handleNumberChange('ancho')}
                                            disabled={isViewOnly}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            placeholder="Alto (m)"
                                            sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            value={formData.alto}
                                            onChange={handleNumberChange('alto')}
                                            disabled={isViewOnly}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>

            <Box component="section">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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

                    <Box sx={{ display: 'flex', gap: 4 }}>
                        <FormControlLabel
                            disabled={true}
                            control={
                                <Switch
                                    checked={formData.requiereEscolta}
                                    onChange={(e) => onChange({ requiereEscolta: e.target.checked })}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    Requiere escolta
                                </Typography>
                            }
                            sx={{ m: 0 }}
                        />
                    </Box>
                </Box>
            </Box>

            {!isViewOnly ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" onClick={onSave} disabled={isSaving}>
                        {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                    </Button>
                </Box>
            ) : null}
        </Box>
    );
}
