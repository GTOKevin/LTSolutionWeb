import {
    Box,
    Grid,
    MenuItem,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { DirectionsCar as CarIcon, VisibilityOff as HiddenIcon } from '@mui/icons-material';
import type { UseFormReturn } from 'react-hook-form';
import type { SelectItem } from '@/shared/model/types';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { MantenimientoDetalleList } from '../../detalles/ui/MantenimientoDetalleList';
import type { CreateMantenimientoFormInput, CreateMantenimientoSchema } from '../../model/schema';

interface MantenimientoCrudPageContentProps {
    activeTab: number;
    form: UseFormReturn<CreateMantenimientoFormInput, unknown, CreateMantenimientoSchema>;
    onSubmit: (data: CreateMantenimientoSchema) => void;
    effectiveId: number | null;
    listaFlotas: SelectItem[];
    listaTiposServicio: SelectItem[];
    listaEstados: SelectItem[];
    mantenimientoInfo?: Mantenimiento | null;
    isEdit: boolean;
    createdId: number | null;
    viewOnly?: boolean;
}

export function MantenimientoCrudPageContent({
    activeTab,
    form,
    onSubmit,
    effectiveId,
    listaFlotas,
    listaTiposServicio,
    listaEstados,
    mantenimientoInfo,
    isEdit,
    createdId,
    viewOnly = false,
}: MantenimientoCrudPageContentProps) {
    const theme = useTheme();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    return (
        <>
            <TabPanel value={activeTab} index={0} name="mantenimiento">
                <form id="mantenimiento-form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                color="text.primary"
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1
                                }}
                            >
                                <CarIcon fontSize="small" color="primary" />
                                Identificación de Unidad
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Unidad"
                                        fullWidth
                                        {...register('flotaID')}
                                        defaultValue={mantenimientoInfo?.flotaID ?? 0}
                                        error={!!errors.flotaID}
                                        helperText={errors.flotaID?.message}
                                        disabled={viewOnly}
                                    >
                                        <MenuItem value={0} disabled>
                                            Seleccione una unidad...
                                        </MenuItem>
                                        {listaFlotas.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Tipo de Servicio"
                                        fullWidth
                                        {...register('tipoServicioID')}
                                        defaultValue={mantenimientoInfo?.tipoServicioID ?? 0}
                                        error={!!errors.tipoServicioID}
                                        helperText={errors.tipoServicioID?.message}
                                        disabled={viewOnly}
                                    >
                                        <MenuItem value={0} disabled>
                                            Seleccione tipo...
                                        </MenuItem>
                                        {listaTiposServicio.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <SectionHeader
                                number="2"
                                title="Detalles de Ingreso"
                                themeColor={theme.palette.primary.main}
                            />
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Fecha de Ingreso"
                                        type="date"
                                        fullWidth
                                        {...register('fechaIngreso')}
                                        error={!!errors.fechaIngreso}
                                        helperText={errors.fechaIngreso?.message}
                                        disabled={viewOnly}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Kilometraje Ingreso"
                                        type="number"
                                        fullWidth
                                        {...register('kmIngreso')}
                                        error={!!errors.kmIngreso}
                                        helperText={errors.kmIngreso?.message}
                                        disabled={viewOnly}
                                        InputProps={{
                                            endAdornment: (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        bgcolor: 'action.hover',
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    KM
                                                </Typography>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Motivo de Ingreso / Observaciones"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        {...register('motivoIngreso')}
                                        error={!!errors.motivoIngreso}
                                        helperText={errors.motivoIngreso?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Estado"
                                        fullWidth
                                        {...register('estadoID')}
                                        defaultValue={mantenimientoInfo?.estadoID ?? 0}
                                        error={!!errors.estadoID}
                                        helperText={errors.estadoID?.message}
                                        disabled={viewOnly}
                                    >
                                        <MenuItem value={0} disabled>
                                            Seleccione estado...
                                        </MenuItem>
                                        {listaEstados
                                            .filter((item) => {
                                                if (viewOnly || isEdit || createdId) return true;
                                                return item.text.toUpperCase() !== 'COMPLETADO';
                                            })
                                            .map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.text}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>

                        {isEdit || createdId ? (
                            <Box
                                sx={{
                                    mb: 3,
                                    p: 2,
                                    bgcolor: 'action.hover',
                                    borderRadius: 2,
                                    border: '1px dashed',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <HiddenIcon fontSize="small" />
                                    Cierre y Diagnóstico (Opcional)
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Fecha de Salida"
                                            type="date"
                                            fullWidth
                                            {...register('fechaSalida')}
                                            error={!!errors.fechaSalida}
                                            helperText={errors.fechaSalida?.message}
                                            disabled={viewOnly}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Kilometraje Salida"
                                            type="number"
                                            fullWidth
                                            {...register('kmSalida')}
                                            error={!!errors.kmSalida}
                                            helperText={errors.kmSalida?.message}
                                            disabled={viewOnly}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Diagnóstico Mecánico"
                                            multiline
                                            rows={2}
                                            fullWidth
                                            {...register('diagnosticoMecanico')}
                                            error={!!errors.diagnosticoMecanico}
                                            helperText={errors.diagnosticoMecanico?.message}
                                            disabled={viewOnly}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Solución"
                                            multiline
                                            rows={2}
                                            fullWidth
                                            {...register('solucion')}
                                            error={!!errors.solucion}
                                            helperText={errors.solucion?.message}
                                            disabled={viewOnly}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : null}
                    </Box>
                </form>
            </TabPanel>

            <TabPanel value={activeTab} index={1} name="mantenimiento">
                {effectiveId ? (
                    <Box sx={{ px: 3, py: 3 }}>
                        <MantenimientoDetalleList
                            mantenimientoId={effectiveId}
                            viewOnly={viewOnly}
                            mantenimientoInfo={mantenimientoInfo}
                        />
                    </Box>
                ) : null}
            </TabPanel>
        </>
    );
}
