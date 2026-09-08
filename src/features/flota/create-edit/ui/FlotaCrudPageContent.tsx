import {
    Box,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import type { SelectItem } from '@/shared/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FlotaDocumentosList } from '../../documentos/ui/FlotaDocumentosList';
import type { CreateFlotaSchema } from '../../model/schema';
import type { useFlotaForm } from '../../hooks/useFlotaForm';

interface FlotaCrudPageContentProps {
    activeTab: number;
    form: ReturnType<typeof useFlotaForm>['form'];
    onSubmit: (data: CreateFlotaSchema) => void;
    effectiveFlotaId: number | null;
    listaFlota: SelectItem[];
    listaPeso: SelectItem[];
    listaMedida: SelectItem[];
    listaCombustible: SelectItem[];
    viewOnly?: boolean;
}

export function FlotaCrudPageContent({
    activeTab,
    form,
    onSubmit,
    effectiveFlotaId,
    listaFlota,
    listaPeso,
    listaMedida,
    listaCombustible,
    viewOnly = false,
}: FlotaCrudPageContentProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = form;

    return (
        <>
            <TabPanel value={activeTab} index={0} name="flota">
                <form id="flota-form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                    Identificación
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Placa"
                                    fullWidth
                                    {...register('placa')}
                                    error={!!errors.placa}
                                    helperText={errors.placa?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoFlota"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Tipo Unidad"
                                            size='medium'
                                            options={listaFlota}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoFlota}
                                            helperText={errors.tipoFlota?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Color"
                                    fullWidth
                                    {...register('color')}
                                    error={!!errors.color}
                                    helperText={errors.color?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Ejes"
                                    type="number"
                                    fullWidth
                                    {...register('ejes')}
                                    error={!!errors.ejes}
                                    helperText={errors.ejes?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Año"
                                    type="number"
                                    fullWidth
                                    {...register('anio')}
                                    error={!!errors.anio}
                                    helperText={errors.anio?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Marca"
                                    fullWidth
                                    {...register('marca')}
                                    error={!!errors.marca}
                                    helperText={errors.marca?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Modelo"
                                    fullWidth
                                    {...register('modelo')}
                                    error={!!errors.modelo}
                                    helperText={errors.modelo?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 2 }}>
                                    Especificaciones Técnicas
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoPesoID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Tipo Peso"
                                            size='medium'
                                            options={listaPeso}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoPesoID}
                                            helperText={errors.tipoPesoID?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Peso Bruto"
                                    type="number"
                                    fullWidth
                                    {...register('pesoBruto')}
                                    error={!!errors.pesoBruto}
                                    helperText={errors.pesoBruto?.message}
                                    slotProps={{ htmlInput: { step: '0.01' } }}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Peso Neto"
                                    type="number"
                                    fullWidth
                                    {...register('pesoNeto')}
                                    error={!!errors.pesoNeto}
                                    helperText={errors.pesoNeto?.message}
                                    slotProps={{ htmlInput: { step: '0.01' } }}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Carga Útil"
                                    type="number"
                                    fullWidth
                                    {...register('cargaUtil')}
                                    error={!!errors.cargaUtil}
                                    helperText={errors.cargaUtil?.message}
                                    slotProps={{ htmlInput: { step: '0.01' } }}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoMedidaID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Tipo Medida"
                                            size='medium'
                                            options={listaMedida}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoMedidaID}
                                            helperText={errors.tipoMedidaID?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Alto (m)"
                                    type="number"
                                    fullWidth
                                    {...register('alto')}
                                    error={!!errors.alto}
                                    helperText={errors.alto?.message}
                                    slotProps={{ htmlInput: { step: '0.01' } }}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Ancho (m)"
                                    type="number"
                                    fullWidth
                                    {...register('ancho')}
                                    error={!!errors.ancho}
                                    helperText={errors.ancho?.message}
                                    slotProps={{ htmlInput: { step: '0.01' } }}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Largo (m)"
                                    type="number"
                                    fullWidth
                                    {...register('largo')}
                                    error={!!errors.largo}
                                    helperText={errors.largo?.message}
                                    slotProps={{ htmlInput: { step: '0.01' } }}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoCombustibleID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Combustible"
                                            size='medium'
                                            options={listaCombustible}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoCombustibleID}
                                            helperText={errors.tipoCombustibleID?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </form>
            </TabPanel>

            <TabPanel value={activeTab} index={1} name="flota">
                {effectiveFlotaId ? (
                    <Box sx={{ px: 3, py: 3 }}>
                        <FlotaDocumentosList flotaId={effectiveFlotaId} viewOnly={viewOnly} />
                    </Box>
                ) : null}
            </TabPanel>
        </>
    );
}
