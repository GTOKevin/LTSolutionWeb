import {
    Button,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ClienteCrudPageContent, getClienteCrudTabs, useClienteForm } from '@features/cliente/create-edit';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';

export function ClienteNuevoPage() {
    const navigate = useNavigate();

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
        onClose: () => navigate('/app/clientes'),
        onSuccess: () => {},
        clienteToEdit: null
    });

    const title = createdClientId ? 'Gestión de Cliente' : 'Nuevo Cliente';
    const subtitle = createdClientId ? 'Administre la información y contactos del cliente' : 'Complete la información para registrar un nuevo cliente';
    const tabs = getClienteCrudTabs(canEditContacts);
    const isDirty = form.formState.isDirty;

    return (
        <CrudTabbedPageShell
            title={title}
            subtitle={subtitle}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            errorMessage={activeTab === 0 ? errorMessage : null}
            onDismissError={() => setErrorMessage(null)}
            footer={
                <>
                    <Button
                        onClick={() => navigate('/app/clientes')}
                        variant="outlined"
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {activeTab === 0 ? (
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
            <ClienteCrudPageContent
                activeTab={activeTab}
                form={form}
                onSubmit={onSubmit}
                effectiveClienteId={effectiveClienteId}
                isEdit={isEdit}
            />
        </CrudTabbedPageShell>
    );
}
