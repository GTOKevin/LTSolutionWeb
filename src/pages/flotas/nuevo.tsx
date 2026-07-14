import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    MenuItem,
    Tab,
    Tabs,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFlotaForm } from '@features/flota/hooks/useFlotaForm';
import { FlotaDocumentosList } from '@features/flota/documentos/ui/FlotaDocumentosList';
import { TabPanel } from '@shared/components/ui/TabPanel';
import { TIPOS_COMBUSTIBLE } from '@entities/flota/model/constants';

export function FlotaNuevoPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const {
        form: {
            register,
            handleSubmit,
            formState: { errors, isDirty }
        },
        isSubmitting,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveFlotaId,
        canEditDocs,
        isEdit,
        createdFlotaId,
        listaFlota,
        listaPeso,
        listaMedida
    } = useFlotaForm({
        flotaToEdit: null,
        onSuccess: () => {},
        onClose: () => navigate('/app/flotas'),
        open: true
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const title = createdFlotaId ? 'Gestión de Vehículo' : 'Nuevo Vehículo';
    const subtitle = 'Administre la información técnica y documentos del vehículo';

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
                p: { xs: 2, md: 3 },
                position: 'relative',
                pb: { xs: 10, md: 3 }
            }}
        >
            <Box
                sx={{
                    maxWidth: 1600,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, md: 3 }
                }}
            >
                <Box
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            px: 3,
                            pt: 2,
                            pb: 0
                        }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        </Box>

                        <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                            <Tab label="Datos Técnicos" />
                            <Tab label="Documentos" disabled={!canEditDocs} />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 0 }}>
                        {activeTab === 0 && errorMessage && (
                            <Box sx={{ p: 3, pb: 0 }}>
                                <Alert severity="error" onClose={() => setErrorMessage(null)}>
                                    {errorMessage}
                                </Alert>
                            </Box>
                        )}

                        <TabPanel value={activeTab} index={0} name="flota">
                            <form id="flota-form" onSubmit={handleSubmit(onSubmit)}>
                                <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12 }}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="bold"
                                                color="primary"
                                                sx={{ mb: 1 }}
                                            >
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
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <TextField
                                                select
                                                label="Tipo Unidad"
                                                fullWidth
                                                {...register('tipoFlota')}
                                                value={activeTab === 0 ? (register('tipoFlota').name ? undefined : 0) : 0}
                                                defaultValue={0}
                                                error={!!errors.tipoFlota}
                                                helperText={errors.tipoFlota?.message}
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
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                label="Marca"
                                                fullWidth
                                                {...register('marca')}
                                                error={!!errors.marca}
                                                helperText={errors.marca?.message}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                label="Modelo"
                                                fullWidth
                                                {...register('modelo')}
                                                error={!!errors.modelo}
                                                helperText={errors.modelo?.message}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12 }}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="bold"
                                                color="primary"
                                                sx={{ mb: 1, mt: 2 }}
                                            >
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
                            {effectiveFlotaId && (
                                <Box sx={{ px: 3, py: 3 }}>
                                    <FlotaDocumentosList flotaId={effectiveFlotaId} viewOnly={false} />
                                </Box>
                            )}
                        </TabPanel>

                        <Box
                            sx={{
                                p: 3,
                                borderTop: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 2
                            }}
                        >
                            <Button
                                onClick={() => navigate('/app/flotas')}
                                variant="outlined"
                                color="inherit"
                                disabled={isSubmitting}
                            >
                                {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                            </Button>

                            {activeTab === 0 && (
                                <Button
                                    type="submit"
                                    form="flota-form"
                                    variant="contained"
                                    disabled={isSubmitting || (isEdit && !isDirty)}
                                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                                >
                                    {isEdit || createdFlotaId ? 'Guardar Cambios' : 'Crear Vehículo'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

