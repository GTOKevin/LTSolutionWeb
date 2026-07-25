import {
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PATHS } from '@app/router/model/navigation';
import { flotaApi } from '@/entities/flota/api/flota.api';
import { FLOTA_QUERY_KEYS } from '@features/flota';
import { useFlotaForm } from '@features/flota/hooks/useFlotaForm';
import { CrudTabbedPageShell } from '@shared/components/ui/CrudTabbedPageShell';
import { getFlotaCrudTabs } from '../model/crud-tabs';
import { FlotaCrudPageContent } from './FlotaCrudPageContent';

type FlotaCrudMode = 'create' | 'edit' | 'view';

interface FlotaCrudRouteContentProps {
    mode: FlotaCrudMode;
}

export function FlotaCrudRouteContent({ mode }: FlotaCrudRouteContentProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const flotaId = Number(id);
    const shouldLoadFlota = mode !== 'create' && Number.isFinite(flotaId) && flotaId > 0;

    const {
        data: flota,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.detail(flotaId),
        queryFn: () => flotaApi.getById(flotaId),
        enabled: shouldLoadFlota,
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
        listaMedida,
    } = useFlotaForm({
        flotaToEdit: flota ?? null,
        onSuccess: () => undefined,
        onClose: () => navigate(APP_PATHS.flotas),
        open: true,
    });

    const title = mode === 'view'
        ? 'Detalle del Vehículo'
        : createdFlotaId || isEdit
            ? 'Gestión de Vehículo'
            : 'Nuevo Vehículo';
    const subtitle = mode === 'view'
        ? 'Consulta la información técnica y documentos registrados del vehículo'
        : 'Administre la información técnica y documentos del vehículo';
    const loadErrorMessage = mode !== 'create' && isError
        ? 'No se pudo cargar el vehículo solicitado. Reintente la consulta o vuelva al listado.'
        : null;
    const tabs = getFlotaCrudTabs(canEditDocs);
    const isDirty = form.formState.isDirty;
    const viewOnly = mode === 'view';

    return (
        <CrudTabbedPageShell
            title={title}
            subtitle={subtitle}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(_, value) => setActiveTab(value)}
            loading={mode === 'create' ? false : isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            footer={(
                <>
                    <Button
                        onClick={() => navigate(APP_PATHS.flotas)}
                        variant="outlined"
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        {viewOnly || activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {loadErrorMessage ? (
                        <Button onClick={() => refetch()} variant="outlined">
                            Reintentar
                        </Button>
                    ) : null}

                    {!viewOnly && activeTab === 0 && !loadErrorMessage ? (
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
            )}
        >
            {loadErrorMessage ? (
                <Alert severity="error" sx={{ m: 3 }}>
                    {loadErrorMessage}
                </Alert>
            ) : (
                <FlotaCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={onSubmit}
                    effectiveFlotaId={effectiveFlotaId}
                    listaFlota={listaFlota}
                    listaPeso={listaPeso}
                    listaMedida={listaMedida}
                    viewOnly={viewOnly}
                />
            )}
        </CrudTabbedPageShell>
    );
}
