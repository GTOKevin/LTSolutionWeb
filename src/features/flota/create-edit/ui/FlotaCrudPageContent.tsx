import {
    Box,
    Grid,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import type { SelectItem } from '@/shared/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { TIPOS_COMBUSTIBLE } from '@entities/flota/model/constants';
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
    viewOnly = false,
}: FlotaCrudPageContentProps) {
    const {
        register,
        handleSubmit,
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
                                <TextField
                                    select
                                    label="Tipo Unidad"
                                    fullWidth
                                    {...register('tipoFlota')}
                                    defaultValue={0}
                                    error={!!errors.tipoFlota}
                                    helperText={errors.tipoFlota?.message}
                                    disabled={viewOnly}
                                >
                                    <MenuItem value={0} disabled>
                                        Seleccione un tipo
                                    </MenuItem>
                                    {listaFlota.map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>
                                            {tipo.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
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
                                <TextField
                                    select
                                    label="Tipo Peso"
                                    fullWidth
                                    {...register('tipoPesoID')}
                                    defaultValue={0}
                                    error={!!errors.tipoPesoID}
                                    helperText={errors.tipoPesoID?.message}
                                    disabled={viewOnly}
                                >
                                    <MenuItem value={0} disabled>
                                        Seleccione un tipo
                                    </MenuItem>
                                    {listaPeso.map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>
                                            {tipo.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
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
                                <TextField
                                    select
                                    label="Tipo Medida"
                                    fullWidth
                                    {...register('tipoMedidaID')}
                                    defaultValue={0}
                                    error={!!errors.tipoMedidaID}
                                    helperText={errors.tipoMedidaID?.message}
                                    disabled={viewOnly}
                                >
                                    <MenuItem value={0} disabled>
                                        Seleccione un tipo
                                    </MenuItem>
                                    {listaMedida.map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>
                                            {tipo.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
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
                                <TextField
                                    select
                                    label="Combustible"
                                    fullWidth
                                    {...register('tipoCombustible')}
                                    defaultValue=""
                                    error={!!errors.tipoCombustible}
                                    helperText={errors.tipoCombustible?.message}
                                    disabled={viewOnly}
                                >
                                    {TIPOS_COMBUSTIBLE.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
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
