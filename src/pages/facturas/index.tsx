import {
    Box,
    Typography,
    Button,
    useTheme,
    alpha,
    InputBase,
    Select,
    MenuItem
} from '@mui/material';
import {
    AddCircle as AddCircleIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { facturaApi } from '@/entities/factura/api/factura.api';
import { useQuery } from '@tanstack/react-query';
import { FacturaTable } from '@/features/factura/list/ui/FacturaTable';
import { FacturaMobileList } from '@/features/factura/list/ui/FacturaMobileList';
import { FacturaPagoForm } from '@/features/factura/pagos/ui/FacturaPagoForm';
import { FacturaPagosModal } from '@/features/factura/pagos/ui/FacturaPagosModal';
import { useDeleteFactura, useUpdateFactura } from '@/features/factura/hooks/useFacturaCrud';
import { useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Factura, FacturaFilters } from '@/entities/factura/model/types';
import { ESTADO_FACTURA_ID } from '@/shared/constants/constantes';
import { formatCurrency } from '@/shared/utils/format-utils';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';

export function FacturasPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const canManageFacturas = usePermission(PERMISSIONS.FACTURAS.GESTIONAR);
    const [filters, setFilters] = useState<FacturaFilters>({ page: 1, size: 10, search: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['facturas', filters],
        queryFn: () => facturaApi.getAll(filters)
    });

    const { data: resumen } = useQuery({
        queryKey: ['facturas', 'resumen'],
        queryFn: () => facturaApi.getResumen()
    });

    const updateMutation = useUpdateFactura();
    const deleteMutation = useDeleteFactura();

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [pagosListModalOpen, setPagosListModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

    const handleCreateClick = () => {
        navigate('/app/facturas/nueva');
    };

    const handleEditClick = (factura: Factura) => {
        navigate(`/app/facturas/${factura.facturaID}`);
    };

    const handleViewClick = (factura: Factura) => {
        navigate(`/app/facturas/${factura.facturaID}`);
    };

    const handleDeleteClick = async (factura: Factura) => {
        await deleteMutation.mutateAsync(factura.facturaID);
    };

    const handlePaymentClick = (factura: Factura) => {
        setSelectedFactura(factura);
        setPaymentModalOpen(true);
    };

    const handleViewPaymentsClick = (factura: Factura) => {
        setSelectedFactura(factura);
        setPagosListModalOpen(true);
    };

    const handleUpdateStatus = async (factura: Factura, newStatusId: number) => {
        await updateMutation.mutateAsync({
            id: factura.facturaID,
            data: {
                fechaCompromisoPago: factura.fechaCompromisoPago,
                monedaID: factura.monedaID,
                estadoID: newStatusId,
                activo: factura.activo
            }
        });
    };

    return (
        <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: 'background.default',
            p: { xs: 2, md: 4 },
            position: 'relative'
        }}>
            <Box sx={{ maxWidth: 1920, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                
                {/* Hero Header */}
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
                    {canManageFacturas && (
                        <Button
                            variant="contained"
                            startIcon={<AddCircleIcon />}
                            onClick={handleCreateClick}
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
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            Nueva Factura
                        </Button>
                    )}
                </Box>

                {/* Bento Grid Filters & Overview */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                    {/* Metrics Card */}
                    <Box sx={{ 
                        gridColumn: { xs: 'span 12', lg: 'span 4' }, 
                        bgcolor: 'background.paper', 
                        p: 3, 
                        borderRadius: 3, 
                        boxShadow: '0 24px 48px -12px rgba(25, 28, 29, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="caption" fontWeight="bold" textTransform="uppercase" letterSpacing={1} color="text.secondary">
                                Monto Pendiente Total
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h3" fontWeight="bold" color="text.primary">
                                    {resumen ? formatCurrency(resumen.saldoPendienteTotal, 'S/') : 'S/ 0.00'}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 4 }}>
                            <Box sx={{ height: 6, width: '100%', bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', bgcolor: 'primary.main', width: '65%' }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                65% de la facturación mensual ha sido recaudada.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Fast Filters Card */}
                    <Box sx={{ 
                        gridColumn: { xs: 'span 12', lg: 'span 8' }, 
                        bgcolor: alpha(theme.palette.background.paper, 0.5), 
                        p: 3, 
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <Typography variant="caption" fontWeight="bold" textTransform="uppercase" letterSpacing={1} color="text.secondary">
                            Filtros Avanzados
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Estado</Typography>
                                <Select
                                    value={filters.estadoID ? filters.estadoID.toString() : "todos"}
                                    onChange={(e) => setFilters(prev => ({ ...prev, estadoID: e.target.value === "todos" ? undefined : Number(e.target.value), page: 1 }))}
                                    size="small"
                                    sx={{ bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { border: 'none' } }}
                                >
                                    <MenuItem value="todos">Todos los estados</MenuItem>
                                    <MenuItem value={ESTADO_FACTURA_ID.GENERADO.toString()}>Registrada</MenuItem>
                                    <MenuItem value={ESTADO_FACTURA_ID.EMITIDO.toString()}>Emitida</MenuItem>
                                    <MenuItem value={ESTADO_FACTURA_ID.ENTREGADO.toString()}>Entregada</MenuItem>
                                </Select>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Fecha Inicio</Typography>
                                <Box sx={{ position: 'relative' }}>
                                    <InputBase 
                                        type="date"
                                        value={filters.fechaInicio || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value, page: 1 }))}
                                        sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, py: 1, pl: 2, pr: 2, fontSize: '0.875rem' }} 
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Fecha Fin</Typography>
                                <Box sx={{ position: 'relative' }}>
                                    <InputBase 
                                        type="date"
                                        value={filters.fechaFin || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value, page: 1 }))}
                                        sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, py: 1, pl: 2, pr: 2, fontSize: '0.875rem' }} 
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ ml: 0.5 }}>Cliente / Factura</Typography>
                                <InputBase 
                                    placeholder="Buscar por serie-numero o cliente..." 
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                                    sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, py: 1, px: 2, fontSize: '0.875rem' }} 
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Main Data Table Container */}
                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 24px 48px -12px rgba(25, 28, 29, 0.06)', overflow: 'hidden' }}>
                    {isMobile ? (
                        <FacturaMobileList
                            data={data}
                            isLoading={isLoading}
                            page={filters.page}
                            rowsPerPage={filters.size}
                            onPageChange={(_, page) => setFilters(prev => ({ ...prev, page }))}
                            onRowsPerPageChange={(e) => setFilters(prev => ({ ...prev, size: parseInt(e.target.value, 10), page: 1 }))}
                            onView={canManageFacturas ? handleViewClick : undefined}
                            onEdit={canManageFacturas ? handleEditClick : undefined}
                            onDelete={canManageFacturas ? handleDeleteClick : undefined}
                            onPayment={canManageFacturas ? handlePaymentClick : undefined}
                            onViewPayments={canManageFacturas ? handleViewPaymentsClick : undefined}
                            onUpdateStatus={canManageFacturas ? handleUpdateStatus : undefined}
                        />
                    ) : (
                        <FacturaTable
                            data={data}
                            isLoading={isLoading}
                            page={filters.page}
                            rowsPerPage={filters.size}
                            onPageChange={(_, page) => setFilters(prev => ({ ...prev, page }))}
                            onRowsPerPageChange={(e) => setFilters(prev => ({ ...prev, size: parseInt(e.target.value, 10), page: 1 }))}
                            onView={canManageFacturas ? handleViewClick : undefined}
                            onEdit={canManageFacturas ? handleEditClick : undefined}
                            onDelete={canManageFacturas ? handleDeleteClick : undefined}
                            onPayment={canManageFacturas ? handlePaymentClick : undefined}
                            onViewPayments={canManageFacturas ? handleViewPaymentsClick : undefined}
                            onUpdateStatus={canManageFacturas ? handleUpdateStatus : undefined}
                        />
                    )}
                </Box>

                {/* Ad-hoc Info Panel */}
                <Box sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05), 
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, 
                    borderRadius: 3, 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2 
                }}>
                    <InfoIcon color="primary" />
                    <Typography variant="body2" color="primary.dark">
                        <Box component="span" fontWeight="bold">Recordatorio:</Box> Las facturas que superen los 30 días de vencimiento entrarán automáticamente en el flujo de cobranza prejudicial.
                    </Typography>
                </Box>
            </Box>

            {selectedFactura && (
                <>
                    <FacturaPagoForm
                        open={paymentModalOpen}
                        onClose={() => setPaymentModalOpen(false)}
                        factura={selectedFactura}
                        facturaId={selectedFactura.facturaID}
                        monedaId={selectedFactura.monedaID}
                        maxAmount={selectedFactura.saldoPendiente}
                    />
                    <FacturaPagosModal
                        open={pagosListModalOpen}
                        onClose={() => setPagosListModalOpen(false)}
                        factura={selectedFactura}
                    />
                </>
            )}
        </Box>
    );
}
