import { ArrowOutwardRounded, LocalShippingOutlined, RouteOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { MyProfileRecentTripDto } from '@entities/profile/model/types';
import { SectionTitle, TripStat } from './ProfileShared';
import { cardSx, formatDate, tripArrowSx } from './ProfileShared.helpers';

interface ProfileRecentTripsSectionProps {
    viajes: MyProfileRecentTripDto[];
}

export function ProfileRecentTripsSection({ viajes }: ProfileRecentTripsSectionProps) {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const primaryTrip = viajes[0] ?? null;
    const secondaryTrips = viajes.slice(1);

    return (
        <Card sx={cardSx(mode)}>
            <CardContent sx={{ p: 3 }}>
                <SectionTitle
                    icon={<RouteOutlined sx={{ color: 'primary.main', fontSize: 20 }} />}
                    title="Últimos Viajes Realizados"
                />

                {viajes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Sin viajes recientes.
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        {primaryTrip ? (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: mode === 'dark' ? alpha('#ffffff', 0.04) : '#f7f8fa',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '180px minmax(0, 1fr) auto' },
                                        gap: 2,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: 108,
                                            borderRadius: 2.5,
                                            background: mode === 'dark'
                                                ? 'linear-gradient(135deg, #1f2937, #111827)'
                                                : 'linear-gradient(135deg, #1f2937, #4b5563)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            p: 1.25,
                                        }}
                                    >
                                        <LocalShippingOutlined sx={{ position: 'absolute', right: 12, top: 12, color: alpha('#fff', 0.14), fontSize: 34 }} />
                                        <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>
                                            {primaryTrip.codigo}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
                                            {primaryTrip.cliente}
                                        </Typography>
                                        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                                            {primaryTrip.ruta}
                                        </Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mt: 1.5 }}>
                                            <TripStat label="Origen" value={primaryTrip.origen} />
                                            <TripStat label="Destino" value={primaryTrip.destino} />
                                            <TripStat label="Fecha" value={formatDate(primaryTrip.fechaCarga)} />
                                            <TripStat label="Status" value={primaryTrip.estadoNombre} />
                                        </Stack>
                                    </Box>

                                    <IconButton sx={tripArrowSx(mode)}>
                                        <ArrowOutwardRounded />
                                    </IconButton>
                                </Box>
                            </Box>
                        ) : null}

                        {secondaryTrips.length > 0 ? (
                            <Stack spacing={1}>
                                {secondaryTrips.map((trip) => (
                                    <Box
                                        key={trip.viajeId}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2.5,
                                            bgcolor: mode === 'dark' ? alpha('#ffffff', 0.035) : '#fafafa',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 2,
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                                                {trip.codigo}
                                            </Typography>
                                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                                {trip.ruta}
                                            </Typography>
                                        </Box>
                                        <Chip size="small" label={trip.estadoNombre} />
                                    </Box>
                                ))}
                            </Stack>
                        ) : null}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
