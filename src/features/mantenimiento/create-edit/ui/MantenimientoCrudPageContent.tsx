import {
    Box,
    Grid,
    MenuItem,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import { DirectionsCar as CarIcon, VisibilityOff as HiddenIcon } from '@mui/icons-material';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { SelectItem } from '@/shared/model/types';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { AsyncAutocomplete } from '@/shared/components/ui/AsyncAutocomplete';
import { MANTENIMIENTO_SELECT_KEYS, mantenimientoResourceLoaders } from '@features/mantenimiento/options/hooks/useMantenimientoResourceSearch';
import { resolveMantenimientoCompletadoId } from '@entities/mantenimiento/model/status';
import { MantenimientoDetalleList } from '../../detalles/ui/MantenimientoDetalleList';
import type { CreateMantenimientoFormInput, CreateMantenimientoSchema } from '../../model/schema';

interface MantenimientoCrudPageContentProps {
    activeTab: number;
    form: UseFormReturn<CreateMantenimientoFormInput, unknown, CreateMantenimientoSchema>;
    onSubmit: (data: CreateMantenimientoSchema) => void;
    effectiveId: number | null;
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
    listaTiposServicio,
    listaEstados,
    mantenimientoInfo,
    isEdit,
    createdId,
    viewOnly = false,
}: MantenimientoCrudPageContentProps) {
    const theme = useTheme();
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = form;
    const completadoEstadoId = resolveMantenimientoCompletadoId(listaEstados);
    const { loadFlotas } = mantenimientoResourceLoaders;

    // Unidad preseleccionada (edición/consulta): alimenta el label del
    // AsyncAutocomplete antes de la primera búsqueda remota.
    const flotaInitialOptions = useMemo<SelectItem[]>(() => {
        const flota = mantenimientoInfo?.flota;
        if (!flota) return [];
        return [{ id: flota.flotaID, text: flota.placa }];
    }, [mantenimientoInfo]);

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
                                    <Controller
                                        name="flotaID"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <AsyncAutocomplete
                                                resourceKey={MANTENIMIENTO_SELECT_KEYS.flotas}
                                                label="Unidad"
                                                ariaLabel="Unidad"
                                                placeholder="Buscar por placa, marca o modelo..."
                                                size="medium"
                                                required
                                                value={typeof field.value === 'number' ? field.value : 0}
                                                onChange={(value) => field.onChange(value)}
                                                loadOptions={loadFlotas}
                                                initialOptions={flotaInitialOptions}
                                                error={!!error}
                                                helperText={error?.message?.toString()}
                                                disabled={viewOnly}
                                            />
                                        )}
                                    />
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
                                                if (!completadoEstadoId) return true;
                                                return item.id !== completadoEstadoId;
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
