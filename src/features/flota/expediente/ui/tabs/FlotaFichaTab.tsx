import { Box, Chip, Divider, Grid, Paper, Typography, alpha, useTheme } from '@mui/material';
import type { FlotaExpediente, FlotaHistorialViaje } from '@entities/flota/model/types';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { SectionHeader } from '@shared/components/ui/SectionHeader';
import { buildCodigoInterno } from '@entities/flota/model/constants';
import { formatDateShort } from '@shared/utils/date-utils';

interface FlotaFichaTabProps {
    expediente: FlotaExpediente;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
                {value}
            </Typography>
        </Box>
    );
}

const formatNumber = (value?: number | null, suffix = '') =>
    value == null ? '—' : `${value}${suffix}`;

export function FlotaFichaTab({ expediente }: FlotaFichaTabProps) {
    const theme = useTheme();
    const { flota } = expediente;
    const ultimoViaje: FlotaHistorialViaje | undefined = expediente.viajes.items[0];

    return (
        <Box sx={{ px: { xs: 2, md: 3 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    mb: 3,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                        <Typography variant="h5" fontWeight={800} fontFamily="monospace">
                            {flota.placa}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID)} ·{' '}
                            {flota.tipoFlotaNavigation?.nombre ?? `Tipo ${flota.tipoFlota}`} · {flota.marca} {flota.modelo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {flota.anio} · {flota.color || 'Color —'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                        {flota.homologacionMtc ? (
                            <Chip label={`Homologación MTC: ${flota.homologacionMtc}`} size="small" variant="outlined" />
                        ) : null}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field label="VIN" value={flota.vin || '—'} />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field label="Odómetro" value={flota.odometroActual != null ? `${flota.odometroActual} km` : '—'} />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field label="Carga Útil" value={formatNumber(flota.cargaUtil, ' kg')} />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field
                            label="Último Despacho"
                            value={ultimoViaje ? `${ultimoViaje.codigo} · ${formatDateShort(ultimoViaje.fechaPartida ?? '')}` : '—'}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <SectionHeader number="1" title="Identificación" themeColor={theme.palette.primary.main} />
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Marca" value={flota.marca || '—'} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Modelo" value={flota.modelo || '—'} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Año" value={flota.anio || '—'} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Color" value={flota.color || '—'} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Ejes" value={flota.ejes || '—'} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Field label="Configuración de Ejes" value={flota.configuracionEjes?.nombre || '—'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Field label="Combustible" value={flota.tipoCombustibleNavigation?.nombre || '—'} />
                </Grid>
            </Grid>

            <SectionHeader number="2" title="Cotas Dimensionales" themeColor={theme.palette.secondary.main} />
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}><Field label="Largo" value={formatNumber(flota.largo, ' m')} /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><Field label="Ancho" value={formatNumber(flota.ancho, ' m')} /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><Field label="Alto" value={formatNumber(flota.alto, ' m')} /></Grid>
            </Grid>

            <SectionHeader number="3" title="Balanza" themeColor={theme.palette.success.main} />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Field label="PBV (Peso Bruto)" value={formatNumber(flota.pesoBruto, ' kg')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Field label="Tara (Peso Neto)" value={formatNumber(flota.pesoNeto, ' kg')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Field label="Carga Útil" value={formatNumber(flota.cargaUtil, ' kg')} />
                </Grid>
            </Grid>
        </Box>
    );
}
