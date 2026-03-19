import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ViajeGeneralPdf } from '@features/viaje/reports/ui/ViajeGeneralPdf';
import { ViajeGeneralExcelGenerator } from '@features/viaje/reports/lib/ViajeGeneralExcelGenerator';
import { ViajeListExcelGenerator } from '@features/viaje/reports/lib/ViajeListExcelGenerator';
import { ViajeListPdf } from '@features/viaje/reports/ui/ViajeListPdf';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import type { ViajeListItem, ViajeFilters as ViajeFiltersType } from '@entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyGenericError } from '@/shared/utils/api-errors';

export function useViajeReports() {
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleExportListExcel = useCallback(async (filters: ViajeFiltersType) => {
        try {
            setLoadingMessage("Generando reporte Excel...");
            if (!filters.fechaInicio || !filters.fechaFin) {
                showToast({ entity: 'Reporte de viajes', action: 'error', isError: true, message: 'Debe seleccionar un rango de fechas válido.' });
                return;
            }
            const reportData = await viajeApi.getReportList({
                fechaInicio: filters.fechaInicio,
                fechaFin: filters.fechaFin,
                clienteID: filters.clienteID,
                colaboradorID: filters.colaboradorID,
                tractoID: filters.tractoID,
                carretaID: filters.carretaID,
                search: filters.search
            });
            const generator = new ViajeListExcelGenerator(reportData, filters.fechaInicio, filters.fechaFin);
            await generator.generateAndDownload();
        } catch (error) {
            notifyGenericError(showToast, 'Reporte de viajes', 'No se pudo exportar el listado en Excel.', error, 'Error exporting Excel list:');
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    const handleExportListPdf = useCallback(async (filters: ViajeFiltersType) => {
        let objectUrl: string | null = null;
        try {
            setLoadingMessage("Generando reporte PDF...");
             if (!filters.fechaInicio || !filters.fechaFin) {
                showToast({ entity: 'Reporte de viajes', action: 'error', isError: true, message: 'Debe seleccionar un rango de fechas válido.' });
                return;
            }
            const reportData = await viajeApi.getReportList({
                fechaInicio: filters.fechaInicio,
                fechaFin: filters.fechaFin,
                clienteID: filters.clienteID,
                colaboradorID: filters.colaboradorID,
                tractoID: filters.tractoID,
                carretaID: filters.carretaID,
                search: filters.search
            });
            const blob = await pdf(<ViajeListPdf data={reportData} fechaInicio={filters.fechaInicio} fechaFin={filters.fechaFin} />).toBlob();
            
            objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `Reporte_Viajes_${filters.fechaInicio}_${filters.fechaFin}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            notifyGenericError(showToast, 'Reporte de viajes', 'No se pudo exportar el listado en PDF.', error, 'Error exporting PDF list:');
        } finally {
            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
            setLoadingMessage(null);
        }
    }, [showToast]);

    const handleExportExcel = useCallback(async (item: ViajeListItem) => {
        try {
            setLoadingMessage("Generando reporte Excel...");
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
        let objectUrl: string | null = null;
        try {
            setLoadingMessage("Generando reporte PDF...");
            const reportData = await viajeApi.getGeneralReportData(item.viajeID);
            const blob = await pdf(<ViajeGeneralPdf data={reportData} />).toBlob();
            
            objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `Viaje_${item.viajeID}_General.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            notifyGenericError(showToast, 'Reporte de viajes', 'No se pudo exportar el reporte detallado en PDF.', error, 'Error exporting PDF:');
        } finally {
            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
            setLoadingMessage(null);
        }
    }, [showToast]);

    return {
        loadingMessage,
        setLoadingMessage,
        handleExportListExcel,
        handleExportListPdf,
        handleExportExcel,
        handleExportPdf
    };
}
