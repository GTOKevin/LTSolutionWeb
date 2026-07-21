import {
    Alert,
    Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { useColaboradorForm } from '@/features/colaborador/hooks/useColaboradorForm';
import { COLABORADOR_QUERY_KEYS } from '@/features/colaborador/model/query-keys';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';
import { ColaboradorCrudPageContent } from '@/features/colaborador/create-edit/ui/ColaboradorCrudPageContent';
import { getColaboradorCrudTabs } from '@/features/colaborador/create-edit/model/crud-tabs';

export function ColaboradorVerPage() {
    const navigate = useNavigate();
    const params = useParams();

    const colaboradorId = Number(params.id);

    const { data: colaborador, isLoading, isError, refetch } = useQuery({
        queryKey: COLABORADOR_QUERY_KEYS.detail(colaboradorId),
        queryFn: () => colaboradorApi.getById(colaboradorId).then((response) => response.data),
        enabled: Number.isFinite(colaboradorId) && colaboradorId > 0,
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
        roles,
        generos,
        monedas,
    } = useColaboradorForm({
        colaboradorToEdit: colaborador ?? null,
        onSuccess: () => undefined,
        onClose: () => navigate('/app/colaboradores'),
        open: true,
    });

    const tabs = getColaboradorCrudTabs(canEditDetails);
    const loadErrorMessage = isError ? 'No se pudo cargar el colaborador solicitado. Reintente la consulta o vuelva al listado.' : null;

    return (
        <CrudTabbedPageShell
            title="Detalle del Colaborador"
            subtitle="Consulta informacion personal, licencias, documentos y pagos registrados"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(_, value) => setActiveTab(value)}
            loading={isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            tabsProps={{ variant: 'scrollable', scrollButtons: 'auto' }}
            footer={(
                <>
                    <Button
                        onClick={() => navigate('/app/colaboradores')}
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
                <ColaboradorCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={onSubmit}
                    effectiveId={effectiveId}
                    roles={roles?.data ?? []}
                    generos={generos?.data ?? []}
                    monedas={monedas?.data ?? []}
                    isEdit
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
