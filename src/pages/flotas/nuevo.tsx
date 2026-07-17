import {
    Button,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFlotaForm } from '@features/flota/hooks/useFlotaForm';
import { CrudTabbedPageShell } from '@widgets/crud-page/ui/CrudTabbedPageShell';
import { FlotaCrudPageContent } from '@features/flota/create-edit/ui/FlotaCrudPageContent';
import { getFlotaCrudTabs } from '@features/flota/create-edit/model/crud-tabs';

export function FlotaNuevoPage() {
    const navigate = useNavigate();

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
        flotaToEdit: null,
        onSuccess: () => {},
        onClose: () => navigate('/app/flotas'),
        open: true
    });

    const title = createdFlotaId ? 'Gestión de Vehículo' : 'Nuevo Vehículo';
    const subtitle = 'Administre la información técnica y documentos del vehículo';
    const tabs = getFlotaCrudTabs(canEditDocs);
    const isDirty = form.formState.isDirty;

    return (
        <CrudTabbedPageShell
            title={title}
            subtitle={subtitle}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(_, value) => setActiveTab(value)}
            errorMessage={activeTab === 0 ? errorMessage : null}
            onDismissError={() => setErrorMessage(null)}
            footer={
                <>
                    <Button
                        onClick={() => navigate('/app/flotas')}
                        variant="outlined"
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {activeTab === 0 ? (
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
            <FlotaCrudPageContent
                activeTab={activeTab}
                form={form}
                onSubmit={onSubmit}
                effectiveFlotaId={effectiveFlotaId}
                listaFlota={listaFlota}
                listaPeso={listaPeso}
                listaMedida={listaMedida}
            />
        </CrudTabbedPageShell>
    );
}

