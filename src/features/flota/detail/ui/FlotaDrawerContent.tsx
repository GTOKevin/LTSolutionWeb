import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    Build as BuildIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    Speed as OdometerIcon,
    Person as PersonIcon,
    AltRoute as RouteIcon,
} from '@mui/icons-material';
import type { FlotaDocumento } from '@entities/flota/model/types';
import type { useFlotaDrawer } from '../hooks/useFlotaDrawer';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { TableLoading } from '@shared/components/ui/TableLoading';
import { formatDateShort } from '@shared/utils/date-utils';
import { getDocumentVigenciaMetaByExpirationDate } from '@shared/utils/document-vigencia';
import { buildCodigoInterno } from '@entities/flota/model/constants';

interface FlotaDrawerContentProps {
    drawer: ReturnType<typeof useFlotaDrawer>;
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Box sx={{ textAlign: 'right' }}>{value}</Box>
        </Box>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 0.6, color: 'text.secondary' }}>
            {children}
        </Typography>
    );
}

function DocumentVigenciaChip({ documento }: { documento: FlotaDocumento }) {
    const meta = getDocumentVigenciaMetaByExpirationDate(documento.fechaVencimiento);
    const color = meta.chipColor === 'default' ? 'default' : meta.chipColor;
    return (
        <Chip
            label={meta.label}
            color={color}
            size="small"
            variant={meta.chipColor === 'default' ? 'outlined' : 'filled'}
        />
    );
}

export function FlotaDrawerContent({ drawer }: FlotaDrawerContentProps) {
    const theme = useTheme();
    const { flota, expediente, open, isLoading, isError, refetch } = drawer;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={drawer.closeDrawer}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 520 },
                    maxWidth: '100%',
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none',
                },
            }}
        >
            {flota ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="overline" color="text.secondary">
                                    Expediente de Unidad
                                </Typography>
                                <Typography variant="h6" fontWeight={800} fontFamily="monospace">
                                    {flota.placa}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID)} · {flota.tipoFlotaNavigation?.nombre ?? `Tipo ${flota.tipoFlota}`} · {flota.marca} {flota.modelo}
                                </Typography>
                            </Box>
                            <IconButton onClick={drawer.closeDrawer} size="small">
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                            {flota.viajeActivoCodigo ? (
                                <Chip
                                    icon={<RouteIcon fontSize="small" />}
                                    label={`Viaje ${flota.viajeActivoCodigo}`}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                />
                            ) : null}
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
                        {isLoading ? (
                            <TableLoading message="Cargando expediente..." />
                        ) : isError ? (
                            <FetchErrorState
                                message="No se pudo cargar el expediente de la unidad."
                                onRetry={() => refetch()}
                            />
                        ) : (
                            <Stack spacing={2.5} divider={<Divider />}>
                                <Box>
                                    <SectionTitle>Contexto de Viaje</SectionTitle>
                                    <DataRow
                                        label="Estado"
                                        value={<FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />}
                                    />
                                    <DataRow
                                        label="Viaje activo"
                                        value={flota.viajeActivoCodigo || '—'}
                                    />
                                    <DataRow label="Odómetro" value={flota.odometroActual != null ? `${flota.odometroActual} km` : '—'} />
                                </Box>

                                <Box>
                                    <SectionTitle>Conductor</SectionTitle>
                                    <DataRow
                                        label="Conductor asignado"
                                        value={
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                                <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2" fontWeight={600}>
                                                    {flota.conductorAsignado || 'Sin Conductor'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <DataRow label="Brevete" value="—" />
                                </Box>

                                <Box>
                                    <SectionTitle>Balanza</SectionTitle>
                                    <DataRow label="PBV (Peso Bruto)" value={flota.pesoBruto != null ? `${flota.pesoBruto} kg` : '—'} />
                                    <DataRow label="Tara (Peso Neto)" value={flota.pesoNeto != null ? `${flota.pesoNeto} kg` : '—'} />
                                    <DataRow label="Carga Útil" value={flota.cargaUtil != null ? `${flota.cargaUtil} kg` : '—'} />
                                </Box>

                                <Box>
                                    <SectionTitle>Documentación</SectionTitle>
                                    {expediente && expediente.documentos.length > 0 ? (
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                            {expediente.documentos.map((doc) => (
                                                <Box
                                                    key={doc.flotaDocumentoID}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        p: 1.25,
                                                        borderRadius: 2,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {doc.tipoDocumento?.nombre ?? `Tipo ${doc.tipoDocumentoID}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {doc.numeroDocumento} · vence {formatDateShort(doc.fechaVencimiento)}
                                                        </Typography>
                                                    </Box>
                                                    <DocumentVigenciaChip documento={doc} />
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Sin documentos registrados.
                                        </Typography>
                                    )}
                                </Box>

                                <Box>
                                    <SectionTitle>Últimos Viajes</SectionTitle>
                                    {expediente && expediente.viajes.items.length > 0 ? (
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                            {expediente.viajes.items.slice(0, 5).map((viaje) => (
                                                <Box
                                                    key={viaje.viajeID}
                                                    sx={{
                                                        p: 1.25,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                                                        {viaje.codigo}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {viaje.origenNombre} → {viaje.destinoNombre}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {viaje.conductorNombre || 'Sin conductor'} · {viaje.estadoNombre}
                                                        {viaje.fechaPartida ? ` · ${formatDateShort(viaje.fechaPartida)}` : ''}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Sin viajes registrados.
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        )}
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Tooltip title="Programar Taller">
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<BuildIcon />}
                                onClick={drawer.handleProgramarTaller}
                                size="small"
                            >
                                Programar Taller
                            </Button>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={drawer.handleEdit}
                            size="small"
                        >
                            Editar
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DescriptionIcon />}
                            onClick={drawer.handleVerExpediente}
                            size="small"
                        >
                            Ver Expediente
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <OdometerIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            Seleccione una unidad para ver su expediente.
                        </Typography>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
}
