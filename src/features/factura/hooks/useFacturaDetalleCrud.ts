import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { CreateFacturaDetalleDto } from '@/entities/factura/model/types';
import { useQuery } from '@tanstack/react-query';

// Adapt the API to match the CrudApi interface
const detallesApiAdapter = {
    create: ({ facturaId, data }: { facturaId: number; data: CreateFacturaDetalleDto }) => 
        facturaApi.addDetalle(facturaId, {
            ...data,
            descripcion: data.descripcion ?? undefined
        }),
    update: () => Promise.reject(new Error("Update not supported for factura detalle")),
    delete: (id: number) => 
        facturaApi.removeDetalle(id)
};

export const { 
    useCreate: useCreateFacturaDetalle, 
    useDelete: useDeleteFacturaDetalle 
} = createGenericCrudHooks(
    detallesApiAdapter,
    'Detalle de Factura',
    // Invalidate the specific factura query and its details
    (args) => {
        if (args && typeof args === 'object' && 'facturaId' in args) {
            return [['factura', args.facturaId], ['facturas'], ['facturaDetalles', args.facturaId]];
        }
        return [['facturas'], ['facturaDetalles'], ['factura']]; // fallback if we don't have facturaId (like on delete)
    }
);

export const useFacturaDetalles = (facturaId?: number) => {
    return useQuery({
        queryKey: ['facturaDetalles', facturaId],
        queryFn: () => facturaApi.getDetallesByFacturaId(facturaId!),
        enabled: !!facturaId
    });
};
