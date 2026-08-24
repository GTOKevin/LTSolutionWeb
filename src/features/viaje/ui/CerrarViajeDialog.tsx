import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { useCerrarViaje } from '../hooks/useCerrarViaje';

interface CerrarViajeDialogProps {
    open: boolean;
    viajeID: number;
    viajeCodigo: string | null | undefined;
    onClose: () => void;
}

/**
 * Diálogo único de "Cerrar Viaje" para todo el módulo (tabla, kanban y detalle).
 * Encapsula `useCerrarViaje` + `ConfirmDialog` con el contrato actual:
 * `POST /viaje/{id}/cerrar`, permiso `VIAJES.CERRAR` y toast `cerrar`.
 * La mutation invalida listas/edit/detalle una sola vez (en `useCerrarViaje`).
 */
export function CerrarViajeDialog({ open, viajeID, viajeCodigo, onClose }: CerrarViajeDialogProps) {
    const cerrarMutation = useCerrarViaje(onClose);
    const codigoVisible = viajeCodigo || `#${viajeID}`;

    return (
        <ConfirmDialog
            open={open}
            title="Cerrar Viaje"
            content={`¿Estás seguro de que deseas cerrar el viaje ${codigoVisible}? Al cerrar se bloquearán las modificaciones y se habilitarán los reportes finales.`}
            confirmText="Cerrar viaje"
            cancelText="Cancelar"
            severity="primary"
            isLoading={cerrarMutation.isPending}
            onClose={onClose}
            onConfirm={() => cerrarMutation.mutate(viajeID)}
        />
    );
}