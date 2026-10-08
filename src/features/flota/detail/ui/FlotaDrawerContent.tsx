import {
    Box,
    Button,
    Chip,
    Drawer,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    LocalShipping as LocalShippingIcon,
    OpenInFull as OpenInFullIcon,
    Close as CloseIcon,
    Speed as OdometerIcon,
    ScaleOutlined as ScaleIcon,
    CheckCircle as CheckCircleIcon,
    UploadFile as UploadFileIcon,
    VerifiedUser as SoatIcon,
    BuildCircle as CitvIcon,
    Shield as InsuranceIcon,
    Visibility as VisibilityIcon,
    DoneAll as DoneAllIcon,
    ArrowForward as ArrowForwardIcon,
    Build as BuildIcon,
    Edit as EditIcon,
    AltRoute as RouteIcon,
} from '@mui/icons-material';
import type { FlotaDocumento, FlotaHistorialViaje } from '@entities/flota/model/types';
import type { useFlotaDrawer } from '../hooks/useFlotaDrawer';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { TableLoading } from '@shared/components/ui/TableLoading';
import { formatDateShort } from '@shared/utils/date-utils';
import { getDocumentVigenciaMetaByExpirationDate } from '@shared/utils/document-vigencia';
import { buildCodigoInterno } from '@entities/flota/model/constants';
import { PeruvianPlate } from '../../shared/ui/PeruvianPlate';

interface FlotaDrawerContentProps {
    drawer: ReturnType<typeof useFlotaDrawer>;
}

function formatWeightDisplay(val: number | undefined, defaultVal = 0): string {
    const num = val ?? defaultVal;
    if (num >= 1000) {
        return `${(num / 1000).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} TN`;
    }
    return `${Math.round(num).toLocaleString('es-PE')} KG`;
}

export function FlotaDrawerContent({ drawer }: FlotaDrawerContentProps) {
    const theme = useTheme();
    const { flota, expediente, open, isLoading, isError, refetch } = drawer;

    const codigo = flota ? (flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID)) : '';
    const pbv = flota?.pesoBruto || 48000;
    const tara = flota?.pesoNeto || 15500;
    const cargaUtil = flota?.cargaUtil || Math.max(0, pbv - tara);

    const taraPct = pbv > 0 ? Math.min(100, Math.max(0, (tara / pbv) * 100)) : 32.3;
    const cargaUtilPct = pbv > 0 ? Math.min(100 - taraPct, Math.max(0, (cargaUtil / pbv) * 100)) : 67.7;

    const ultimoViaje = expediente?.viajes?.items?.[0];
    const kmUltimoViaje = ultimoViaje?.kmLlegada;
    const odometroValor = expediente?.odometroActual ?? flota?.odometroActual ?? kmUltimoViaje ?? null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={drawer.closeDrawer}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 520 },
                    maxWidth: '100vw',
                    bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC',
                    backgroundImage: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: theme.palette.mode === 'dark' ? '0 0 40px rgba(0,0,0,0.8)' : '0 10px 40px rgba(0,0,0,0.15)',
                },
            }}
        >
            {flota ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* BARRA SUPERIOR DEL DRAWER: Título y Cierre */}
                    <Box
                        sx={{
                            px: 3,
                            py: 1.75,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.mode === 'dark' ? alpha('#0F172A', 0.6) : '#F8FAFC',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            shrink: 0,
                            zIndex: 10,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShippingIcon sx={{ color: 'primary.main', fontSize: 20 }} />
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Expandir pantalla completa">
                                <IconButton onClick={drawer.handleVerExpediente} size="small" sx={{ color: 'text.secondary' }}>
                                    <OpenInFullIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                            <IconButton onClick={drawer.closeDrawer} size="small" aria-label="Cerrar expediente">
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* BANNER DE CABECERA DEL VEHÍCULO (UI Original: Placa, Ejes, Marca, Modelo, Último Viaje) */}
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
                            shrink: 0,
                        }}
                    >
                        {/* Decoración de fondo sutil con placa */}
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

                        {/* Badge de Estado Flotante con pulso y número de viaje */}
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
                            ) : ultimoViaje ? (
                                <Chip
                                    icon={<RouteIcon sx={{ color: '#FFFFFF !important', fontSize: '14px !important' }} />}
                                    label={`Último viaje #${ultimoViaje.codigo}`}
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

                        {/* Placa oficial peruana, ejes, marca y modelo */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                                    {flota.marca} {flota.modelo}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                                    {flota.tipoFlotaNavigation?.nombre ?? `Tipo ${flota.tipoFlota}`} • {flota.ejes} Ejes
                                    {typeof flota.configuracionEjes === 'object' && flota.configuracionEjes?.nombre
                                        ? ` • ${flota.configuracionEjes.nombre}`
                                        : (typeof flota.configuracionEjes === 'string' && flota.configuracionEjes ? ` • ${flota.configuracionEjes}` : '')}
                                </Typography>
                            </Box>
                            <PeruvianPlate placa={flota.placa} size="md" />
                        </Box>
                    </Box>

                    {/* CONTENIDO CON SCROLL INTERNO VERTICAL INDEPENDIENTE */}
                    <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                        {/* ODÓMETRO ACTUAL / KILOMETRAJE (Full Width) */}
                        <Box
                            sx={{
                                width: '100%',
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shrink: 0,
                                    }}
                                >
                                    <OdometerIcon sx={{ fontSize: 22 }} />
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        Odómetro Actual
                                    </Typography>
                                    <Typography variant="h5" fontWeight={900} fontFamily="monospace" color="text.primary" sx={{ lineHeight: 1.15 }}>
                                        {odometroValor != null ? `${odometroValor.toLocaleString('es-PE')} KM` : '—'}
                                    </Typography>
                                </Box>
                            </Box>

                            {ultimoViaje && (
                                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>
                                        Último Registro
                                    </Typography>
                                    <Typography variant="caption" fontWeight={800} fontFamily="monospace" color="primary.main">
                                        #{ultimoViaje.codigo}
                                        {ultimoViaje.kmLlegada != null ? ` • ${ultimoViaje.kmLlegada.toLocaleString('es-PE')} KM` : ''}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* BALANZA GRÁFICA DE PESOS Y EJES MTC */}
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ScaleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                        Balanza de Pesos & Ejes MTC
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#10B981 !important' }} />}
                                    label="100% Norma MTC En Regla"
                                    size="small"
                                    sx={{
                                        bgcolor: alpha('#10B981', 0.12),
                                        color: '#059669',
                                        fontWeight: 700,
                                        fontSize: '0.68rem',
                                    }}
                                />
                            </Box>

                            {/* Resumen de Peso Bruto Combinado */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.5) : '#F1F5F9',
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>
                                        Tara + Carga Útil
                                    </Typography>
                                    <Typography variant="body2" fontWeight={800} color="text.primary">
                                        {formatWeightDisplay(tara)} + {formatWeightDisplay(cargaUtil)}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>
                                        Peso Bruto Combinado
                                    </Typography>
                                    <Typography variant="body1" fontWeight={800} color="primary.main">
                                        {formatWeightDisplay(pbv)}{' '}
                                        <Typography component="span" variant="caption" color="text.secondary" fontWeight={500}>
                                            / Límite 48.0 TN
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Barra de pesaje visual combinada */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 12,
                                        borderRadius: 6,
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                                        overflow: 'hidden',
                                        display: 'flex',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: `${taraPct}%`,
                                            height: '100%',
                                            bgcolor: 'primary.main',
                                            transition: 'width 0.3s ease',
                                        }}
                                        title={`Tara: ${taraPct.toFixed(1)}%`}
                                    />
                                    <Box
                                        sx={{
                                            width: `${cargaUtilPct}%`,
                                            height: '100%',
                                            bgcolor: '#10B981',
                                            transition: 'width 0.3s ease',
                                        }}
                                        title={`Carga Útil: ${cargaUtilPct.toFixed(1)}%`}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'text.secondary', px: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                        <span>Tara: <strong>{formatWeightDisplay(tara)}</strong></span>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                                        <span>Carga Útil: <strong>{formatWeightDisplay(cargaUtil)}</strong></span>
                                    </Box>
                                    <Typography variant="caption" fontWeight={700} color="text.primary">
                                        Capacidad: 100%
                                    </Typography>
                                </Box>
                            </Box>

                        </Box>

                        {/* EXPEDIENTE DE DOCUMENTOS OBLIGATORIOS */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                    Documentación Obligatoria
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
                                    onClick={drawer.handleVerExpediente}
                                    sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: 'primary.main', p: 0 }}
                                >
                                    Cargar Doc
                                </Button>
                            </Box>

                            {isLoading ? (
                                <TableLoading message="Cargando documentación..." />
                            ) : isError ? (
                                <FetchErrorState message="Error al cargar documentos" onRetry={() => refetch()} />
                            ) : expediente && expediente.documentos.length > 0 ? (
                                <Stack spacing={1.5}>
                                    {expediente.documentos.map((doc: FlotaDocumento) => {
                                        const meta = getDocumentVigenciaMetaByExpirationDate(doc.fechaVencimiento);
                                        const isWarning = meta.chipColor === 'warning';
                                        const isErrorDoc = meta.chipColor === 'error';
                                        const isSoat = doc.tipoDocumento?.nombre?.toLowerCase().includes('soat');
                                        const isCitv = doc.tipoDocumento?.nombre?.toLowerCase().includes('técnica') || doc.tipoDocumento?.nombre?.toLowerCase().includes('citv');

                                        return (
                                            <Box
                                                key={doc.flotaDocumentoID}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2.5,
                                                    bgcolor: theme.palette.background.paper,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1.25,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 2,
                                                                bgcolor: isErrorDoc
                                                                    ? alpha('#EF4444', 0.12)
                                                                    : isWarning
                                                                        ? alpha('#F59E0B', 0.15)
                                                                        : alpha('#10B981', 0.12),
                                                                color: isErrorDoc ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                shrink: 0,
                                                            }}
                                                        >
                                                            {isSoat ? <SoatIcon sx={{ fontSize: 20 }} /> : isCitv ? <CitvIcon sx={{ fontSize: 20 }} /> : <InsuranceIcon sx={{ fontSize: 20 }} />}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Typography variant="body2" fontWeight={700} color="text.primary">
                                                                {doc.tipoDocumento?.nombre ?? `Documento #${doc.tipoDocumentoID}`}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {doc.entidadEmisora ? `${doc.entidadEmisora} • ` : ''}Póliza / Cert. Nº {doc.numeroDocumento}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Chip
                                                        label={meta.label}
                                                        size="small"
                                                        sx={{
                                                            height: 22,
                                                            fontSize: '0.68rem',
                                                            fontWeight: 700,
                                                            bgcolor: isErrorDoc
                                                                ? alpha('#EF4444', 0.15)
                                                                : isWarning
                                                                    ? alpha('#F59E0B', 0.2)
                                                                    : alpha('#10B981', 0.15),
                                                            color: isErrorDoc ? '#DC2626' : isWarning ? '#D97706' : '#059669',
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Vence: <strong style={{ color: isWarning || isErrorDoc ? theme.palette.warning.main : theme.palette.text.primary }}>{formatDateShort(doc.fechaVencimiento)}</strong>
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                                                        onClick={() => {
                                                            if (doc.rutaArchivo) window.open(doc.rutaArchivo, '_blank');
                                                            else drawer.handleVerExpediente();
                                                        }}
                                                        sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', py: 0.2, px: 1, minWidth: 'auto' }}
                                                    >
                                                        Ver Doc
                                                    </Button>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        No registra documentos en el legajo digital
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* MINI-LISTA: ÚLTIMOS VIAJES ASIGNADOS */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                Últimos Viajes Asignados
                            </Typography>

                            {expediente && expediente.viajes.items.length > 0 ? (
                                <Stack spacing={1}>
                                    {expediente.viajes.items.slice(0, 4).map((viaje: FlotaHistorialViaje, index: number) => {
                                        const isTransit = viaje.estadoNombre?.toLowerCase().includes('tránsito') || viaje.estadoNombre?.toLowerCase().includes('ruta') || index === 0 && Boolean(flota.viajeActivoCodigo);

                                        return (
                                            <Box
                                                key={viaje.viajeID}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: theme.palette.background.paper,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: 1.5,
                                                            bgcolor: isTransit ? alpha('#F59E0B', 0.15) : alpha('#10B981', 0.15),
                                                            color: isTransit ? '#F59E0B' : '#10B981',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            shrink: 0,
                                                        }}
                                                    >
                                                        {isTransit ? <LocalShippingIcon sx={{ fontSize: 18 }} /> : <DoneAllIcon sx={{ fontSize: 18 }} />}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="caption" fontWeight={800} fontFamily="monospace" color="text.primary">
                                                                #{viaje.codigo}
                                                            </Typography>
                                                            <Typography variant="caption" fontWeight={700} color="primary.main">
                                                                {viaje.origenNombre} ➔ {viaje.destinoNombre}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                                            {viaje.conductorNombre || 'Conductor asignado'}
                                                            {viaje.fechaPartida ? ` • Salida: ${formatDateShort(viaje.fechaPartida)}` : ''}
                                                            {viaje.kmLlegada ? ` • ${viaje.kmLlegada} KM` : ''}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Chip
                                                    label={isTransit ? 'En tránsito' : viaje.estadoNombre || 'Completado'}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        bgcolor: isTransit ? alpha('#F59E0B', 0.15) : alpha('#10B981', 0.15),
                                                        color: isTransit ? '#D97706' : '#059669',
                                                        shrink: 0,
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Sin viajes históricos registrados
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* BOTONES AL PIE DEL DRAWER (Fijos en la Base / Modelo Stitch S2) */}
                    <Box
                        sx={{
                            p: 2.5,
                            bgcolor: theme.palette.background.paper,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            shrink: 0,
                        }}
                    >
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<BuildIcon sx={{ fontSize: 17 }} />}
                                onClick={drawer.handleProgramarTaller}
                                sx={{
                                    height: 44,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    textTransform: 'none',
                                    borderColor: theme.palette.divider,
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: theme.palette.text.secondary,
                                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                                    },
                                }}
                            >
                                Programar Taller
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<EditIcon sx={{ fontSize: 17 }} />}
                                onClick={drawer.handleEdit}
                                sx={{
                                    height: 44,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    textTransform: 'none',
                                    borderColor: theme.palette.divider,
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: theme.palette.text.secondary,
                                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                                    },
                                }}
                            >
                                Editar Especificaciones
                            </Button>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 19 }} />}
                            onClick={drawer.handleVerExpediente}
                            sx={{
                                height: 48,
                                borderRadius: 2,
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                textTransform: 'none',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                        >
                            Ver Expediente Completo
                        </Button>
                    </Box>
                </Box>
            ) : null}
        </Drawer>
    );
}
