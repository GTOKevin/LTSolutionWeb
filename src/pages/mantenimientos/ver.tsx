import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PATHS } from '@app/router/model/navigation';
import { mantenimientoApi } from '@/entities/mantenimiento/api/mantenimiento.api';
import { useMantenimientoForm } from '@/features/mantenimiento/hooks/useMantenimientoForm';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';
import { MantenimientoCrudPageContent } from '@/features/mantenimiento/create-edit/ui/MantenimientoCrudPageContent';
import { getMantenimientoCrudTabs } from '@/features/mantenimiento/create-edit/model/crud-tabs';

export function MantenimientoVerPage() {
    const navigate = useNavigate();
    const params = useParams();

    const mantenimientoId = Number(params.id);

    const { data: mantenimiento, isLoading } = useQuery({
        queryKey: ['mantenimiento', mantenimientoId],
        queryFn: () => mantenimientoApi.getById(mantenimientoId),
        enabled: Number.isFinite(mantenimientoId) && mantenimientoId > 0
    });

    const {
        form,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        listaFlotas,
        listaTiposServicio,
        listaEstados
    } = useMantenimientoForm({
        mantenimientoToEdit: mantenimiento ?? null,
        onSuccess: () => {},
        onClose: () => navigate(APP_PATHS.mantenimientos),
        open: true
    });

    const tabs = getMantenimientoCrudTabs(canEditDetails);

    return (
        <CrudTabbedPageShell
            title="Detalle de Mantenimiento"
            subtitle="Información del registro"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(_, value) => setActiveTab(value)}
            loading={isLoading}
            errorMessage={activeTab === 0 ? errorMessage : null}
            onDismissError={() => setErrorMessage(null)}
            footer={
                <Button onClick={() => navigate(APP_PATHS.mantenimientos)} variant="outlined" color="inherit">
                    Cerrar
                </Button>
            }
        >
            <MantenimientoCrudPageContent
                activeTab={activeTab}
                form={form}
                onSubmit={onSubmit}
                effectiveId={effectiveId}
                listaFlotas={listaFlotas}
                listaTiposServicio={listaTiposServicio}
                listaEstados={listaEstados}
                mantenimientoInfo={mantenimiento ?? null}
                isEdit={isEdit}
                createdId={createdId}
                viewOnly
            />
        </CrudTabbedPageShell>
    );
}
