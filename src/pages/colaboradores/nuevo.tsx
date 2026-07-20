import {
    Button,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useColaboradorForm } from '@/features/colaborador/hooks/useColaboradorForm';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';
import { ColaboradorCrudPageContent } from '@/features/colaborador/create-edit/ui/ColaboradorCrudPageContent';
import { getColaboradorCrudTabs } from '@/features/colaborador/create-edit/model/crud-tabs';

export function ColaboradorNuevoPage() {
    const navigate = useNavigate();

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
        colaboradorToEdit: null,
        onSuccess: () => {},
        onClose: () => navigate('/app/colaboradores'),
        open: true
    });

    const title = createdId ? 'Gestión de Colaborador' : 'Nuevo Colaborador';
    const subtitle = 'Gestión de información personal, licencias y documentos';
    const tabs = getColaboradorCrudTabs(canEditDetails);
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
            tabsProps={{ variant: 'scrollable', scrollButtons: 'auto' }}
            footer={
                <>
                    <Button onClick={() => navigate('/app/colaboradores')} color="inherit" variant="outlined">
                        {activeTab === 0 ? 'Cancelar' : 'Cerrar'}
                    </Button>
                    {activeTab === 0 ? (
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
            <ColaboradorCrudPageContent
                activeTab={activeTab}
                form={form}
                onSubmit={onSubmit}
                effectiveId={effectiveId}
                roles={roles?.data ?? []}
                generos={generos?.data ?? []}
                monedas={monedas?.data ?? []}
                isEdit={isEdit}
            />
        </CrudTabbedPageShell>
    );
}
