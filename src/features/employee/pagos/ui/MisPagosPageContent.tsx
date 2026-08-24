import {
    Box,
    Button,
    TableCell,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Work as WorkIcon,
    Redeem as RedeemIcon,
    CheckCircle as CheckCircleIcon,
    DownloadForOffline as DownloadForOfflineIcon,
} from '@mui/icons-material';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { portalTableContainerFlatSx, portalTableHeaderFlatSx } from '@shared/components/ui/employee-portal-shell.styles';
import { MisPagosKPIs } from './MisPagosKPIs';
import { MisPagosFilters } from './MisPagosFilters';
import { MisPagosMobileList } from './MisPagosMobileList';
import type { useMisPagosPageController } from '../hooks/useMisPagosPageController';
import { formatDateOnly } from '@shared/utils/date-utils';
import { formatPagoMoney } from '../hooks/useMisPagosPageController';

const columns: Column[] = [
    { id: 'tipo', label: 'TIPO' },
    { id: 'monto', label: 'MONTO' },
    { id: 'periodo', label: 'PERIODO' },
    { id: 'fecha_pago', label: 'FECHA PAGO' },
    { id: 'estado', label: 'ESTADO' },
    { id: 'acciones', label: 'ACCIONES', align: 'right' },
];

interface MisPagosPageContentProps {
    controller: ReturnType<typeof useMisPagosPageController>;
}

export function MisPagosPageContent({ controller }: MisPagosPageContentProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isRefreshing = controller.isFetching && !controller.isLoading;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: '100%', flex: '1 0 auto' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between', gap: 4 }}>
                <Box>
                    <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                        Mis Pagos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión y control de tus remuneraciones mensuales.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<DownloadForOfflineIcon />}
                    onClick={controller.handleExportReport}
                    disabled={isRefreshing}
                    sx={{ bgcolor: 'action.hover', color: 'text.primary', boxShadow: 'none', '&:hover': { bgcolor: 'action.selected', boxShadow: 'none' }, borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                >
                    {isRefreshing ? 'Actualizando...' : 'Exportar Reporte'}
                </Button>
            </Box>

            {controller.hasBlockingError ? (
                <FetchErrorState
                    message="No se pudieron cargar tus pagos del portal del empleado."
                    onRetry={controller.retryPagosLoad}
                />
            ) : (
                <>
                    <MisPagosKPIs
                        paymentStats={controller.paymentStats}
                        dataItems={controller.data?.items}
                        onSelectPending={controller.setSelectedPago}
                        isRefreshing={isRefreshing}
                    />

                    <MisPagosFilters
                        tipoPagoID={controller.tipoPagoID}
                        monedaID={controller.monedaID}
                        desde={controller.desde}
                        hasta={controller.hasta}
                        tiposPago={controller.tiposPago}
                        monedas={controller.monedas}
                        onTipoPagoChange={controller.setTipoPagoID}
                        onMonedaChange={controller.setMonedaID}
                        onDesdeChange={controller.setDesde}
                        onHastaChange={controller.setHasta}
                        onSearch={controller.handleSearch}
                    />

                    {isRefreshing ? (
                        <Box sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}>
                            Actualizando resultados segun los filtros aplicados...
                        </Box>
                    ) : null}

                    <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        {isMobile ? (
                            <MisPagosMobileList
                                data={controller.data}
                                isLoading={controller.isLoading}
                                isRefreshing={isRefreshing}
                                page={controller.page}
                                rowsPerPage={controller.rowsPerPage}
                                onPageChange={controller.handleChangePage}
                                onRowsPerPageChange={controller.handleChangeRowsPerPage}
                                actionsDisabled={isRefreshing}
                                onConfirmPayment={controller.setSelectedPago}
                                onExportPayment={controller.handleExportPayment}
                                formatMoney={formatPagoMoney}
                            />
                        ) : (
                            <SharedTable
                                data={controller.data}
                                isLoading={controller.isLoading}
                                page={controller.page}
                                rowsPerPage={controller.rowsPerPage}
                                onPageChange={controller.handleChangePage}
                                onRowsPerPageChange={controller.handleChangeRowsPerPage}
                                columns={columns}
                                keyExtractor={(item) => item.colaboradorPagoId}
                                emptyMessage="No se encontraron pagos con los filtros seleccionados."
                                containerSx={portalTableContainerFlatSx}
                                headerSx={portalTableHeaderFlatSx}
                                variant="flat"
                                renderRow={(item) => {
                                    const isPending = item.confirmadoPago == null;
                                    return (
                                        <>
                                            <TableCell sx={{ py: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ w: 40, h: 40, borderRadius: 2, bgcolor: isPending ? 'primary.50' : 'success.50', color: isPending ? 'primary.main' : 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {item.tipoPagoNombre.includes('Bono') ? <RedeemIcon /> : <WorkIcon />}
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={700}>{item.tipoPagoNombre}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 2.5, fontWeight: 800 }}>{formatPagoMoney(item)}</TableCell>
                                            <TableCell sx={{ py: 2.5, color: 'text.secondary' }}>
                                                {formatDateOnly(item.fechaInicio)} - {formatDateOnly(item.fechaCierre)}
                                            </TableCell>
                                            <TableCell sx={{ py: 2.5, color: 'text.secondary' }}>{formatDateOnly(item.fechaPago)}</TableCell>
                                            <TableCell sx={{ py: 2.5 }}>
                                                {isPending ? (
                                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: 99, bgcolor: 'error.100', color: 'error.dark', border: '1px solid', borderColor: 'error.light' }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', animation: 'pulse 2s infinite' }} />
                                                        <Typography variant="caption" fontWeight={800}>Pendiente</Typography>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: 99, bgcolor: 'success.50', color: 'success.dark', border: '1px solid', borderColor: 'success.light' }}>
                                                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                                                        <Typography variant="caption" fontWeight={800}>Confirmado</Typography>
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 2.5, textAlign: 'right' }}>
                                                {isPending ? (
                                                    <Button
                                                        onClick={() => controller.setSelectedPago(item)}
                                                        disabled={isRefreshing}
                                                        sx={{ fontWeight: 900, letterSpacing: '0.1em', color: 'primary.main', '&:hover': { textDecoration: 'underline', textUnderlineOffset: 4, bgcolor: 'transparent' } }}
                                                    >
                                                        CONFIRMAR PAGO
                                                    </Button>
                                                ) : (
                                                    <Button disabled={isRefreshing} onClick={() => controller.handleExportPayment(item)} sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.selected', color: 'text.primary' } }}>
                                                        <DownloadForOfflineIcon />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </>
                                    );
                                }}
                            />
                        )}
                    </Box>
                </>
            )}

            <ConfirmDialog
                open={Boolean(controller.selectedPago)}
                title="Confirmar recepción de pago"
                content={
                    controller.selectedPago
                        ? `¿Confirmas haber recibido el pago de ${controller.selectedPago.tipoPagoNombre} por el monto de ${formatPagoMoney(controller.selectedPago)} correspondiente al periodo ${formatDateOnly(controller.selectedPago.fechaInicio)} - ${formatDateOnly(controller.selectedPago.fechaCierre)}?`
                        : ''
                }
                onClose={() => controller.setSelectedPago(null)}
                onConfirm={() => {
                    if (controller.selectedPago) {
                        controller.confirmMutation.mutate(controller.selectedPago.colaboradorPagoId);
                    }
                }}
                confirmText="Confirmar pago"
                isLoading={controller.confirmMutation.isPending}
            />
        </Box>
    );
}
