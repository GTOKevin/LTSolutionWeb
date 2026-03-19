import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { CreateMantenimientoDetalleSchema } from '../model/schema';

// Adapt the API to match the CrudApi interface
const detallesApiAdapter = {
    create: ({ mantenimientoId, data }: { mantenimientoId: number; data: CreateMantenimientoDetalleSchema }) => 
        mantenimientoApi.addDetalle(mantenimientoId, {
            ...data,
            descripcion: data.descripcion ?? undefined
        }),
    update: ({ id, data }: { id: number; data: CreateMantenimientoDetalleSchema }) => 
        mantenimientoApi.updateDetalle(id, {
            ...data,
            descripcion: data.descripcion ?? undefined
        }),
    delete: (id: number) => 
        mantenimientoApi.removeDetalle(id)
};

export const { 
    useCreate: useCreateMantenimientoDetalle, 
    useUpdate: useUpdateMantenimientoDetalle, 
    useDelete: useDeleteMantenimientoDetalle 
} = createGenericCrudHooks(
    detallesApiAdapter,
    'Detalle de Mantenimiento',
    // Invalidate the specific mantenimiento's detalles query
    (args) => {
        if (args && typeof args === 'object' && 'mantenimientoId' in args) {
            return [['mantenimiento-detalles', args.mantenimientoId]];
        }
        return [['mantenimiento-detalles']];
    }
);