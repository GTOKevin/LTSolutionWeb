import { Alert, alpha, Box, Button, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    ErrorOutline as ErrorOutlineIcon,
    WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { DashboardOverview } from '@entities/dashboard/model/types';
import { formatCurrency } from '@shared/utils/format-utils';
import { formatDateShort, formatDateTime } from '@shared/utils/date-utils';
import { getNotificationTone, getTripStatusTone, normalizeDashboardActionUrl } from '@features/dashboard/lib/dashboard-helpers';
import { dashboardCardSx, notificationIconSx, tableHeaderCellSx, tripStatusChipSx } from '../lib/dashboard-styles';
import { TrendBadge } from './DashboardShared';

interface DashboardBottomSectionProps {
    data: DashboardOverview;
    canViewViajes: boolean;
}

export function DashboardBottomSection({ data, canViewViajes }: DashboardBottomSectionProps) {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 2fr) minmax(320px, 1fr)' },
                gap: 2,
            }}
        >
            <Card sx={dashboardCardSx(theme)}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                Viajes Recientes
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Últimos {data.viajesRecientes.length} registros cargados.
                            </Typography>
                        </Box>
                        {canViewViajes && (
                            <Button size="small" onClick={() => navigate('/app/viajes')}>
                                Ver todos
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderCellSx(theme)}>Código</TableCell>
                                    <TableCell sx={tableHeaderCellSx(theme)}>Cliente</TableCell>
                                    <TableCell sx={tableHeaderCellSx(theme)}>Ruta</TableCell>
                                    <TableCell sx={tableHeaderCellSx(theme)}>Fecha</TableCell>
                                    <TableCell sx={tableHeaderCellSx(theme)}>Estado</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.viajesRecientes.map(item => {
                                    const tone = getTripStatusTone(item);
                                    return (
                                        <TableRow key={item.viajeID} hover>
                                            <TableCell>
                                                <Typography fontWeight={700} color="primary.main">
                                                    {item.codigo}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.tractoPlaca}{item.carretaPlaca ? ` • ${item.carretaPlaca}` : ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{item.cliente}</TableCell>
                                            <TableCell>{item.ruta || `${item.origen} -> ${item.destino}`}</TableCell>
                                            <TableCell>{formatDateShort(item.fechaCarga)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.estadoNombre}
                                                    size="small"
                                                    sx={tripStatusChipSx(theme, tone)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ display: 'grid', gap: 2 }}>
                <Card sx={{ ...dashboardCardSx(theme), maxHeight: '515px', overflowY: 'auto' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 2.5,
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: alpha(theme.palette.error.main, 0.12),
                                    color: theme.palette.error.main,
                                }}
                            >
                                <ErrorOutlineIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Notificaciones de Seguridad
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Alertas recientes de operación y cumplimiento.
                                </Typography>
                            </Box>
                        </Box>

                        <Stack spacing={1.25}>
                            {data.notificacionesSeguridad.length > 0 ? data.notificacionesSeguridad.map(notification => {
                                const tone = getNotificationTone(notification);
                                const actionUrl = normalizeDashboardActionUrl(notification.urlAccion);

                                return (
                                    <Box
                                        key={notification.notificacionID}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            bgcolor: alpha(theme.palette.text.primary, 0.025),
                                            border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                            <Box sx={notificationIconSx(theme, tone)}>
                                                {tone === 'info' ? <ErrorOutlineIcon fontSize="small" /> : <WarningAmberIcon fontSize="small" />}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                                                    {notification.titulo}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {notification.mensaje}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDateTime(notification.fechaRegistro)}
                                                    </Typography>
                                                    {actionUrl && (
                                                        <Button
                                                            size="small"
                                                            endIcon={<ArrowForwardIcon />}
                                                            onClick={() => navigate(actionUrl)}
                                                            sx={{ minWidth: 0, p: 0, fontSize: '0.75rem' }}
                                                        >
                                                            Ver detalle
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Box>
                                );
                            }) : (
                                <Alert severity="success" sx={{ borderRadius: 3 }}>
                                    No hay alertas críticas registradas en este momento.
                                </Alert>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <Card sx={dashboardCardSx(theme)}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Facturación por Moneda
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Distribución mensual y tendencia por símbolo monetario.
                        </Typography>

                        <Stack spacing={1.5}>
                            {data.facturacionMensual.length > 0 ? data.facturacionMensual.map(item => (
                                <Box
                                    key={item.monedaID}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.simbolo} · Mes actual
                                            </Typography>
                                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                                {formatCurrency(item.totalFacturado, item.simbolo)}
                                            </Typography>
                                        </Box>
                                        <TrendBadge value={item.variacionVsMesAnteriorPct} compact />
                                    </Stack>
                                </Box>
                            )) : (
                                <Alert severity="info" sx={{ borderRadius: 3 }}>
                                    Aún no hay facturación registrada para el periodo consultado.
                                </Alert>
                            )}
                        </Stack>

                        {data.estadoFacturacion.totalesPorMoneda.length > 0 && (
                            <Box sx={{ mt: 2.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Totales de cobranza
                                </Typography>
                                <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                                    {data.estadoFacturacion.totalesPorMoneda.map(item => (
                                        <Box key={item.monedaID} sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 1, alignItems: 'center' }}>
                                            <Typography fontWeight={700}>{item.simbolo}</Typography>
                                            <Typography variant="caption" color="success.main">
                                                Pagado {formatCurrency(item.pagadoMonto, item.simbolo)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                                                Pend. {formatCurrency(item.pendienteMonto, item.simbolo)}
                                            </Typography>
                                            <Typography variant="caption" color="error.main">
                                                Venc. {formatCurrency(item.vencidoMonto, item.simbolo)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
