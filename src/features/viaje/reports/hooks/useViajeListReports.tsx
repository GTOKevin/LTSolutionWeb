import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ViajeListExcelGenerator } from '../lib/ViajeListExcelGenerator';
import { ViajeListPdf } from '../ui/ViajeListPdf';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import type { ViajeFilters as ViajeFiltersType } from '@entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyGenericError } from '@/shared/utils/api-errors';
import { downloadBlob } from '@/shared/utils/file-utils';

export function useViajeListReports() {
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleExportListExcel = useCallback(async (filters: ViajeFiltersType) => {
        try {
            setLoadingMessage('Generando reporte Excel...');
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
                search: filters.search,
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
        try {
            setLoadingMessage('Generando reporte PDF...');
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
                search: filters.search,
            });
            const blob = await pdf(
                <ViajeListPdf data={reportData} fechaInicio={filters.fechaInicio} fechaFin={filters.fechaFin} />,
            ).toBlob();
            downloadBlob(blob, `Reporte_Viajes_${filters.fechaInicio}_${filters.fechaFin}.pdf`);
        } catch (error) {
            notifyGenericError(showToast, 'Reporte de viajes', 'No se pudo exportar el listado en PDF.', error, 'Error exporting PDF list:');
        } finally {
            setLoadingMessage(null);
        }
    }, [showToast]);

    return {
        loadingMessage,
        setLoadingMessage,
        handleExportListExcel,
        handleExportListPdf,
    };
}
