
export type ToastAction = 'create' | 'update' | 'delete' | 'error' | 'reopen';

export const TOAST_ACTIONS: Record<ToastAction, { label: string; severity: 'success' | 'error' | 'info' | 'warning' }> = {
    create: { label: 'Registrado', severity: 'success' },
    update: { label: 'Editado', severity: 'success' },
    delete: { label: 'Eliminado', severity: 'error' },
    reopen: { label: 'Reabierto', severity: 'warning' },
    error: { label: 'Error', severity: 'error' }
};

export const getToastMessage = (action: ToastAction, entity: string, isError: boolean = false): string => {
    if (isError) {
        switch (action) {
            case 'create': return `Error al registrar ${entity.toLowerCase()}.`;
            case 'update': return `Error al actualizar ${entity.toLowerCase()}.`;
            case 'delete': return `Error al eliminar ${entity.toLowerCase()}.`;
            case 'reopen': return `Error al reabrir ${entity.toLowerCase()}.`;
            default: return `Ocurrió un error con ${entity.toLowerCase()}.`;
        }
    }

    switch (action) {
        case 'create': return `Se registró correctamente el ${entity.toLowerCase()}.`;
        case 'update': return `Se actualizó correctamente el ${entity.toLowerCase()}.`;
        case 'delete': return `Se eliminó correctamente el ${entity.toLowerCase()}.`;
        case 'reopen': return `Se reabrió correctamente el ${entity.toLowerCase()}.`;
        default: return `Acción realizada correctamente en ${entity.toLowerCase()}.`;
    }
};
