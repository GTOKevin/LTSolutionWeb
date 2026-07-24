import { useViajesPageController, ViajesFilters, ViajesPageContent, ViajesOverviewShell } from '@features/viaje/list';

export function ViajesPage() {
    const controller = useViajesPageController();

    return (
        <ViajesOverviewShell
            title="Gestión de Viajes"
            subtitle="Monitoreo y administración eficiente de la flota y rutas activas en tiempo real."
            canCreate={controller.canManageViajes}
            onCreate={controller.handleCreate}
            agendados={controller.totals.agendados}
            enTransito={controller.totals.enTransito}
            completados={controller.totals.completados}
            filters={<ViajesFilters onSearch={controller.setFilters} />}
            viewMode={controller.viewMode}
            onViewModeChange={controller.setViewMode}
            canExport={controller.canViewViajes}
            onExportListPdf={() => controller.handleExportListPdf(controller.filters)}
            onExportListExcel={() => controller.handleExportListExcel(controller.filters)}
        >
            <ViajesPageContent controller={controller} />
        </ViajesOverviewShell>
    );
}
