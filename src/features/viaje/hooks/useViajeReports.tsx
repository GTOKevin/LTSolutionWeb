import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ViajeGeneralPdf } from '@features/viaje/reports/ui/ViajeGeneralPdf';
import { ViajeGeneralExcelGenerator } from '@features/viaje/reports/lib/ViajeGeneralExcelGenerator';
import { ViajeListExcelGenerator } from '@features/viaje/reports/lib/ViajeListExcelGenerator';
import { ViajeListPdf } from '@features/viaje/reports/ui/ViajeListPdf';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import type { ViajeListItem, ViajeFilters as ViajeFiltersType } from '@entities/viaje/model/types';

export function useViajeReports() {
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

    const handleExportListExcel = useCallback(async (filters: ViajeFiltersType) => {
        try {
            setLoadingMessage("Generando reporte Excel...");
            if (!filters.fechaInicio || !filters.fechaFin) {
                console.error("Fechas inválidas para reporte");
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
            console.error("Error exporting Excel list:", error);
        } finally {
            setLoadingMessage(null);
        }
    }, []);

    const handleExportListPdf = useCallback(async (filters: ViajeFiltersType) => {
        try {
            setLoadingMessage("Generando reporte PDF...");
             if (!filters.fechaInicio || !filters.fechaFin) {
                console.error("Fechas inválidas para reporte");
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
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Viajes_${filters.fechaInicio}_${filters.fechaFin}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting PDF list:", error);
        } finally {
            setLoadingMessage(null);
        }
    }, []);

    const handleExportExcel = useCallback(async (item: ViajeListItem) => {
        try {
            setLoadingMessage("Generando reporte Excel...");
            const reportData = await viajeApi.getGeneralReportData(item.viajeID);
            const generator = new ViajeGeneralExcelGenerator(reportData);
            await generator.generateAndDownload();
        } catch (error) {
            console.error("Error exporting Excel:", error);
        } finally {
            setLoadingMessage(null);
        }
    }, []);

    const handleExportPdf = useCallback(async (item: ViajeListItem) => {
        try {
            setLoadingMessage("Generando reporte PDF...");
            const reportData = await viajeApi.getGeneralReportData(item.viajeID);
            const blob = await pdf(<ViajeGeneralPdf data={reportData} />).toBlob();
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Viaje_${item.viajeID}_General.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setLoadingMessage(null);
        }
    }, []);

    return {
        loadingMessage,
        setLoadingMessage,
        handleExportListExcel,
        handleExportListPdf,
        handleExportExcel,
        handleExportPdf
    };
}
