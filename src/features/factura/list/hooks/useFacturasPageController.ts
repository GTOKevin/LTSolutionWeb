import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { APP_PATHS, buildAppCreatePath, buildAppDetailPath, buildAppViewPath } from '@shared/config/app-routes';
import { facturaApi } from '@/entities/factura/api/factura.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import type { Factura, FacturaFilters } from '@/entities/factura/model/types';
import {
    resolveFacturaEmitidaId,
    resolveFacturaEntregadaId,
    resolveFacturaGeneradaId,
} from '@/entities/factura/model/status';
import { ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import { useDeleteFactura, useUpdateFactura } from '@/features/factura/hooks/useFacturaCrud';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { getFirstDayOfCurrentMonthISOMinus, getLastDayOfCurrentMonthISO } from '@/shared/utils/date-utils';

type FacturaFilterDraft = Pick<FacturaFilters, 'search' | 'estadoID' | 'fechaInicio' | 'fechaFin'>;

const defaultFacturaFilterDraft: FacturaFilterDraft = {
    search: '',
    fechaInicio: getFirstDayOfCurrentMonthISOMinus(3),
    fechaFin: getLastDayOfCurrentMonthISO(),
};

function areFacturaDraftFiltersEqual(current: FacturaFilterDraft, next: FacturaFilterDraft) {
    return current.search === next.search
        && current.estadoID === next.estadoID
        && current.fechaInicio === next.fechaInicio
        && current.fechaFin === next.fechaFin;
}

export function useFacturasPageController() {
    const navigate = useNavigate();
    const canViewFacturas = usePermission(PERMISSIONS.FACTURAS.VER);
    const canManageFacturas = usePermission(PERMISSIONS.FACTURAS.GESTIONAR);
    const [filters, setFilters] = useState<FacturaFilters>({
        page: 1,
        size: 10,
        ...defaultFacturaFilterDraft,
    });
    const [draftFilters, setDraftFilters] = useState<FacturaFilterDraft>(defaultFacturaFilterDraft);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [pagosListModalOpen, setPagosListModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['facturas', filters],
        queryFn: () => facturaApi.getAll(filters),
    });

    const { data: resumen } = useQuery({
        queryKey: ['facturas', 'resumen'],
        queryFn: () => facturaApi.getResumen(),
    });

    const { data: facturaEstadosResponse } = useQuery({
        queryKey: ['estados', 'factura-select'],
        queryFn: () => estadoApi.getSelect('', 20, ESTADO_SECTIONS.FACTURA),
    });

    const updateMutation = useUpdateFactura();
    const deleteMutation = useDeleteFactura();
    const facturaEstados = facturaEstadosResponse ?? [];
    const facturaGeneradaId = resolveFacturaGeneradaId(facturaEstados);
    const facturaEmitidaId = resolveFacturaEmitidaId(facturaEstados);
    const facturaEntregadaId = resolveFacturaEntregadaId(facturaEstados);

    const handleEstadoDraftChange = useCallback((value: string) => {
        setDraftFilters((prev) => ({
            ...prev,
            estadoID: value === 'todos' ? undefined : Number(value),
        }));
    }, []);

    const handleFechaInicioDraftChange = useCallback((value: string) => {
        setDraftFilters((prev) => ({
            ...prev,
            fechaInicio: value,
            fechaFin: prev.fechaFin && prev.fechaFin < value ? value : prev.fechaFin,
        }));
    }, []);

    const handleFechaFinDraftChange = useCallback((value: string) => {
        setDraftFilters((prev) => ({
            ...prev,
            fechaFin: value,
            fechaInicio: prev.fechaInicio && prev.fechaInicio > value ? value : prev.fechaInicio,
        }));
    }, []);

    const handleSearchDraftChange = useCallback((value: string) => {
        setDraftFilters((prev) => ({
            ...prev,
            search: value,
        }));
    }, []);

    const handleApplyFilters = useCallback(async () => {
        const currentAppliedFilters: FacturaFilterDraft = {
            search: filters.search ?? '',
            estadoID: filters.estadoID,
            fechaInicio: filters.fechaInicio,
            fechaFin: filters.fechaFin,
        };

        if (!areFacturaDraftFiltersEqual(currentAppliedFilters, draftFilters)) {
            setFilters((prev) => ({
                ...prev,
                ...draftFilters,
                page: 1,
            }));
            return;
        }

        if (filters.page !== 1) {
            setFilters((prev) => ({
                ...prev,
                page: 1,
            }));
            return;
        }

        await refetch();
    }, [draftFilters, filters, refetch]);

    const handleResetFilters = useCallback(async () => {
        setDraftFilters(defaultFacturaFilterDraft);

        const currentAppliedFilters: FacturaFilterDraft = {
            search: filters.search ?? '',
            estadoID: filters.estadoID,
            fechaInicio: filters.fechaInicio,
            fechaFin: filters.fechaFin,
        };

        if (!areFacturaDraftFiltersEqual(currentAppliedFilters, defaultFacturaFilterDraft)) {
            setFilters((prev) => ({
                ...prev,
                ...defaultFacturaFilterDraft,
                page: 1,
            }));
            return;
        }

        if (filters.page !== 1) {
            setFilters((prev) => ({
                ...prev,
                page: 1,
            }));
            return;
        }

        await refetch();
    }, [filters, refetch]);

    const handleCreateClick = () => {
        navigate(buildAppCreatePath(APP_PATHS.facturas));
    };

    const handleEditClick = (factura: Factura) => {
        navigate(buildAppDetailPath(APP_PATHS.facturas, factura.facturaID));
    };

    const handleViewClick = (factura: Factura) => {
        navigate(buildAppViewPath(APP_PATHS.facturas, factura.facturaID));
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
                fechaEmision: factura.fechaEmision,
                fechaVencimiento: factura.fechaVencimiento,
                fechaCompromisoPago: null,
                diasCredito: factura.diasCredito ?? null,
                estadoID: newStatusId,
            },
        });
    };

    return {
        canViewFacturas,
        canManageFacturas,
        data,
        deleteMutation,
        draftFilters,
        facturaEmitidaId,
        facturaEntregadaId,
        facturaEstados,
        facturaGeneradaId,
        filters,
        handleApplyFilters,
        handleCreateClick,
        handleDeleteClick,
        handleEditClick,
        handleEstadoDraftChange,
        handleFechaFinDraftChange,
        handleFechaInicioDraftChange,
        handlePaymentClick,
        handleResetFilters,
        handleSearchDraftChange,
        handleUpdateStatus,
        handleViewClick,
        handleViewPaymentsClick,
        isFetching,
        isLoading,
        pagosListModalOpen,
        paymentModalOpen,
        resumen,
        selectedFactura,
        setFilters,
        setPagosListModalOpen,
        setPaymentModalOpen,
    };
}
