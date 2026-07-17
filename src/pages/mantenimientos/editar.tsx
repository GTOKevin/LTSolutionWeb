import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { mantenimientoApi } from '@/entities/mantenimiento/api/mantenimiento.api';
import { useMantenimientoForm } from '@/features/mantenimiento/hooks/useMantenimientoForm';
import { CrudTabbedPageShell } from '@/widgets/crud-page/ui/CrudTabbedPageShell';
import { MantenimientoCrudPageContent } from '@/features/mantenimiento/create-edit/ui/MantenimientoCrudPageContent';
import { getMantenimientoCrudTabs } from '@/features/mantenimiento/create-edit/model/crud-tabs';

export function MantenimientoEditarPage() {
    const navigate = useNavigate();
    const params = useParams();

    const mantenimientoId = Number(params.id);

    const { data: mantenimiento, isLoading } = useQuery({
        queryKey: ['mantenimiento', mantenimientoId],
        queryFn: () => mantenimientoApi.getById(mantenimientoId),
        enabled: Number.isFinite(mantenimientoId) && mantenimientoId > 0
    });

    const {
        form,
        isSubmitting,
        onSubmit,
        handleConfirmSave,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        confirmationOpen,
        setConfirmationOpen,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        listaFlotas,
        listaTiposServicio,
        listaEstados
    } = useMantenimientoForm({
        mantenimientoToEdit: mantenimiento ?? null,
        onSuccess: () => {},
        onClose: () => navigate('/app/mantenimientos'),
        open: true
    });

    const tabs = getMantenimientoCrudTabs(canEditDetails);
    const isDirty = form.formState.isDirty;

    return (
        <>
            <CrudTabbedPageShell
                title="Gestión de Mantenimiento"
                subtitle="Complete los detalles para iniciar un nuevo registro o actualizarlo"
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(_, value) => setActiveTab(value)}
                loading={isLoading}
                errorMessage={activeTab === 0 ? errorMessage : null}
                onDismissError={() => setErrorMessage(null)}
                footer={
                    <>
                        <Button
                            onClick={() => navigate('/app/mantenimientos')}
                            variant="outlined"
                            color="inherit"
                            disabled={isSubmitting}
                        >
                            {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                        </Button>

                        {activeTab === 0 ? (
                            <Button
                                type="submit"
                                form="mantenimiento-form"
                                variant="contained"
                                disabled={isSubmitting || (isEdit && !isDirty)}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isEdit || createdId ? 'Guardar Cambios' : 'Guardar Ingreso'}
                            </Button>
                        ) : null}
                    </>
                }
            >
                <MantenimientoCrudPageContent
                    activeTab={activeTab}
                    form={form}
                    onSubmit={onSubmit}
                    effectiveId={effectiveId}
                    listaFlotas={listaFlotas}
                    listaTiposServicio={listaTiposServicio}
                    listaEstados={listaEstados}
                    mantenimientoInfo={mantenimiento ?? null}
                    isEdit={isEdit}
                    createdId={createdId}
                />
            </CrudTabbedPageShell>

            <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
                <DialogTitle>Confirmar Finalización</DialogTitle>
                <DialogContent>
                    <Typography>
                        Una vez se ha completado el registro, no podrá realizar modificaciones sobre
                        este registro y sus detalles.
                        <br />
                        <br />
                        ¿Está seguro de guardar?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmationOpen(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmSave} variant="contained" color="primary">
                        Confirmar y Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
