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
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { flotaApi } from '@/entities/flota/api/flota.api';
import { useFlotaForm } from '@/features/flota/hooks/useFlotaForm';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { TIPOS_COMBUSTIBLE } from '@/shared/constants/constantes';
import { FlotaDocumentosList } from '@/features/flota/documentos/ui/FlotaDocumentosList';

export function FlotaVerPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();

    const flotaId = Number(params.id);

    const { data: flota, isLoading } = useQuery({
        queryKey: ['flota', flotaId],
        queryFn: () => flotaApi.getById(flotaId).then((r) => r.data),
        enabled: Number.isFinite(flotaId) && flotaId > 0
    });

    const {
        form: {
            register,
            handleSubmit,
            formState: { errors }
        },
        isSubmitting,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveFlotaId,
        canEditDocs,
        listaFlota,
        listaPeso,
        listaMedida
    } = useFlotaForm({
        flotaToEdit: flota ?? null,
        onSuccess: () => {},
        onClose: () => navigate('/app/flota'),
        open: true
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

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
            <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
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
                                Detalle del Vehículo
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Información del vehículo
                            </Typography>
                        </Box>

                        <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                            <Tab label="Datos Técnicos" />
                            <Tab label="Documentos" disabled={!canEditDocs} />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 0 }}>
                        {isLoading && (
                            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        )}

                        {!isLoading && activeTab === 0 && errorMessage && (
                            <Box sx={{ p: 3, pb: 0 }}>
                                <Alert severity="error" onClose={() => setErrorMessage(null)}>
                                    {errorMessage}
                                </Alert>
                            </Box>
                        )}

                        {!isLoading && (
                            <>
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
                                                        disabled
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <TextField
                                                        select
                                                        label="Tipo Unidad"
                                                        fullWidth
                                                        {...register('tipoFlota')}
                                                        value={activeTab === 0 ? (register('tipoFlota').name ? undefined : 0) : 0}
                                                        defaultValue={flota?.tipoFlota ?? 0}
                                                        error={!!errors.tipoFlota}
                                                        helperText={errors.tipoFlota?.message}
                                                        disabled
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
                                                        disabled
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
                                                        disabled
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
                                                        disabled
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        label="Marca"
                                                        fullWidth
                                                        {...register('marca')}
                                                        error={!!errors.marca}
                                                        helperText={errors.marca?.message}
                                                        disabled
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        label="Modelo"
                                                        fullWidth
                                                        {...register('modelo')}
                                                        error={!!errors.modelo}
                                                        helperText={errors.modelo?.message}
                                                        disabled
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
                                                        defaultValue={flota?.tipoPesoID ?? 0}
                                                        error={!!errors.tipoPesoID}
                                                        helperText={errors.tipoPesoID?.message}
                                                        disabled
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
                                                        disabled
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
                                                        disabled
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
                                                        disabled
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <TextField
                                                        select
                                                        label="Tipo Medida"
                                                        fullWidth
                                                        {...register('tipoMedidaID')}
                                                        defaultValue={flota?.tipoMedidaID ?? 0}
                                                        error={!!errors.tipoMedidaID}
                                                        helperText={errors.tipoMedidaID?.message}
                                                        disabled
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
                                                        disabled
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
                                                        disabled
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
                                                        disabled
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <TextField
                                                        select
                                                        label="Combustible"
                                                        fullWidth
                                                        {...register('tipoCombustible')}
                                                        defaultValue={flota?.tipoCombustible ?? ''}
                                                        error={!!errors.tipoCombustible}
                                                        helperText={errors.tipoCombustible?.message}
                                                        disabled
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
                                            <FlotaDocumentosList flotaId={effectiveFlotaId} viewOnly />
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
                                        onClick={() => navigate('/app/flota')}
                                        variant="outlined"
                                        color="inherit"
                                        disabled={isSubmitting}
                                    >
                                        Cerrar
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

