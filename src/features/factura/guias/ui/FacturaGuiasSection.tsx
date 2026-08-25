import { useQuery } from '@tanstack/react-query';
import { DescriptionOutlined as DescriptionOutlinedIcon } from '@mui/icons-material';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { FacturaGuia } from '@/entities/factura/model/types';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { buildInternalFileUrl } from '@shared/config/env';
import { DocumentAttachmentCard } from '@shared/components/ui/DocumentAttachmentCard';

interface FacturaGuiasSectionProps {
    facturaId: number;
}

export function FacturaGuiasSection({ facturaId }: FacturaGuiasSectionProps) {
    const theme = useTheme();

    const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['factura-guias', facturaId],
        queryFn: () => facturaApi.getGuias(facturaId),
        enabled: !!facturaId,
    });

    const guias = data ?? [];
    const groupedByViaje = guias.reduce<Record<string, FacturaGuia[]>>((acc, guia) => {
        const key = guia.codigoViaje || 'Sin viaje';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(guia);
        return acc;
    }, {});

    return (
        <Stack spacing={2}>
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <DescriptionOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" fontWeight={800}>
                        Guías de los viajes de la factura
                    </Typography>
                    <Chip
                        label={`${guias.length} ${guias.length === 1 ? 'guía' : 'guías'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    Guías de remisión de los viajes anexados a esta factura.
                </Typography>
            </Box>

            {isError ? (
                <Alert
                    severity="error"
                    action={(
                        <Button color="inherit" size="small" onClick={() => void refetch()} disabled={isFetching}>
                            Reintentar
                        </Button>
                    )}
                    sx={{ borderRadius: 2 }}
                >
                    {getErrorMessage(error, 'No se pudieron cargar las guías de los viajes de la factura.')}
                </Alert>
            ) : isLoading ? (
                <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                </Paper>
            ) : guias.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                    <DescriptionOutlinedIcon color="disabled" sx={{ fontSize: 36, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No hay guías registradas para los viajes de esta factura.
                    </Typography>
                </Paper>
            ) : (
                Object.entries(groupedByViaje).map(([codigoViaje, viajeGuias]) => (
                    <Paper
                        key={codigoViaje}
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.default, 0.4),
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                            <Chip
                                label={codigoViaje}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {viajeGuias.length} {viajeGuias.length === 1 ? 'guía' : 'guías'}
                            </Typography>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
                            {viajeGuias.map((item) => {
                                const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                                const tipo = item.tipoGuiaDescripcion || 'Guía';

                                return (
                                    <Paper
                                        key={item.viajeGuiaID}
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                                            flex: { md: '0 1 calc(50% - 8px)' },
                                        }}
                                    >
                                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                                            <Box>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                                                    <Chip label={tipo} size="small" color="info" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                                </Stack>
                                                <Typography variant="subtitle2" fontWeight={800}>
                                                    {item.serie} - {item.numero}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Guía de remisión adjunta al viaje
                                                </Typography>
                                            </Box>

                                            {archivoUrl ? (
                                                <DocumentAttachmentCard
                                                    title={`Guía ${item.serie} - ${item.numero}`}
                                                    fileUrl={archivoUrl}
                                                    downloadUrl={archivoUrl}
                                                    fileName={`Guia_${item.serie}-${item.numero}`}
                                                />
                                            ) : (
                                                <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center' }}>
                                                    Sin archivo adjunto
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </Paper>
                ))
            )}
        </Stack>
    );
}