import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { APP_PATHS } from '@/shared/config/app-routes';
import { facturaApi } from '@/entities/factura/api/factura.api';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { generateFacturaPdf, generateFacturaExcel } from '@/features/factura/utils/facturaReportGenerator';

export function useFacturaDetailController(customId?: number) {
    const { id: routeId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const facturaId = customId ?? Number(routeId);

    const canViewFacturas = usePermission(PERMISSIONS.FACTURAS.VER);
    const canManageFacturas = usePermission(PERMISSIONS.FACTURAS.GESTIONAR);

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [pagosListModalOpen, setPagosListModalOpen] = useState(false);

    // Fetch full enriched report data (factura + cliente + moneda + estado + detalles con rutas + pagos)
    const {
        data: facturaReporte,
        isLoading: isReporteLoading,
        isError: isReporteError,
        error: reporteError,
        refetch: refetchReporte,
    } = useQuery({
        queryKey: ['factura-reporte', facturaId],
        queryFn: () => facturaApi.getReporteById(facturaId),
        enabled: !Number.isNaN(facturaId) && facturaId > 0,
    });

    // Fetch guías of associated viajes
    const {
        data: guias,
        isLoading: isGuiasLoading,
        isError: isGuiasError,
        refetch: refetchGuias,
    } = useQuery({
        queryKey: ['factura-guias', facturaId],
        queryFn: () => facturaApi.getGuias(facturaId),
        enabled: !Number.isNaN(facturaId) && facturaId > 0,
    });

    const handleDownloadPdf = () => {
        if (!facturaReporte) return;
        generateFacturaPdf(facturaReporte);
    };

    const handleDownloadExcel = async () => {
        if (!facturaReporte) return;
        await generateFacturaExcel(facturaReporte);
    };

    const handleBack = () => {
        navigate(APP_PATHS.facturas);
    };

    const handlePaymentSuccess = () => {
        setPaymentModalOpen(false);
        void refetchReporte();
    };

    return {
        facturaId,
        factura: facturaReporte,
        guias: guias ?? [],
        isLoading: isReporteLoading,
        isGuiasLoading,
        isError: isReporteError || isGuiasError,
        error: reporteError,
        canViewFacturas,
        canManageFacturas,
        paymentModalOpen,
        setPaymentModalOpen,
        pagosListModalOpen,
        setPagosListModalOpen,
        handleDownloadPdf,
        handleDownloadExcel,
        handleBack,
        handlePaymentSuccess,
        refetch: () => {
            void refetchReporte();
            void refetchGuias();
        },
    };
}
