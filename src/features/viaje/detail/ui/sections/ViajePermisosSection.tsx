import { AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon } from '@mui/icons-material';
import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { buildInternalFileUrl } from '@shared/config/env';
import { formatDateShort } from '@/shared/utils/date-utils';
import type { ViajeDetail } from '@/entities/viaje/model/types';
import { resolveViajePermisoStatus } from '@entities/viaje/model/permiso-status';
import { DocumentAttachmentCard } from '@shared/components/ui/DocumentAttachmentCard';

interface ViajePermisosSectionProps {
    viaje: ViajeDetail;
}

const STATUS_TONE: Record<string, 'success' | 'warning' | 'error'> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
};

export function ViajePermisosSection({ viaje }: ViajePermisosSectionProps) {
    const theme = useTheme();
    const permisos = viaje.permisos ?? [];

    return (
        <Stack spacing={2}>
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <AssignmentTurnedInOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" fontWeight={800}>
                        Permisos del Viaje
                    </Typography>
                    <Chip
                        label={`${permisos.length} ${permisos.length === 1 ? 'permiso' : 'permisos'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    Permisos generados para este viaje con su documento adjunto.
                </Typography>
            </Box>

            {permisos.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                    <AssignmentTurnedInOutlinedIcon color="disabled" sx={{ fontSize: 36, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No hay permisos registrados para este viaje.
                    </Typography>
                </Paper>
            ) : (
                permisos.map((item) => {
                    const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                    const status = resolveViajePermisoStatus(item.fechaVencimiento);

                    return (
                        <Paper
                            key={item.viajePermisoID}
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.default, 0.4),
                            }}
                        >
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                                <Box>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                                        <Chip
                                            label={status.label}
                                            size="small"
                                            color={STATUS_TONE[status.color] ?? 'default'}
                                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                        />
                                    </Stack>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        Permiso #{item.viajePermisoID}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Vigencia: {formatDateShort(item.fechaVigencia)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Vencimiento: {item.fechaVencimiento ? formatDateShort(item.fechaVencimiento) : 'Sin vencimiento'}
                                    </Typography>
                                </Box>

                                <DocumentAttachmentCard
                                    title={`Permiso ${item.viajePermisoID}`}
                                    fileUrl={archivoUrl}
                                    downloadUrl={archivoUrl}
                                    fileName={`Permiso_${item.viajePermisoID}`}
                                />
                            </Stack>
                        </Paper>
                    );
                })
            )}
        </Stack>
    );
}
