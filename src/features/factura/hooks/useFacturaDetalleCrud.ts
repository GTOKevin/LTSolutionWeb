import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { CreateFacturaDetalleDto } from '@/entities/factura/model/types';

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
    // Invalidate the specific factura query
    (args) => {
        if (args && typeof args === 'object' && 'facturaId' in args) {
            return [['factura', args.facturaId], ['facturas']];
        }
        return [['facturas']]; // fallback if we don't have facturaId (like on delete)
    }
);
