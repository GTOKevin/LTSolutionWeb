import { useMemo } from 'react';
import { useViajeDetailReports } from '../reports/hooks/useViajeDetailReports';
import { useViajeListReports } from '../reports/hooks/useViajeListReports';

export function useViajeReports() {
    const listReports = useViajeListReports();
    const detailReports = useViajeDetailReports();
    const loadingMessage = listReports.loadingMessage ?? detailReports.loadingMessage;
    const setLoadingMessage = useMemo(
        () => (message: string | null) => {
            listReports.setLoadingMessage(message);
            detailReports.setLoadingMessage(message);
        },
        [detailReports, listReports],
    );

    return {
        loadingMessage,
        setLoadingMessage,
        handleExportListExcel: listReports.handleExportListExcel,
        handleExportListPdf: listReports.handleExportListPdf,
        handleExportExcel: detailReports.handleExportExcel,
        handleExportPdf: detailReports.handleExportPdf,
    };
}
