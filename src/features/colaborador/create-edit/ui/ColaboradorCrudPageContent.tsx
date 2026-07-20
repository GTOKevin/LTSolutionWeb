import {
    Box,
    Divider,
    FormControlLabel,
    Grid,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import type { SelectItem } from '@/shared/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { LicenciaList } from '../../licencias/ui/LicenciaList';
import { ColaboradorDocumentoList } from '../../documentos/ui/ColaboradorDocumentoList';
import { ColaboradorPagoList } from '../../pagos/ui/ColaboradorPagoList';
import { handleAddressKeyDown, handleLettersOnlyKeyDown, handleNumbersOnlyKeyDown } from '@/shared/utils/input-validators';
import type { CreateColaboradorSchema } from '../../model/schema';
import type { useColaboradorForm } from '../../hooks/useColaboradorForm';

interface ColaboradorCrudPageContentProps {
    activeTab: number;
    form: ReturnType<typeof useColaboradorForm>['form'];
    onSubmit: (data: CreateColaboradorSchema) => void;
    effectiveId: number | null;
    roles: SelectItem[];
    generos: SelectItem[];
    monedas: SelectItem[];
    isEdit: boolean;
    viewOnly?: boolean;
}

export function ColaboradorCrudPageContent({
    activeTab,
    form,
    onSubmit,
    effectiveId,
    roles,
    generos,
    monedas,
    isEdit,
    viewOnly = false,
}: ColaboradorCrudPageContentProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = form;

    return (
        <>
            <TabPanel value={activeTab} index={0} name="colaborador">
                <form id="colab-form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                    Información Básica
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Nombres"
                                    fullWidth
                                    {...register('nombres')}
                                    onKeyDown={handleLettersOnlyKeyDown}
                                    error={!!errors.nombres}
                                    helperText={errors.nombres?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Primer Apellido"
                                    fullWidth
                                    {...register('primerApellido')}
                                    onKeyDown={handleLettersOnlyKeyDown}
                                    error={!!errors.primerApellido}
                                    helperText={errors.primerApellido?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Segundo Apellido"
                                    fullWidth
                                    {...register('segundoApellido')}
                                    onKeyDown={handleLettersOnlyKeyDown}
                                    error={!!errors.segundoApellido}
                                    helperText={errors.segundoApellido?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="tipoGeneroID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Género"
                                            fullWidth
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            value={field.value || 0}
                                            error={!!errors.tipoGeneroID}
                                            helperText={errors.tipoGeneroID?.message}
                                            disabled={viewOnly}
                                        >
                                            <MenuItem value={0} disabled>
                                                Seleccione
                                            </MenuItem>
                                            {generos.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Fecha Nacimiento"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('fechaNacimiento')}
                                    error={!!errors.fechaNacimiento}
                                    helperText={errors.fechaNacimiento?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 1 }}>
                                    Contacto y Dirección
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Teléfono"
                                    fullWidth
                                    {...register('telefono')}
                                    onKeyDown={handleNumbersOnlyKeyDown}
                                    error={!!errors.telefono}
                                    helperText={errors.telefono?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Dirección"
                                    fullWidth
                                    {...register('direccion')}
                                    onKeyDown={handleAddressKeyDown}
                                    error={!!errors.direccion}
                                    helperText={errors.direccion?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 1 }}>
                                    Datos Laborales
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="rolColaboradorID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Rol / Cargo"
                                            fullWidth
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            value={field.value || 0}
                                            error={!!errors.rolColaboradorID}
                                            helperText={errors.rolColaboradorID?.message}
                                            disabled={viewOnly}
                                        >
                                            <MenuItem value={0} disabled>
                                                Seleccione
                                            </MenuItem>
                                            {roles.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Fecha Ingreso"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('fechaIngreso')}
                                    error={!!errors.fechaIngreso}
                                    helperText={errors.fechaIngreso?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="monedaID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Moneda Pago"
                                            fullWidth
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            value={field.value || 0}
                                            error={!!errors.monedaID}
                                            helperText={errors.monedaID?.message}
                                            disabled={viewOnly}
                                        >
                                            <MenuItem value={0} disabled>
                                                Seleccione
                                            </MenuItem>
                                            {monedas.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Salario Base"
                                    type="number"
                                    fullWidth
                                    {...register('salario', { valueAsNumber: true })}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            {isEdit ? (
                                <Grid size={{ xs: 12 }} display="flex" alignItems="center">
                                    <Controller
                                        name="activo"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        color="success"
                                                        disabled={viewOnly}
                                                    />
                                                }
                                                label="Colaborador Activo"
                                            />
                                        )}
                                    />
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </form>
            </TabPanel>

            <TabPanel value={activeTab} index={1} name="colaborador">
                <Box sx={{ px: 3, py: 3 }}>
                    {effectiveId ? (
                        <LicenciaList colaboradorId={effectiveId} viewOnly={viewOnly} />
                    ) : (
                        <Box p={3} textAlign="center" color="text.secondary">
                            Guarde el colaborador para agregar licencias
                        </Box>
                    )}
                </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={2} name="colaborador">
                <Box sx={{ px: 3, py: 3 }}>
                    {effectiveId ? (
                        <ColaboradorDocumentoList colaboradorId={effectiveId} viewOnly={viewOnly} />
                    ) : (
                        <Box p={3} textAlign="center" color="text.secondary">
                            Guarde el colaborador para agregar documentos
                        </Box>
                    )}
                </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={3} name="colaborador">
                <Box sx={{ px: 3, py: 3 }}>
                    {effectiveId ? (
                        <ColaboradorPagoList colaboradorId={effectiveId} viewOnly={viewOnly} />
                    ) : (
                        <Box p={3} textAlign="center" color="text.secondary">
                            Guarde el colaborador para agregar pagos
                        </Box>
                    )}
                </Box>
            </TabPanel>
        </>
    );
}
