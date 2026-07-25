import {
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PATHS } from '@app/router/model/navigation';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { CrudTabbedPageShell } from '@shared/components/ui/CrudTabbedPageShell';
import { getClienteCrudTabs } from '../model/crud-tabs';
import { useClienteForm } from '@features/cliente/hooks/useClienteForm';
import { ClienteCrudPageContent } from './ClienteCrudPageContent';

type ClienteCrudMode = 'create' | 'edit' | 'view';

interface ClienteCrudRouteContentProps {
    mode: ClienteCrudMode;
}

export function ClienteCrudRouteContent({ mode }: ClienteCrudRouteContentProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const clienteId = Number(id);
    const shouldLoadCliente = mode !== 'create' && Number.isFinite(clienteId) && clienteId > 0;

    const {
        data: cliente,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['cliente', clienteId],
        queryFn: () => clienteApi.getById(clienteId),
        enabled: shouldLoadCliente,
    });

    const {
        form,
        activeTab,
        errorMessage,
        setErrorMessage,
        handleTabChange,
        onSubmit,
        isEdit,
        createdClientId,
        effectiveClienteId,
        canEditContacts,
        isSubmitting,
    } = useClienteForm({
        open: true,
        onClose: () => navigate(APP_PATHS.clientes),
        onSuccess: () => undefined,
        clienteToEdit: cliente ?? null,
    });

    const title = mode === 'view'
        ? 'Detalle de Cliente'
        : createdClientId || isEdit
            ? 'Gestión de Cliente'
            : 'Nuevo Cliente';
    const subtitle = mode === 'view'
        ? 'Consulta la información general y contactos registrados del cliente'
        : createdClientId || isEdit
            ? 'Administre la información y contactos del cliente'
            : 'Complete la información para registrar un nuevo cliente';
    const loadErrorMessage = mode !== 'create' && (isError || (!isLoading && !cliente))
        ? 'No se pudo cargar el cliente solicitado. Reintente la consulta o vuelva al listado.'
        : null;
    const isDirty = form.formState.isDirty;
    const viewOnly = mode === 'view';

    return (
        <CrudTabbedPageShell
            title={title}
            subtitle={subtitle}
            tabs={getClienteCrudTabs(canEditContacts)}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            loading={mode === 'create' ? false : isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            footer={(
                <>
                    <Button
                        onClick={() => navigate(APP_PATHS.clientes)}
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
                            form="cliente-form"
                            variant="contained"
                            disabled={isSubmitting || (isEdit && !isDirty)}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isEdit || createdClientId ? 'Guardar Cambios' : 'Registrar y Continuar'}
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
                <ClienteCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={onSubmit}
                    effectiveClienteId={effectiveClienteId}
                    isEdit={isEdit}
                    viewOnly={viewOnly}
                />
            )}
        </CrudTabbedPageShell>
    );
}
