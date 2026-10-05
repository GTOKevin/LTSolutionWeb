import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    Build as BuildIcon,
    Edit as EditIcon,
    OpenInNew as OpenInNewIcon,
    Speed as OdometerIcon,
    Person as PersonIcon,
    AltRoute as RouteIcon,
    ArrowForward as ArrowForwardIcon,
    AssignmentInd as LicenseIcon,
} from '@mui/icons-material';
import type { FlotaDocumento } from '@entities/flota/model/types';
import type { useFlotaDrawer } from '../hooks/useFlotaDrawer';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { TableLoading } from '@shared/components/ui/TableLoading';
import { formatDateShort } from '@shared/utils/date-utils';
import { getDocumentVigenciaMetaByExpirationDate } from '@shared/utils/document-vigencia';
import { buildCodigoInterno } from '@entities/flota/model/constants';
import { PeruvianPlate } from '../../shared/ui/PeruvianPlate';
import { FlotaBalanzaBar } from '../../shared/ui/FlotaBalanzaBar';

interface FlotaDrawerContentProps {
    drawer: ReturnType<typeof useFlotaDrawer>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            variant="caption"
            sx={{
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                display: 'block',
                mb: 1.25,
            }}
        >
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
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
        />
    );
}

export function FlotaDrawerContent({ drawer }: FlotaDrawerContentProps) {
    const theme = useTheme();
    const { flota, expediente, open, isLoading, isError, refetch } = drawer;

    const codigo = flota ? (flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID)) : '';

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
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {flota ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Barra Superior del Drawer: Título y Cierre */}
                    <Box
                        sx={{
                            px: 3,
                            py: 1.75,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.mode === 'dark' ? alpha('#0F172A', 0.6) : '#F8FAFC',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.05em' }}>
                                FICHA 360° DE UNIDAD
                            </Typography>
                            <Chip
                                label={codigo}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                }}
                            />
                        </Box>
                        <IconButton onClick={drawer.closeDrawer} size="small" aria-label="Cerrar expediente">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Banner de Cabecera del Vehículo (Estilo Stitch S2) */}
                    <Box
                        sx={{
                            position: 'relative',
                            p: 3,
                            pb: 2.5,
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
                                : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                            color: '#FFFFFF',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Decoración de fondo sutil */}
                        <Box
                            sx={{
                                position: 'absolute',
                                right: -20,
                                bottom: -20,
                                opacity: 0.08,
                                transform: 'rotate(-10deg)',
                                pointerEvents: 'none',
                            }}
                        >
                            <Typography sx={{ fontSize: '10rem', fontWeight: 900, fontFamily: 'monospace' }}>
                                {flota.placa.slice(0, 3)}
                            </Typography>
                        </Box>

                        {/* Badge de Estado Flotante con pulso */}
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                            {flota.viajeActivoCodigo ? (
                                <Chip
                                    icon={<RouteIcon sx={{ color: '#FFFFFF !important', fontSize: '14px !important' }} />}
                                    label={`Viaje activo #${flota.viajeActivoCodigo}`}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                                        color: '#FFFFFF',
                                        backdropFilter: 'blur(4px)',
                                    }}
                                />
                            ) : null}
                        </Box>

                        {/* Placa oficial peruana y modelo */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                                    {flota.marca} {flota.modelo}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                                    {flota.tipoFlotaNavigation?.nombre ?? `Tipo ${flota.tipoFlota}`} • {flota.ejes} Ejes
                                    {flota.configuracionEjes?.nombre ? ` • ${flota.configuracionEjes.nombre}` : ''}
                                </Typography>
                            </Box>
                            <PeruvianPlate placa={flota.placa} size="md" />
                        </Box>
                    </Box>

                    {/* Botones de acción rápida superiores */}
                    <Box
                        sx={{
                            px: 3,
                            py: 1.25,
                            bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.5) : '#F1F5F9',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            color="warning"
                            startIcon={<BuildIcon sx={{ fontSize: '16px !important' }} />}
                            onClick={drawer.handleProgramarTaller}
                            sx={{ flex: 1, fontWeight: 700, fontSize: '0.75rem' }}
                        >
                            Taller
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="inherit"
                            startIcon={<EditIcon sx={{ fontSize: '16px !important' }} />}
                            onClick={drawer.handleEdit}
                            sx={{ flex: 1, fontWeight: 700, fontSize: '0.75rem' }}
                        >
                            Editar
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            endIcon={<OpenInNewIcon sx={{ fontSize: '16px !important' }} />}
                            onClick={drawer.handleVerExpediente}
                            sx={{ flex: 1.3, fontWeight: 700, fontSize: '0.75rem' }}
                        >
                            Expediente 360°
                        </Button>
                    </Box>

                    {/* Contenido con scroll independiente */}
                    <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
                        {isLoading ? (
                            <TableLoading message="Cargando expediente..." />
                        ) : isError ? (
                            <FetchErrorState
                                message="No se pudo cargar el expediente de la unidad."
                                onRetry={() => refetch()}
                            />
                        ) : (
                            <Stack spacing={2.5}>
                                {/* Contexto de Viaje y Odómetro */}
                                <Box>
                                    <SectionTitle>Operación y Recorrido</SectionTitle>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2.5,
                                            border: `1px solid ${theme.palette.divider}`,
                                            bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.3) : '#F8FAFC',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.5,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <OdometerIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Odómetro Actual
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" fontWeight={800} fontFamily="monospace">
                                                {flota.odometroActual != null ? `${flota.odometroActual.toLocaleString('es-PE')} km` : '—'}
                                            </Typography>
                                        </Box>

                                        {flota.viajeActivoCodigo ? (
                                            <>
                                                <Divider />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <RouteIcon sx={{ color: 'info.main', fontSize: 18 }} />
                                                        <Typography variant="body2" fontWeight={600} color="info.main">
                                                            Despacho Activo
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`#${flota.viajeActivoCodigo}`}
                                                        size="small"
                                                        color="info"
                                                        sx={{ fontWeight: 800, fontFamily: 'monospace' }}
                                                    />
                                                </Box>
                                            </>
                                        ) : null}
                                    </Box>
                                </Box>

                                {/* Conductor Titular */}
                                <Box>
                                    <SectionTitle>Conductor Asignado</SectionTitle>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2.5,
                                            border: `1px solid ${theme.palette.divider}`,
                                            bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.3) : '#F8FAFC',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: '50%',
                                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <PersonIcon fontSize="medium" />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" fontWeight={700}>
                                                {flota.conductorAsignado || 'Sin Conductor Titular Asignado'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                                <LicenseIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {flota.conductorAsignado ? 'Brevete Profesional • Licencia Vigente' : 'Disponible para asignación de viaje'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Balanza de Pesos con la barra interactiva */}
                                <Box>
                                    <SectionTitle>Capacidad de Balanza & Flete</SectionTitle>
                                    <FlotaBalanzaBar
                                        pesoBruto={flota.pesoBruto}
                                        pesoNeto={flota.pesoNeto}
                                        cargaUtil={flota.cargaUtil}
                                        mode="detailed"
                                    />
                                </Box>

                                {/* Documentación Obligatoria & Semáforo */}
                                <Box>
                                    <SectionTitle>Legajo Documental & Pólizas</SectionTitle>
                                    {expediente && expediente.documentos.length > 0 ? (
                                        <Stack spacing={1}>
                                            {expediente.documentos.map((doc) => (
                                                <Box
                                                    key={doc.flotaDocumentoID}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.2) : '#FFFFFF',
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {doc.tipoDocumento?.nombre ?? `Tipo ${doc.tipoDocumentoID}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Nº {doc.numeroDocumento} {doc.entidadEmisora ? `• ${doc.entidadEmisora}` : ''}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Vence: {formatDateShort(doc.fechaVencimiento)}
                                                        </Typography>
                                                    </Box>
                                                    <DocumentVigenciaChip documento={doc} />
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.divider, 0.2), borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                No registra documentos en el legajo digital
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Historial de Despachos Recientes */}
                                <Box>
                                    <SectionTitle>Últimos Despachos Asignados</SectionTitle>
                                    {expediente && expediente.viajes.items.length > 0 ? (
                                        <Stack spacing={1}>
                                            {expediente.viajes.items.slice(0, 4).map((viaje) => (
                                                <Box
                                                    key={viaje.viajeID}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.2) : '#FFFFFF',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                        <Typography variant="caption" fontWeight={800} fontFamily="monospace" color="primary.main">
                                                            {viaje.codigo}
                                                        </Typography>
                                                        <Chip
                                                            label={viaje.estadoNombre}
                                                            size="small"
                                                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, my: 0.5 }}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {viaje.origenNombre}
                                                        </Typography>
                                                        <ArrowForwardIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {viaje.destinoNombre}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {viaje.conductorNombre || 'Sin conductor'}
                                                        {viaje.fechaPartida ? ` • Partida: ${formatDateShort(viaje.fechaPartida)}` : ''}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.divider, 0.2), borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Sin despachos históricos registrados
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Stack>
                        )}
                    </Box>
                </Box>
            ) : null}
        </Drawer>
    );
}
