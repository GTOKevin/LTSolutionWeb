import {
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { flotaApi } from '@/entities/flota/api/flota.api';
import { FLOTA_QUERY_KEYS } from '@/features/flota/model/query-keys';
import { APP_PATHS } from '@app/router/model/navigation';
import { FlotaCrudPageContent, useFlotaForm } from '@features/flota/create-edit';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';
import { getFlotaCrudTabs } from '@features/flota/create-edit';

export function FlotaEditarPage() {
    const navigate = useNavigate();
    const params = useParams();

    const flotaId = Number(params.id);

    const { data: flota, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.detail(flotaId),
        queryFn: () => flotaApi.getById(flotaId),
        enabled: Number.isFinite(flotaId) && flotaId > 0
    });

    const {
        form,
        isSubmitting,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveFlotaId,
        canEditDocs,
        isEdit,
        createdFlotaId,
        listaFlota,
        listaPeso,
        listaMedida
    } = useFlotaForm({
        flotaToEdit: flota ?? null,
        onSuccess: () => {},
        onClose: () => navigate(APP_PATHS.flotas),
        open: true
    });

    const tabs = getFlotaCrudTabs(canEditDocs);
    const isDirty = form.formState.isDirty;
    const loadErrorMessage = isError ? 'No se pudo cargar el vehículo solicitado. Reintente la consulta o vuelva al listado.' : null;

    return (
        <CrudTabbedPageShell
            title="Gestión de Vehículo"
            subtitle="Administre la información técnica y documentos del vehículo"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(_, value) => setActiveTab(value)}
            loading={isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            footer={
                <>
                    <Button
                        onClick={() => navigate(APP_PATHS.flotas)}
                        variant="outlined"
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {loadErrorMessage ? (
                        <Button onClick={() => refetch()} variant="outlined">
                            Reintentar
                        </Button>
                    ) : null}

                    {activeTab === 0 && !loadErrorMessage ? (
                        <Button
                            type="submit"
                            form="flota-form"
                            variant="contained"
                            disabled={isSubmitting || (isEdit && !isDirty)}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isEdit || createdFlotaId ? 'Guardar Cambios' : 'Crear Vehículo'}
                        </Button>
                    ) : null}
                </>
            }
        >
            {!loadErrorMessage ? (
                <FlotaCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={onSubmit}
                    effectiveFlotaId={effectiveFlotaId}
                    listaFlota={listaFlota}
                    listaPeso={listaPeso}
                    listaMedida={listaMedida}
                />
            ) : (
                <Alert severity="error" sx={{ m: 3 }}>
                    {loadErrorMessage}
                </Alert>
            )}
        </CrudTabbedPageShell>
    );
}
