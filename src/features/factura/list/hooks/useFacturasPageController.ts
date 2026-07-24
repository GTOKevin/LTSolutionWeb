import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { APP_PATHS, buildAppCreatePath, buildAppDetailPath, buildAppViewPath } from '@app/router/model/navigation';
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

export function useFacturasPageController() {
    const navigate = useNavigate();
    const canViewFacturas = usePermission(PERMISSIONS.FACTURAS.VER);
    const canManageFacturas = usePermission(PERMISSIONS.FACTURAS.GESTIONAR);
    const [filters, setFilters] = useState<FacturaFilters>({ page: 1, size: 10, search: '' });
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [pagosListModalOpen, setPagosListModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

    const { data, isLoading } = useQuery({
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
                fechaCompromisoPago: factura.fechaCompromisoPago,
                monedaID: factura.monedaID,
                estadoID: newStatusId,
                activo: factura.activo,
            },
        });
    };

    return {
        canViewFacturas,
        canManageFacturas,
        data,
        deleteMutation,
        facturaEmitidaId,
        facturaEntregadaId,
        facturaEstados,
        facturaGeneradaId,
        filters,
        handleCreateClick,
        handleDeleteClick,
        handleEditClick,
        handlePaymentClick,
        handleUpdateStatus,
        handleViewClick,
        handleViewPaymentsClick,
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
