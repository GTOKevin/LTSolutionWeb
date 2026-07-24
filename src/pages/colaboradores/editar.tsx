import {
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { COLABORADOR_QUERY_KEYS } from '@/features/colaborador/model/query-keys';
import { APP_PATHS } from '@app/router/model/navigation';
import { ColaboradorCrudPageContent, useColaboradorForm } from '@features/colaborador/create-edit';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';
import { getColaboradorCrudTabs } from '@features/colaborador/create-edit';

export function ColaboradorEditarPage() {
    const navigate = useNavigate();
    const params = useParams();

    const colaboradorId = Number(params.id);

    const { data: colaborador, isLoading, isError, refetch } = useQuery({
        queryKey: COLABORADOR_QUERY_KEYS.detail(colaboradorId),
        queryFn: () => colaboradorApi.getById(colaboradorId),
        enabled: Number.isFinite(colaboradorId) && colaboradorId > 0
    });

    const {
        form,
        isSubmitting,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        roles,
        generos,
        monedas
    } = useColaboradorForm({
        colaboradorToEdit: colaborador ?? null,
        onSuccess: () => {},
        onClose: () => navigate(APP_PATHS.colaboradores),
        open: true
    });

    const tabs = getColaboradorCrudTabs(canEditDetails);
    const isDirty = form.formState.isDirty;
    const loadErrorMessage = isError ? 'No se pudo cargar el colaborador solicitado. Reintente la consulta o vuelva al listado.' : null;

    return (
        <CrudTabbedPageShell
            title="Gestión de Colaborador"
            subtitle="Gestión de información personal, licencias y documentos"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(_, value) => setActiveTab(value)}
            loading={isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            tabsProps={{ variant: 'scrollable', scrollButtons: 'auto' }}
            footer={
                <>
                    <Button onClick={() => navigate(APP_PATHS.colaboradores)} color="inherit" variant="outlined">
                        {activeTab === 0 ? 'Cancelar' : 'Cerrar'}
                    </Button>
                    {loadErrorMessage ? (
                        <Button onClick={() => refetch()} variant="outlined">
                            Reintentar
                        </Button>
                    ) : null}
                    {activeTab === 0 && !loadErrorMessage ? (
                        <Button
                            type="submit"
                            form="colab-form"
                            variant="contained"
                            disabled={isSubmitting || (isEdit && !isDirty)}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isEdit || createdId ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    ) : null}
                </>
            }
        >
            {!loadErrorMessage ? (
                <ColaboradorCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={onSubmit}
                    effectiveId={effectiveId}
                    roles={roles}
                    generos={generos}
                    monedas={monedas}
                    isEdit={isEdit}
                />
            ) : (
                <Alert severity="error" sx={{ m: 3 }}>
                    {loadErrorMessage}
                </Alert>
            )}
        </CrudTabbedPageShell>
    );
}
