import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLayoutStore } from '@shared/store/layout.store';
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
import { getErrorMessage } from '@shared/utils/api-errors';
import { formatCurrencyAmount, formatDecimalAmount } from '@shared/utils/format-utils';

function escapeCsvValue(value: string) {
    return `"${value.replaceAll('"', '""')}"`;
}

function getPagoCurrencyDescriptor(item: Pick<MiPagoDto, 'monedaCodigo' | 'monedaSimbolo'>) {
    return {
        codigo: item.monedaCodigo,
        simbolo: item.monedaSimbolo,
    };
}

function getPagoCurrencyKey(item: Pick<MiPagoDto, 'monedaCodigo'>) {
    return item.monedaCodigo;
}

function exportPagosCsv(items: MiPagoDto[], fileName: string) {
    const headers = ['Tipo', 'Moneda', 'Monto', 'Periodo', 'Fecha pago', 'Estado', 'Observaciones'];
    const rows = items.map((item) => [
        item.tipoPagoNombre,
        getPagoCurrencyKey(item),
        formatDecimalAmount(item.monto),
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

export function formatPagoMoney(item: MiPagoDto) {
    return formatCurrencyAmount(item.monto, getPagoCurrencyDescriptor(item));
}

export function useMisPagosPageController() {
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
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.PAGO),
    });

    const { data: monedas } = useQuery({
        queryKey: ['employee-portal', 'monedas'],
        queryFn: () => monedaApi.getSelect(),
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
        const currencyTotalsMap = new Map<string, { amount: number; currency: ReturnType<typeof getPagoCurrencyDescriptor> }>();

        items.forEach((item) => {
            const currencyKey = getPagoCurrencyKey(item);
            const currency = getPagoCurrencyDescriptor(item);
            const current = currencyTotalsMap.get(currencyKey);
            currencyTotalsMap.set(currencyKey, {
                amount: (current?.amount ?? 0) + item.monto,
                currency,
            });
        });

        return {
            total: data?.total ?? 0,
            visibleCount: items.length,
            pendingCount: items.filter((item) => item.confirmadoPago == null).length,
            confirmedCount: items.filter((item) => item.confirmadoPago === true).length,
            currencyTotals: Array.from(currencyTotalsMap.values()).map(({ currency, amount }) => ({
                currency,
                amount,
            })),
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

    return {
        canConfirmPayments,
        confirmMutation,
        data,
        desde,
        hasta,
        handleChangePage,
        handleChangeRowsPerPage,
        handleExportPayment,
        handleExportReport,
        handleSearch,
        isLoading,
        monedaID,
        monedas,
        page,
        paymentStats,
        rowsPerPage,
        selectedPago,
        setDesde,
        setHasta,
        setMonedaID,
        setSelectedPago,
        setTipoPagoID,
        tipoPagoID,
        tiposPago,
    };
}
