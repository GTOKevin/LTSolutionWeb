import {
    Box,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Stack,
    useTheme,
    alpha,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { FacturaPagoForm, FacturaPagosModal } from '@/features/factura/pagos';
import { useFacturaDetailController } from '../hooks/useFacturaDetailController';
import { FacturaSummaryPanel } from './FacturaSummaryPanel';

import { FacturaLineItemsTable } from './FacturaLineItemsTable';
import { FacturaAssociatedGuides } from './FacturaAssociatedGuides';
import { FacturaPaymentsHistory } from './FacturaPaymentsHistory';

interface FacturaDetailPageContentProps {
    id?: number;
}

export function FacturaDetailPageContent({ id }: FacturaDetailPageContentProps) {
    const theme = useTheme();
    const controller = useFacturaDetailController(id);

    if (controller.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 450, p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (controller.isError || !controller.factura) {
        return (
            <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                    {getErrorMessage(controller.error, 'No se pudo cargar la información detallada de la factura.')}
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={controller.handleBack}
                    sx={{ borderRadius: 2 }}
                >
                    Volver a Facturación
                </Button>
            </Box>
        );
    }

    const { factura, guias } = controller;
    const facturaCodigo = factura.serie ? `${factura.serie}-${factura.numero}` : `#${factura.facturaID}`;

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: 'background.default',
                p: { xs: 2, md: 3.5 },
                pb: 8,
            }}
        >
            <Box sx={{ maxWidth: 1920, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Header superior con Breadcrumb y Botón Volver */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            onClick={controller.handleBack}
                            sx={{
                                borderRadius: 2,
                                color: 'text.secondary',
                                borderColor: alpha(theme.palette.divider, 0.9),
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                },
                            }}
                        >
                            Volver
                        </Button>
                        <Box>
                            <Box sx={{ display: 'flex', gap: 1, typography: 'caption', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                                <Typography variant="caption">Finanzas</Typography>
                                <Typography variant="caption">/</Typography>
                                <Typography variant="caption">Facturación</Typography>
                                <Typography variant="caption">/</Typography>
                                <Typography variant="caption" color="primary.main">{facturaCodigo}</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ mt: 0.2 }}>
                                Control de Factura: {facturaCodigo}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Layout Dividido (Split Control View): Columna Izquierda Fija / Columna Derecha de Detalle */}
                <Grid container spacing={3} alignItems="flex-start">
                    {/* Columna Izquierda: Panel de Resumen Ejecutivo y Totales */}
                    <Grid size={{ xs: 12, lg: 4.5, xl: 4 }}>
                        <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
                            <FacturaSummaryPanel
                                factura={factura}
                                canManageFacturas={controller.canManageFacturas}
                                onRegisterPayment={() => controller.setPaymentModalOpen(true)}
                                onDownloadPdf={controller.handleDownloadPdf}
                                onDownloadExcel={controller.handleDownloadExcel}
                                onViewPaymentsHistory={() => controller.setPagosListModalOpen(true)}
                            />
                        </Box>
                    </Grid>

                    {/* Columna Derecha: Secciones Detalladas (Ítems, Guías, Historial de Pagos, Documentos) */}
                    <Grid size={{ xs: 12, lg: 7.5, xl: 8 }}>
                        <Stack spacing={3}>
                            {/* 1. Tabla de Ítems / Viajes Facturados */}
                            <FacturaLineItemsTable factura={factura} />

                            {/* 2. Guías de Remisión Asociadas */}
                            <FacturaAssociatedGuides guias={guias} />

                            {/* 3. Historial de Pagos / Abonos */}
                            <FacturaPaymentsHistory
                                factura={factura}
                                canManageFacturas={controller.canManageFacturas}
                                onRegisterPayment={() => controller.setPaymentModalOpen(true)}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Modales de Gestión de Pagos */}
            {factura ? (
                <>
                    <FacturaPagoForm
                        open={controller.paymentModalOpen}
                        onClose={() => controller.setPaymentModalOpen(false)}
                        onSuccess={controller.handlePaymentSuccess}
                        factura={factura}
                        facturaId={factura.facturaID}
                        monedaId={factura.monedaID}
                        maxAmount={factura.saldoPendiente ?? 0}
                    />
                    <FacturaPagosModal
                        open={controller.pagosListModalOpen}
                        onClose={() => controller.setPagosListModalOpen(false)}
                        factura={factura}
                    />
                </>
            ) : null}
        </Box>
    );
}
