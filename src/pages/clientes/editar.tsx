import {
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { APP_PATHS } from '@app/router/model/navigation';
import { ClienteCrudPageContent, getClienteCrudTabs, useClienteForm } from '@features/cliente/create-edit';
import { CrudTabbedPageShell } from '@widgets/crud-page';

export function ClienteEditarPage() {
    const navigate = useNavigate();
    const params = useParams();

    const clienteId = Number(params.id);

    const { data: cliente, isLoading } = useQuery({
        queryKey: ['cliente', clienteId],
        queryFn: () => clienteApi.getById(clienteId),
        enabled: Number.isFinite(clienteId) && clienteId > 0
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
        isSubmitting
    } = useClienteForm({
        open: true,
        onClose: () => navigate(APP_PATHS.clientes),
        onSuccess: () => {},
        clienteToEdit: cliente ?? null
    });

    const title = 'Gestión de Cliente';
    const subtitle = 'Administre la información y contactos del cliente';
    const tabs = getClienteCrudTabs(canEditContacts);
    const isDirty = form.formState.isDirty;
    const loadErrorMessage = !isLoading && !cliente
        ? 'No se pudo cargar el cliente solicitado. Reintente la consulta o vuelva al listado.'
        : null;

    return (
        <CrudTabbedPageShell
            title={title}
            subtitle={subtitle}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            loading={isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            footer={
                <>
                    <Button
                        onClick={() => navigate(APP_PATHS.clientes)}
                        variant="outlined"
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {activeTab === 0 && !loadErrorMessage ? (
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
            }
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
                />
            )}
        </CrudTabbedPageShell>
    );
}
