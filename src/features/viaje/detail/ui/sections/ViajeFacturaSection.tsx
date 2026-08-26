import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    ReceiptLongOutlined as ReceiptLongOutlinedIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import { buildInternalFileUrl } from '@shared/config/env';
import { DocumentAttachmentCard } from '@shared/components/ui/DocumentAttachmentCard';
import { buildAppViewPath, APP_PATHS } from '@shared/config/app-routes';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';

interface ViajeFacturaSectionProps {
    viajeId: number;
}

export function ViajeFacturaSection({ viajeId }: ViajeFacturaSectionProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const canViewFacturas = usePermission(PERMISSIONS.FACTURAS.VER);

    const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['viaje-facturas', viajeId],
        queryFn: () => viajeApi.getFacturas(viajeId),
        enabled: !!viajeId,
    });

    const facturas = data ?? [];

    return (
        <Stack spacing={2}>
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <ReceiptLongOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" fontWeight={800}>
                        Factura del Viaje
                    </Typography>
                    <Chip
                        label={`${facturas.length} ${facturas.length === 1 ? 'factura' : 'facturas'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    Factura(s) generada(s) para este viaje.
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
                    {getErrorMessage(error, 'No se pudieron cargar las facturas del viaje.')}
                </Alert>
            ) : isLoading ? (
                <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                </Paper>
            ) : facturas.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                    <ReceiptLongOutlinedIcon color="disabled" sx={{ fontSize: 36, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No hay facturas registradas para este viaje.
                    </Typography>
                </Paper>
            ) : (
                facturas.map((item) => (
                    <Paper
                        key={item.facturaID}
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
                                    <Chip label={item.estadoNombre || 'Sin estado'} size="small" color="info" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                </Stack>
                                <Typography variant="subtitle2" fontWeight={800}>
                                    {item.serie} - {item.numero}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Emisión: {formatDateShort(item.fechaEmision)}
                                </Typography>
                                <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                                    {formatCurrencyAmount(item.total, item.moneda)}
                                </Typography>
                            </Box>

                            {canViewFacturas && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<OpenInNewIcon />}
                                    onClick={() => navigate(buildAppViewPath(APP_PATHS.facturas, item.facturaID))}
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, alignSelf: { xs: 'flex-start', md: 'center' } }}
                                >
                                    Abrir factura
                                </Button>
                            )}
                        </Stack>

                        {canViewFacturas && item.documentos && item.documentos.length > 0 ? (
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                flexWrap="wrap"
                                sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}
                            >
                                {item.documentos.map((doc) => {
                                    const fileUrl = buildInternalFileUrl(doc.rutaArchivo);
                                    const fileName = doc.descripcion?.trim() || `Factura_${item.serie}-${item.numero}`;

                                    return (
                                        <DocumentAttachmentCard
                                            key={doc.facturaDocumentoID}
                                            title={`Factura ${item.serie} - ${item.numero}`}
                                            fileUrl={fileUrl}
                                            downloadUrl={fileUrl}
                                            fileName={fileName}
                                        />
                                    );
                                })}
                            </Stack>
                        ) : null}
                    </Paper>
                ))
            )}
        </Stack>
    );
}