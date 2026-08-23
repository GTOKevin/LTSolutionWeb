import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ViajeGeneralExcelGenerator } from '../lib/ViajeGeneralExcelGenerator';
import { ViajeGeneralPdf } from '../ui/ViajeGeneralPdf';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import type { ViajeListItem } from '@entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyGenericError } from '@/shared/utils/api-errors';
import { downloadBlob } from '@/shared/utils/file-utils';

export function useViajeDetailReports() {
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleExportExcel = useCallback(async (item: ViajeListItem) => {
        try {
            setLoadingMessage('Generando reporte Excel...');
            const reportData = await viajeApi.getGeneralReportData(item.viajeID);
            const generator = new ViajeGeneralExcelGenerator(reportData);
            await generator.generateAndDownload();
        } catch (error) {
            notifyGenericError(showToast, 'Reporte de viajes', 'No se pudo exportar el reporte detallado en Excel.', error, 'Error exporting Excel:');
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    const handleExportPdf = useCallback(async (item: ViajeListItem) => {
        try {
            setLoadingMessage('Generando reporte PDF...');
            const reportData = await viajeApi.getGeneralReportData(item.viajeID);
            const blob = await pdf(<ViajeGeneralPdf data={reportData} />).toBlob();
            downloadBlob(blob, `Viaje_${item.viajeID}_General.pdf`);
        } catch (error) {
            notifyGenericError(showToast, 'Reporte de viajes', 'No se pudo exportar el reporte detallado en PDF.', error, 'Error exporting PDF:');
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    return {
        loadingMessage,
        setLoadingMessage,
        handleExportExcel,
        handleExportPdf,
    };
}
