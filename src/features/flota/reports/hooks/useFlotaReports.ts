import { useCallback, useState } from 'react';
import { flotaApi, type FlotaReportFormat } from '@entities/flota/api/flota.api';
import type { FlotaParams } from '@entities/flota/model/types';
import { downloadBlob } from '@shared/utils/file-utils';
import { useToast } from '@shared/components/ui/Toast';
import { notifyGenericError } from '@shared/utils/api-errors';

/**
 * Dispara las descargas de reportes de flota generadas por el backend.
 * No duplica generación Excel/PDF en el cliente.
 */
export function useFlotaReports() {
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleExportInventario = useCallback(async (format: FlotaReportFormat, filters?: FlotaParams) => {
        try {
            setLoadingMessage(format === 'excel' ? 'Generando inventario Excel...' : 'Generando inventario PDF...');
            const blob = await flotaApi.downloadReporteInventario(format, filters);
            const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            downloadBlob(blob, `InventarioFlota_${stamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        } catch (error) {
            notifyGenericError(
                showToast,
                'Inventario de flota',
                `No se pudo exportar el inventario en ${format === 'excel' ? 'Excel' : 'PDF'}.`,
                error,
                'Error exporting flota inventory:',
            );
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    const handleDownloadFicha = useCallback(async (flotaId: number, placa?: string) => {
        try {
            setLoadingMessage('Generando ficha técnica...');
            const blob = await flotaApi.downloadFichaPdf(flotaId);
            downloadBlob(blob, `FichaFlota_${placa ?? flotaId}.pdf`);
        } catch (error) {
            notifyGenericError(
                showToast,
                'Ficha técnica',
                'No se pudo generar la ficha técnica de la unidad.',
                error,
                'Error exporting flota ficha:',
            );
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    return {
        loadingMessage,
        handleExportInventario,
        handleDownloadFicha,
    };
}
