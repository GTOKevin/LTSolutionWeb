import { Box, Chip, Divider, Grid, Paper, Typography, alpha, useTheme } from '@mui/material';
import type { FlotaExpediente, FlotaHistorialViaje } from '@entities/flota/model/types';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { SectionHeader } from '@shared/components/ui/SectionHeader';
import { buildCodigoInterno } from '@entities/flota/model/constants';
import { resolveVehicleDiagramVariant } from '@entities/flota/model/diagram';
import { formatDateShort } from '@shared/utils/date-utils';
import { resolveLengthUnitFromCode, resolveWeightUnitFromCode, WEIGHT_UNIT_SUFFIX } from '@shared/utils/format-utils';
import { PeruvianPlate } from '../../../shared/ui/PeruvianPlate';
import { FlotaBalanzaBar } from '../../../shared/ui/FlotaBalanzaBar';
import { VehicleSchematicDiagram } from '../VehicleSchematicDiagram';

interface FlotaFichaTabProps {
    expediente: FlotaExpediente;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem', mb: 0.25 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
                {value}
            </Typography>
        </Box>
    );
}

export function FlotaFichaTab({ expediente }: FlotaFichaTabProps) {
    const theme = useTheme();
    const { flota } = expediente;
    const ultimoViaje: FlotaHistorialViaje | undefined = expediente.viajes.items[0];

    const codigo = flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID);

    // Variante de diagrama y unidad de longitud derivadas del catálogo.
    const diagramVariant = resolveVehicleDiagramVariant(flota);
    const lengthUnit = resolveLengthUnitFromCode(flota.tipoMedida?.codigo);

    // Unidad de peso derivada del código del catálogo (no fija "KG").
    const cargaUnit = resolveWeightUnitFromCode(flota.tipoPeso?.codigo);
    const cargaUnitSuffix = cargaUnit ? ` ${WEIGHT_UNIT_SUFFIX[cargaUnit]}` : '';
    const formatCargaUtil = (value?: number | null) =>
        value == null ? '—' : `${value.toLocaleString('es-PE')}${cargaUnitSuffix}`;

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Hero Header Ejecutivo de Unidad (Stitch S3) */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#0F172A', 0.6) : '#F8FAFC',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                                {flota.marca} {flota.modelo} • {flota.tipoFlotaNavigation?.nombre ?? `Tipo ${flota.tipoFlota}`}
                            </Typography>
                            <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip
                                label={`Unidad ${codigo}`}
                                size="small"
                                sx={{ fontWeight: 800, fontFamily: 'monospace', height: 22, fontSize: '0.72rem' }}
                            />
                            {flota.homologacionMtc ? (
                                <Chip
                                    label={`Homologación MTC: ${flota.homologacionMtc}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: '0.72rem' }}
                                />
                            ) : null}
                            <Typography variant="caption" color="text.secondary">
                                {flota.anio ? `Año ${flota.anio}` : ''} {flota.color ? `• Color ${flota.color}` : ''}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Matrícula oficial peruana en gran formato */}
                    <PeruvianPlate placa={flota.placa} size="lg" />
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* 4 Métricas Ejecutivas del Hero */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field
                            label="CARGA ÚTIL NETA"
                            value={formatCargaUtil(flota.cargaUtil)}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field
                            label="ODÓMETRO ACTUAL"
                            value={flota.odometroActual != null ? `${flota.odometroActual.toLocaleString('es-PE')} KM` : '—'}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field
                            label="ÚLTIMO DESPACHO"
                            value={ultimoViaje ? `${ultimoViaje.codigo} (${formatDateShort(ultimoViaje.fechaPartida ?? '')})` : 'Sin viajes'}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Field
                            label="NÚMERO DE VIN / SERIE"
                            value={<span style={{ fontFamily: 'monospace' }}>{flota.vin || '—'}</span>}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Esquema Técnico Dimensional (Blueprint SVG) — todas las variantes,
                incluida Camioneta, para mantener paridad con la ficha PDF. */}
            <Box>
                <SectionHeader number="1" title="Esquema Técnico & Cotas Dimensionales" themeColor={theme.palette.primary.main} />
                <VehicleSchematicDiagram
                    variant={diagramVariant}
                    tipoNombre={flota.tipoFlotaNavigation?.nombre}
                    ejes={flota.ejes}
                    largo={flota.largo}
                    ancho={flota.ancho}
                    alto={flota.alto}
                    camaUtil={flota.camaUtil}
                    configuracionEjesCodigo={flota.configuracionEjes?.codigo}
                    configuracionEjesNombre={flota.configuracionEjes?.nombre}
                    codigoEspecifico={flota.tipoFlotaNavigation?.codigoEspecifico}
                    tipoFlotaId={flota.tipoFlota}
                    lengthUnit={lengthUnit}
                />
            </Box>

            {/* Balanza de Pesos y Límites MTC */}
            <Box>
                <SectionHeader number="2" title="Balanza de Pesos & Capacidad Autorizada" themeColor={theme.palette.success.main} />
                <FlotaBalanzaBar
                    pesoBruto={flota.pesoBruto}
                    pesoNeto={flota.pesoNeto}
                    cargaUtil={flota.cargaUtil}
                    mode="detailed"
                />
            </Box>

            {/* Identificación y Especificaciones Técnicas */}
            <Box>
                <SectionHeader number="3" title="Especificaciones Técnicas del Vehículo" themeColor={theme.palette.secondary.main} />
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                    }}
                >
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Marca" value={flota.marca || '—'} /></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Modelo" value={flota.modelo || '—'} /></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Año de Fabricación" value={flota.anio || '—'} /></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Color de Carrocería" value={flota.color || '—'} /></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Field label="Número de Ejes" value={`${flota.ejes || '—'} Ejes`} /></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Field label="Configuración de Ejes" value={flota.configuracionEjes?.nombre || '—'} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Field label="Combustible Primario" value={flota.tipoCombustibleNavigation?.nombre || '—'} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Field label="Carga Útil Declarada" value={formatCargaUtil(flota.cargaUtil)} />
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Box>
    );
}
