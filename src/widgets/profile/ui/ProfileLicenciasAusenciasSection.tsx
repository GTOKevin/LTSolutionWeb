import { CalendarMonthOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { MyProfileAusenciaDto, MyProfileLicenciaDto } from '@entities/profile/model/types';
import { SectionTitle } from './ProfileShared';
import { cardSx, formatDate } from './ProfileShared.helpers';

interface ProfileLicenciasAusenciasSectionProps {
    licencias: MyProfileLicenciaDto[];
    ausencias: MyProfileAusenciaDto[];
    total: number;
}

export function ProfileLicenciasAusenciasSection({ licencias, ausencias, total }: ProfileLicenciasAusenciasSectionProps) {
    const theme = useTheme();
    const mode = theme.palette.mode;

    const latestItems = [
        ...licencias.map(item => ({
            id: `lic-${item.colaboradorLicenciaId}`,
            title: item.tipoLicenciaNombre,
            subtitle: item.descripcion ?? `${formatDate(item.fechaInicial)}${item.fechaFinal ? ` - ${formatDate(item.fechaFinal)}` : ''}`,
            status: item.estado,
            accent: item.estado === 'activa' ? '#005da8' : item.estado === 'programada' ? '#f59e0b' : '#d1d5db',
        })),
        ...ausencias.map(item => ({
            id: `aus-${item.colaboradorPermisoId}`,
            title: item.tipoPermisoNombre,
            subtitle: item.descripcion ?? `${formatDate(item.fechaInicial)} - ${formatDate(item.fechaFinal)}`,
            status: item.activo ? 'activa' : 'inactiva',
            accent: item.activo ? '#005da8' : '#d1d5db',
        })),
    ].slice(0, 4);

    return (
        <Card sx={cardSx(mode)}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <SectionTitle
                        icon={<CalendarMonthOutlined sx={{ color: 'primary.main', fontSize: 20 }} />}
                        title="Licencias y Ausencias"
                        sx={{ mb: 0 }}
                    />
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'primary.main', letterSpacing: '0.12em' }}>
                        {total > 0 ? `${total} REGISTROS` : 'SIN REGISTROS'}
                    </Typography>
                </Stack>

                {latestItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Sin registros.
                    </Typography>
                ) : (
                    <Stack spacing={1.25}>
                        {latestItems.map((item) => (
                            <Box
                                key={item.id}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: mode === 'dark' ? alpha('#ffffff', 0.04) : '#f7f8fa',
                                    borderLeft: `4px solid ${item.accent}`,
                                }}
                            >
                                <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                            {item.subtitle}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        size="small"
                                        label={item.status}
                                        sx={{
                                            textTransform: 'uppercase',
                                            fontWeight: 800,
                                            bgcolor: alpha(item.accent, 0.12),
                                            color: item.accent,
                                        }}
                                    />
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
