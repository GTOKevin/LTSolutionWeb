import {
    Box,
    Typography,
    Button,
    Tooltip,
    useTheme,
    alpha,
    TextField,
    MenuItem,
    useMediaQuery,
} from '@mui/material';
import {
    AddCircle as AddCircleIcon,
    CleaningServices as CleaningServicesIcon,
    Info as InfoIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { FacturaPagoForm, FacturaPagosModal } from '@/features/factura/pagos';
import { FacturaTable } from './FacturaTable';
import { FacturaMobileList } from './FacturaMobileList';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { formatDecimalAmount } from '@/shared/utils/format-utils';
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
    const getEstadoLabel = (estadoId?: number, fallback?: string) =>
        controller.facturaEstados?.find((item) => item.id === estadoId)?.text ?? fallback ?? '-';

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
                                    {controller.resumen ? formatDecimalAmount(controller.resumen.saldoPendienteTotal) : '0.00'}
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
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2, alignItems: 'end' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <TextField
                                    select
                                    label="Estado"
                                    value={controller.draftFilters.estadoID ? controller.draftFilters.estadoID.toString() : 'todos'}
                                    onChange={(event) => controller.handleEstadoDraftChange(event.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'background.paper',
                                            borderRadius: 2,
                                        },
                                    }}
                                >
                                    <MenuItem value="todos">Todos los estados</MenuItem>
                                    {controller.facturaGeneradaId ? <MenuItem value={controller.facturaGeneradaId.toString()}>{getEstadoLabel(controller.facturaGeneradaId, 'Generado')}</MenuItem> : null}
                                    {controller.facturaEmitidaId ? <MenuItem value={controller.facturaEmitidaId.toString()}>{getEstadoLabel(controller.facturaEmitidaId, 'Emitido')}</MenuItem> : null}
                                    {controller.facturaEntregadaId ? <MenuItem value={controller.facturaEntregadaId.toString()}>{getEstadoLabel(controller.facturaEntregadaId, 'Entregado')}</MenuItem> : null}
                                </TextField>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <FormDatePicker
                                    label="Fecha Inicio"
                                    value={controller.draftFilters.fechaInicio || ''}
                                    onChange={(event) => controller.handleFechaInicioDraftChange(event.target.value)}
                                    inputProps={{ max: controller.draftFilters.fechaFin || undefined }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'background.paper',
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <FormDatePicker
                                    label="Fecha Fin"
                                    value={controller.draftFilters.fechaFin || ''}
                                    onChange={(event) => controller.handleFechaFinDraftChange(event.target.value)}
                                    inputProps={{ min: controller.draftFilters.fechaInicio || undefined }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'background.paper',
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                                <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<SearchIcon />}
                                        onClick={controller.handleApplyFilters}
                                        disabled={controller.isFetching}
                                        fullWidth
                                        sx={{ borderRadius: 2, fontWeight: 600 }}
                                    >
                                        {controller.isFetching ? 'Buscando...' : 'Buscar'}
                                    </Button>
                                    <Tooltip title="Restablecer filtros al estado inicial">
                                        <Button
                                            variant="contained"
                                            color="info"
                                            onClick={controller.handleResetFilters}
                                            sx={{ minWidth: 40, height: 40, px: 1 }}
                                        >
                                            <CleaningServicesIcon />
                                        </Button>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                                <TextField
                                    label="Cliente / Factura"
                                    placeholder="Buscar por serie-numero o cliente..."
                                    value={controller.draftFilters.search || ''}
                                    onChange={(event) => controller.handleSearchDraftChange(event.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'background.paper',
                                            borderRadius: 2,
                                        },
                                    }}
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
