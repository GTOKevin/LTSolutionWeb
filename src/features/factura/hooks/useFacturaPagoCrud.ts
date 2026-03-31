import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { CreateFacturaPagoDto } from '@/entities/factura/model/types';

// Adapt the API to match the CrudApi interface
const pagosApiAdapter = {
    create: ({ facturaId, data }: { facturaId: number; data: CreateFacturaPagoDto }) => 
        facturaApi.addPago(facturaId, {
            ...data,
            numeroOperacion: data.numeroOperacion ?? undefined,
            observacion: data.observacion ?? undefined
        }),
    update: () => Promise.reject(new Error("Update not supported for factura pago")),
    delete: (id: number) => 
        facturaApi.removePago(id)
};

export const { 
    useCreate: useCreateFacturaPago, 
    useDelete: useDeleteFacturaPago 
} = createGenericCrudHooks(
    pagosApiAdapter,
    'Pago de Factura',
    // Invalidate the specific factura query
    (args) => {
        if (args && typeof args === 'object' && 'facturaId' in args) {
            return [['factura', args.facturaId], ['facturas']];
        }
        return [['facturas']]; // fallback if we don't have facturaId (like on delete)
    }
);
