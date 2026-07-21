import {
    Alert,
    Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { flotaApi } from '@/entities/flota/api/flota.api';
import { useFlotaForm } from '@/features/flota/hooks/useFlotaForm';
import { FLOTA_QUERY_KEYS } from '@/features/flota/model/query-keys';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';
import { FlotaCrudPageContent } from '@/features/flota/create-edit/ui/FlotaCrudPageContent';
import { getFlotaCrudTabs } from '@/features/flota/create-edit/model/crud-tabs';

export function FlotaVerPage() {
    const navigate = useNavigate();
    const params = useParams();

    const flotaId = Number(params.id);

    const { data: flota, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.detail(flotaId),
        queryFn: () => flotaApi.getById(flotaId).then((response) => response.data),
        enabled: Number.isFinite(flotaId) && flotaId > 0,
    });

    const {
        form,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveFlotaId,
        canEditDocs,
        listaFlota,
        listaPeso,
        listaMedida,
    } = useFlotaForm({
        flotaToEdit: flota ?? null,
        onSuccess: () => undefined,
        onClose: () => navigate('/app/flotas'),
        open: true,
    });

    const tabs = getFlotaCrudTabs(canEditDocs);
    const loadErrorMessage = isError ? 'No se pudo cargar el vehiculo solicitado. Reintente la consulta o vuelva al listado.' : null;

    return (
        <CrudTabbedPageShell
            title="Detalle del Vehiculo"
            subtitle="Consulta la informacion tecnica y documentos registrados del vehiculo"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(_, value) => setActiveTab(value)}
            loading={isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            footer={(
                <>
                    <Button
                        onClick={() => navigate('/app/flotas')}
                        variant="outlined"
                        color="inherit"
                    >
                        Cerrar
                    </Button>
                    {loadErrorMessage ? (
                        <Button onClick={() => refetch()} variant="outlined">
                            Reintentar
                        </Button>
                    ) : null}
                </>
            )}
        >
            {!loadErrorMessage ? (
                <FlotaCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={() => undefined}
                    effectiveFlotaId={effectiveFlotaId}
                    listaFlota={listaFlota}
                    listaPeso={listaPeso}
                    listaMedida={listaMedida}
                    viewOnly
                />
            ) : (
                <Alert severity="error" sx={{ m: 3 }}>
                    {loadErrorMessage}
                </Alert>
            )}
        </CrudTabbedPageShell>
    );
}
