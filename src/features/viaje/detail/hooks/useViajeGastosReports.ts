import { useCallback, useState } from 'react';
import { viajeGastoApi } from '@entities/viaje/api/viaje-gasto.api';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyGenericError } from '@/shared/utils/api-errors';

function downloadBlob(blob: Blob, filename: string) {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
}

export function useViajeGastosReports() {
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleExportExcel = useCallback(async (viajeId: number) => {
        try {
            setLoadingMessage('Generando reporte Excel de gastos...');
            const blob = await viajeGastoApi.getReportExcel(viajeId);
            downloadBlob(blob, `GastosViaje_${viajeId}.xlsx`);
        } catch (error) {
            notifyGenericError(showToast, 'Gastos del viaje', 'No se pudo exportar los gastos en Excel.', error, 'Error exporting gastos Excel:');
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    const handleExportPdf = useCallback(async (viajeId: number) => {
        try {
            setLoadingMessage('Generando reporte PDF de gastos...');
            const blob = await viajeGastoApi.getReportPdf(viajeId);
            downloadBlob(blob, `GastosViaje_${viajeId}.pdf`);
        } catch (error) {
            notifyGenericError(showToast, 'Gastos del viaje', 'No se pudo exportar los gastos en PDF.', error, 'Error exporting gastos PDF:');
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    return {
        loadingMessage,
        handleExportExcel,
        handleExportPdf,
    };
}