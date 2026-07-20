import { useEffect, useMemo, useState } from 'react';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLayoutStore } from '@shared/store/layout.store';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useToast } from '@shared/components/ui/Toast/useToast';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { MiPagoDto, MiPagoFilters } from '@entities/employee/model/types';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { PERMISSIONS } from '@shared/constants/permissions';
import {
    formatDateOnly,
    getFirstDayOfCurrentMonthISO,
    getLastDayOfCurrentMonthISO,
} from '@shared/utils/date-utils';
import { saveAs } from 'file-saver';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { portalTableContainerFlatSx, portalTableHeaderFlatSx } from '@shared/components/ui/employee-portal-shell.styles';
import { MisPagosKPIs } from '@/features/employee/pagos/ui/MisPagosKPIs';
import { MisPagosFilters } from '@/features/employee/pagos/ui/MisPagosFilters';
import { MisPagosMobileList } from '@/features/employee/pagos/ui/MisPagosMobileList';
import { getErrorMessage } from '@/shared/utils/api-errors';

const columns: Column[] = [
    { id: 'tipo', label: 'TIPO' },
    { id: 'monto', label: 'MONTO' },
    { id: 'periodo', label: 'PERIODO' },
    { id: 'fecha_pago', label: 'FECHA PAGO' },
    { id: 'estado', label: 'ESTADO' },
    { id: 'acciones', label: 'ACCIONES', align: 'right' },
];

function formatMoney(item: MiPagoDto) {
    return `${item.monedaSimbolo || item.monedaCodigo} ${item.monto.toFixed(2)}`;
}

function escapeCsvValue(value: string) {
    return `"${value.replaceAll('"', '""')}"`;
}

function exportPagosCsv(items: MiPagoDto[], fileName: string) {
    const headers = ['Tipo', 'Moneda', 'Monto', 'Periodo', 'Fecha pago', 'Estado', 'Observaciones'];
    const rows = items.map((item) => [
        item.tipoPagoNombre,
        item.monedaCodigo,
        item.monto.toFixed(2),
        `${formatDateOnly(item.fechaInicio)} - ${formatDateOnly(item.fechaCierre)}`,
        formatDateOnly(item.fechaPago),
        item.estadoConfirmacion,
        item.observaciones ?? '',
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
        .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
}

export function MisPagosPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const canConfirmPayments = usePermission(PERMISSIONS.EMPLOYEE.PAGOS.CONFIRMAR);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [tipoPagoID, setTipoPagoID] = useState<number | ''>('');
    const [monedaID, setMonedaID] = useState<number | ''>('');
    const [desde, setDesde] = useState(getFirstDayOfCurrentMonthISO(-1));
    const [hasta, setHasta] = useState(getLastDayOfCurrentMonthISO());
    const [filters, setFilters] = useState<Omit<MiPagoFilters, 'page' | 'size'>>({
        desde: getFirstDayOfCurrentMonthISO(-1),
        hasta: getLastDayOfCurrentMonthISO(),
    });
    const [selectedPago, setSelectedPago] = useState<MiPagoDto | null>(null);

    useEffect(() => {
        setPageTitle('Mis Pagos');
    }, [setPageTitle]);

    const { data: tiposPago } = useQuery({
        queryKey: ['employee-portal', 'tipos-pago'],
        queryFn: async () => (await maestroApi.getSelect(undefined, SECCION_MAESTRO.PAGO)).data,
    });

    const { data: monedas } = useQuery({
        queryKey: ['employee-portal', 'monedas'],
        queryFn: async () => (await monedaApi.getSelect()).data,
    });

    const queryFilters = useMemo<MiPagoFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const { data, isLoading } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.pagos(queryFilters),
        queryFn: () => employeePortalApi.getMyPagos(queryFilters),
        placeholderData: (previousData) => previousData,
    });

    const confirmMutation = useMutation({
        mutationFn: (id: number) => employeePortalApi.confirmMyPago(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Pago confirmado correctamente.', severity: 'success' });
            setSelectedPago(null);
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error, 'No se pudo confirmar el pago.');
            showToast({ message, severity: 'error' });
        },
    });

    const paymentStats = useMemo(() => {
        const items = data?.items ?? [];
        return {
            total: data?.total ?? 0,
            pendingCount: items.filter((item) => item.confirmadoPago == null).length,
            confirmedCount: items.filter((item) => item.confirmadoPago === true).length,
            visibleAmount: items.reduce((sum, item) => sum + item.monto, 0),
        };
    }, [data]);

    const handleSearch = () => {
        setPage(0);
        setFilters({
            tipoPagoID: tipoPagoID === '' ? undefined : Number(tipoPagoID),
            monedaID: monedaID === '' ? undefined : Number(monedaID),
            desde: desde || undefined,
            hasta: hasta || undefined,
        });
    };

    const handleChangePage = (_: unknown, nextPage: number) => {
        setPage(nextPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const handleExportReport = () => {
        if (!data?.items.length) {
            showToast({ message: 'No hay pagos visibles para exportar.', severity: 'warning' });
            return;
        }

        exportPagosCsv(
            data.items,
            `mis-pagos_${desde || 'sin-inicio'}_${hasta || 'sin-fin'}.csv`
        );

        showToast({ message: 'Reporte exportado correctamente.', severity: 'success' });
    };

    const handleExportPayment = (item: MiPagoDto) => {
        exportPagosCsv(
            [item],
            `pago_${item.colaboradorPagoId}_${formatDateOnly(item.fechaPago).replaceAll('/', '-')}.csv`
        );

        showToast({ message: 'Pago exportado correctamente.', severity: 'success' });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: '100%', flex: '1 0 auto' }}>
            {/* Header */}
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
                    onClick={handleExportReport}
                    sx={{ bgcolor: 'action.hover', color: 'text.primary', boxShadow: 'none', '&:hover': { bgcolor: 'action.selected', boxShadow: 'none' }, borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                >
                    Exportar Reporte
                </Button>
            </Box>

            <MisPagosKPIs 
                paymentStats={paymentStats}
                dataItems={data?.items}
                onSelectPending={setSelectedPago}
                canConfirmPayments={canConfirmPayments}
            />

            <MisPagosFilters 
                tipoPagoID={tipoPagoID}
                monedaID={monedaID}
                desde={desde}
                hasta={hasta}
                tiposPago={tiposPago}
                monedas={monedas}
                onTipoPagoChange={setTipoPagoID}
                onMonedaChange={setMonedaID}
                onDesdeChange={setDesde}
                onHastaChange={setHasta}
                onSearch={handleSearch}
            />

            {/* Main Data Table */}
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                {isMobile ? (
                    <MisPagosMobileList
                        data={data}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        canConfirmPayments={canConfirmPayments}
                        onConfirmPayment={setSelectedPago}
                        onExportPayment={handleExportPayment}
                        formatMoney={formatMoney}
                    />
                ) : (
                    <SharedTable
                        data={data}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
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
                                    <TableCell sx={{ py: 2.5, fontWeight: 800 }}>{formatMoney(item)}</TableCell>
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
                                        {isPending && canConfirmPayments ? (
                                            <Button
                                                onClick={() => setSelectedPago(item)}
                                                sx={{ fontWeight: 900, letterSpacing: '0.1em', color: 'primary.main', '&:hover': { textDecoration: 'underline', textUnderlineOffset: 4, bgcolor: 'transparent' } }}
                                            >
                                                CONFIRMAR PAGO
                                            </Button>
                                        ) : (
                                            <Button onClick={() => handleExportPayment(item)} sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.selected', color: 'text.primary' } }}>
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

            <ConfirmDialog
                open={Boolean(selectedPago)}
                title="Confirmar recepción de pago"
                content={
                    selectedPago
                        ? `¿Confirmas haber recibido el pago de ${selectedPago.tipoPagoNombre} por el monto de ${formatMoney(selectedPago)} correspondiente al periodo ${formatDateOnly(selectedPago.fechaInicio)} - ${formatDateOnly(selectedPago.fechaCierre)}?`
                        : ''
                }
                onClose={() => setSelectedPago(null)}
                onConfirm={() => {
                    if (selectedPago) {
                        confirmMutation.mutate(selectedPago.colaboradorPagoId);
                    }
                }}
                confirmText="Confirmar pago"
                isLoading={confirmMutation.isPending}
            />
        </Box>
    );
}
