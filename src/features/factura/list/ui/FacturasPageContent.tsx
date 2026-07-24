import {
    Box,
    Typography,
    Button,
    useTheme,
    alpha,
    InputBase,
    Select,
    MenuItem,
    useMediaQuery,
} from '@mui/material';
import {
    AddCircle as AddCircleIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { FacturaTable } from './FacturaTable';
import { FacturaMobileList } from './FacturaMobileList';
import { FacturaPagoForm } from '@/features/factura/pagos/ui/FacturaPagoForm';
import { FacturaPagosModal } from '@/features/factura/pagos/ui/FacturaPagosModal';
import { formatCurrency } from '@/shared/utils/format-utils';
import type { useFacturasPageController } from '../hooks/useFacturasPageController';

interface FacturasPageContentProps {
    controller: ReturnType<typeof useFacturasPageController>;
}

export function FacturasPageContent({ controller }: FacturasPageContentProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const totalFacturado = controller.resumen?.totalFacturado ?? 0;
    const saldoPendienteTotal = controller.resumen?.saldoPendienteTotal ?? 0;
    const montoRecaudado = Math.max(totalFacturado - saldoPendienteTotal, 0);
    const recaudacionPorcentaje = totalFacturado > 0
        ? Math.min((montoRecaudado / totalFacturado) * 100, 100)
        : 0;

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: 'background.default',
                p: { xs: 2, md: 4 },
                position: 'relative',
            }}
        >
            <Box sx={{ maxWidth: 1920, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, typography: 'caption', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                            <Typography variant="caption">Finanzas</Typography>
                            <Typography variant="caption">/</Typography>
                            <Typography variant="caption" color="primary.main">Facturación</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            Gestión de Facturas
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Control total de la emisión fiscal y cobranza de la flota.
                        </Typography>
                    </Box>
                    {controller.canManageFacturas ? (
                        <Button
                            variant="contained"
                            startIcon={<AddCircleIcon />}
                            onClick={controller.handleCreateClick}
                            fullWidth={isMobile}
                            sx={{
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                boxShadow: theme.shadows[4],
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            Nueva Factura
                        </Button>
                    ) : null}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                    <Box
                        sx={{
                            gridColumn: { xs: 'span 12', lg: 'span 4' },
                            bgcolor: 'background.paper',
                            p: 3,
                            borderRadius: 3,
                            boxShadow: '0 24px 48px -12px rgba(25, 28, 29, 0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box>
                            <Typography variant="caption" fontWeight="bold" textTransform="uppercase" letterSpacing={1} color="text.secondary">
                                Monto Pendiente Total
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h3" fontWeight="bold" color="text.primary">
                                    {controller.resumen ? formatCurrency(controller.resumen.saldoPendienteTotal, 'S/') : 'S/ 0.00'}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 4 }}>
                            <Box sx={{ height: 6, width: '100%', bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', bgcolor: 'primary.main', width: `${recaudacionPorcentaje}%` }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                {`${recaudacionPorcentaje.toFixed(1)}% del monto facturado consolidado ha sido recaudado.`}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            gridColumn: { xs: 'span 12', lg: 'span 8' },
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            p: 3,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Typography variant="caption" fontWeight="bold" textTransform="uppercase" letterSpacing={1} color="text.secondary">
                            Filtros Avanzados
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Estado</Typography>
                                <Select
                                    value={controller.filters.estadoID ? controller.filters.estadoID.toString() : 'todos'}
                                    onChange={(event) => controller.setFilters((prev) => ({
                                        ...prev,
                                        estadoID: event.target.value === 'todos' ? undefined : Number(event.target.value),
                                        page: 1,
                                    }))}
                                    size="small"
                                    sx={{ bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { border: 'none' } }}
                                >
                                    <MenuItem value="todos">Todos los estados</MenuItem>
                                    {controller.facturaGeneradaId ? <MenuItem value={controller.facturaGeneradaId.toString()}>Registrada</MenuItem> : null}
                                    {controller.facturaEmitidaId ? <MenuItem value={controller.facturaEmitidaId.toString()}>Emitida</MenuItem> : null}
                                    {controller.facturaEntregadaId ? <MenuItem value={controller.facturaEntregadaId.toString()}>Entregada</MenuItem> : null}
                                </Select>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Fecha Inicio</Typography>
                                <Box sx={{ position: 'relative' }}>
                                    <InputBase
                                        type="date"
                                        value={controller.filters.fechaInicio || ''}
                                        onChange={(event) => controller.setFilters((prev) => ({ ...prev, fechaInicio: event.target.value, page: 1 }))}
                                        sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, py: 1, pl: 2, pr: 2, fontSize: '0.875rem' }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Fecha Fin</Typography>
                                <Box sx={{ position: 'relative' }}>
                                    <InputBase
                                        type="date"
                                        value={controller.filters.fechaFin || ''}
                                        onChange={(event) => controller.setFilters((prev) => ({ ...prev, fechaFin: event.target.value, page: 1 }))}
                                        sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, py: 1, pl: 2, pr: 2, fontSize: '0.875rem' }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Cliente / Factura</Typography>
                                <InputBase
                                    placeholder="Buscar por serie-numero o cliente..."
                                    value={controller.filters.search}
                                    onChange={(event) => controller.setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
                                    sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, py: 1, px: 2, fontSize: '0.875rem' }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 24px 48px -12px rgba(25, 28, 29, 0.06)', overflow: 'hidden' }}>
                    {isMobile ? (
                        <FacturaMobileList
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.filters.page}
                            rowsPerPage={controller.filters.size}
                            onPageChange={(_, page) => controller.setFilters((prev) => ({ ...prev, page }))}
                            onRowsPerPageChange={(event) => controller.setFilters((prev) => ({ ...prev, size: parseInt(event.target.value, 10), page: 1 }))}
                            onView={controller.canViewFacturas ? controller.handleViewClick : undefined}
                            onEdit={controller.canManageFacturas ? controller.handleEditClick : undefined}
                            onDelete={controller.canManageFacturas ? controller.handleDeleteClick : undefined}
                            onPayment={controller.canManageFacturas ? controller.handlePaymentClick : undefined}
                            onViewPayments={controller.canViewFacturas ? controller.handleViewPaymentsClick : undefined}
                            onUpdateStatus={controller.canManageFacturas ? controller.handleUpdateStatus : undefined}
                            canDownloadReports={controller.canViewFacturas}
                            statusCatalog={controller.facturaEstados}
                        />
                    ) : (
                        <FacturaTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.filters.page}
                            rowsPerPage={controller.filters.size}
                            onPageChange={(_, page) => controller.setFilters((prev) => ({ ...prev, page }))}
                            onRowsPerPageChange={(event) => controller.setFilters((prev) => ({ ...prev, size: parseInt(event.target.value, 10), page: 1 }))}
                            onView={controller.canViewFacturas ? controller.handleViewClick : undefined}
                            onEdit={controller.canManageFacturas ? controller.handleEditClick : undefined}
                            onDelete={controller.canManageFacturas ? controller.handleDeleteClick : undefined}
                            onPayment={controller.canManageFacturas ? controller.handlePaymentClick : undefined}
                            onViewPayments={controller.canViewFacturas ? controller.handleViewPaymentsClick : undefined}
                            onUpdateStatus={controller.canManageFacturas ? controller.handleUpdateStatus : undefined}
                            canDownloadReports={controller.canViewFacturas}
                            statusCatalog={controller.facturaEstados}
                        />
                    )}
                </Box>

                <Box
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        p: 2,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                    }}
                >
                    <InfoIcon color="primary" />
                    <Typography variant="body2" color="primary.dark">
                        <Box component="span" fontWeight="bold">Recordatorio:</Box> Las facturas que superen los 30 días de vencimiento entrarán automáticamente en el flujo de cobranza prejudicial.
                    </Typography>
                </Box>
            </Box>

            {controller.selectedFactura ? (
                <>
                    <FacturaPagoForm
                        open={controller.paymentModalOpen}
                        onClose={() => controller.setPaymentModalOpen(false)}
                        factura={controller.selectedFactura}
                        facturaId={controller.selectedFactura.facturaID}
                        monedaId={controller.selectedFactura.monedaID}
                        maxAmount={controller.selectedFactura.saldoPendiente}
                    />
                    <FacturaPagosModal
                        open={controller.pagosListModalOpen}
                        onClose={() => controller.setPagosListModalOpen(false)}
                        factura={controller.selectedFactura}
                    />
                </>
            ) : null}
        </Box>
    );
}
