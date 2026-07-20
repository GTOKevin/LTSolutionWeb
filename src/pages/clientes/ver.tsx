import {
    Alert,
    Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { ClienteCrudPageContent, getClienteCrudTabs, useClienteForm } from '@features/cliente/create-edit';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';

export function ClienteVerPage() {
    const navigate = useNavigate();
    const params = useParams();

    const clienteId = Number(params.id);

    const { data: cliente, isLoading } = useQuery({
        queryKey: ['cliente', clienteId],
        queryFn: () => clienteApi.getById(clienteId).then((response) => response.data),
        enabled: Number.isFinite(clienteId) && clienteId > 0,
    });

    const {
        form,
        activeTab,
        errorMessage,
        setErrorMessage,
        handleTabChange,
        onSubmit,
        isEdit,
        effectiveClienteId,
        canEditContacts,
    } = useClienteForm({
        open: true,
        onClose: () => navigate('/app/clientes'),
        onSuccess: () => undefined,
        clienteToEdit: cliente ?? null,
    });

    const loadErrorMessage = !isLoading && !cliente
        ? 'No se pudo cargar el cliente solicitado. Reintente la consulta o vuelva al listado.'
        : null;

    return (
        <CrudTabbedPageShell
            title="Detalle de Cliente"
            subtitle="Consulta la información general y contactos registrados del cliente"
            tabs={getClienteCrudTabs(canEditContacts)}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            loading={isLoading}
            errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
            onDismissError={() => setErrorMessage(null)}
            footer={(
                <Button
                    onClick={() => navigate('/app/clientes')}
                    variant="outlined"
                    color="inherit"
                >
                    Cerrar
                </Button>
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
                    viewOnly
                />
            )}
        </CrudTabbedPageShell>
    );
}
