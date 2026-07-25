import {
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PATHS } from '@app/router/model/navigation';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { COLABORADOR_QUERY_KEYS } from '../../model/query-keys';
import { useColaboradorForm } from '@features/colaborador/hooks/useColaboradorForm';
import { CrudTabbedPageShell } from '@shared/components/ui/CrudTabbedPageShell';
import { getColaboradorCrudTabs } from '../model/crud-tabs';
import { ColaboradorCrudPageContent } from './ColaboradorCrudPageContent';

type ColaboradorCrudMode = 'create' | 'edit' | 'view';

interface ColaboradorCrudRouteContentProps {
    mode: ColaboradorCrudMode;
}

export function ColaboradorCrudRouteContent({ mode }: ColaboradorCrudRouteContentProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const colaboradorId = Number(id);
    const shouldLoadColaborador = mode !== 'create' && Number.isFinite(colaboradorId) && colaboradorId > 0;

    const {
        data: colaborador,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: COLABORADOR_QUERY_KEYS.detail(colaboradorId),
        queryFn: () => colaboradorApi.getById(colaboradorId),
        enabled: shouldLoadColaborador,
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
        monedas,
    } = useColaboradorForm({
        colaboradorToEdit: colaborador ?? null,
        onSuccess: () => undefined,
        onClose: () => navigate(APP_PATHS.colaboradores),
        open: true,
    });

    const title = mode === 'view'
        ? 'Detalle del Colaborador'
        : createdId || isEdit
            ? 'Gestión de Colaborador'
            : 'Nuevo Colaborador';
    const subtitle = mode === 'view'
        ? 'Consulta información personal, licencias, documentos y pagos registrados'
        : 'Gestión de información personal, licencias y documentos';
    const loadErrorMessage = mode !== 'create' && isError
        ? 'No se pudo cargar el colaborador solicitado. Reintente la consulta o vuelva al listado.'
        : null;
    const tabs = getColaboradorCrudTabs(canEditDetails);
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
            tabsProps={{ variant: 'scrollable', scrollButtons: 'auto' }}
            footer={(
                <>
                    <Button
                        onClick={() => navigate(APP_PATHS.colaboradores)}
                        color="inherit"
                        variant="outlined"
                        disabled={isSubmitting}
                    >
                        {viewOnly || activeTab !== 0 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {loadErrorMessage ? (
                        <Button onClick={() => refetch()} variant="outlined">
                            Reintentar
                        </Button>
                    ) : null}

                    {!viewOnly && activeTab === 0 && !loadErrorMessage ? (
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
            )}
        >
            {loadErrorMessage ? (
                <Alert severity="error" sx={{ m: 3 }}>
                    {loadErrorMessage}
                </Alert>
            ) : (
                <ColaboradorCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={onSubmit}
                    effectiveId={effectiveId}
                    roles={roles}
                    generos={generos}
                    monedas={monedas}
                    isEdit={isEdit}
                    viewOnly={viewOnly}
                />
            )}
        </CrudTabbedPageShell>
    );
}
