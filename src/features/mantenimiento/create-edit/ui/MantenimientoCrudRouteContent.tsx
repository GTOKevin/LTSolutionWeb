import {
    Alert,
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
import { APP_PATHS, buildAppDetailPath } from '@shared/config/app-routes';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import { useMantenimientoForm } from '@features/mantenimiento/hooks/useMantenimientoForm';
import { CrudTabbedPageShell } from '@shared/components/ui/CrudTabbedPageShell';
import { getMantenimientoCrudTabs } from '../model/crud-tabs';
import { MantenimientoCrudPageContent } from './MantenimientoCrudPageContent';

type MantenimientoCrudMode = 'create' | 'edit' | 'view';

interface MantenimientoCrudRouteContentProps {
    mode: MantenimientoCrudMode;
}

export function MantenimientoCrudRouteContent({ mode }: MantenimientoCrudRouteContentProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const mantenimientoId = Number(id);
    const shouldLoadMantenimiento = mode !== 'create' && Number.isFinite(mantenimientoId) && mantenimientoId > 0;

    const {
        data: mantenimiento,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['mantenimiento', mantenimientoId],
        queryFn: () => mantenimientoApi.getById(mantenimientoId),
        enabled: shouldLoadMantenimiento,
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
        listaEstados,
    } = useMantenimientoForm({
        mantenimientoToEdit: mantenimiento ?? null,
        onSuccess: () => undefined,
        onCreateSuccess: (createdMantenimientoId) => navigate(buildAppDetailPath(APP_PATHS.mantenimientos, createdMantenimientoId)),
        onClose: () => navigate(APP_PATHS.mantenimientos),
        open: true,
    });

    const tabs = getMantenimientoCrudTabs(canEditDetails);
    const isDirty = form.formState.isDirty;
    const viewOnly = mode === 'view';
    const title = mode === 'view'
        ? 'Detalle de Mantenimiento'
        : createdId || isEdit
            ? 'Gestión de Mantenimiento'
            : 'Registrar Ingreso a Taller';
    const subtitle = mode === 'view'
        ? 'Información del registro'
        : 'Complete los detalles para iniciar un nuevo registro o actualizarlo';
    const loadErrorMessage = mode !== 'create' && isError
        ? 'No se pudo cargar el mantenimiento solicitado. Reintente la consulta o vuelva al listado.'
        : null;

    return (
        <>
            <CrudTabbedPageShell
                title={title}
                subtitle={subtitle}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(_, value) => setActiveTab(value)}
                loading={mode === 'create' ? false : isLoading}
                errorMessage={loadErrorMessage ?? (activeTab === 0 ? errorMessage : null)}
                onDismissError={() => setErrorMessage(null)}
                footer={(
                    <>
                        <Button
                            onClick={() => navigate(APP_PATHS.mantenimientos)}
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
                                form="mantenimiento-form"
                                variant="contained"
                                disabled={isSubmitting || (isEdit && !isDirty)}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isEdit || createdId ? 'Guardar Cambios' : 'Guardar Ingreso'}
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
                        viewOnly={viewOnly}
                    />
                )}
            </CrudTabbedPageShell>

            {!viewOnly ? (
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
            ) : null}
        </>
    );
}
