import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { CreateFacturaPagoDto } from '@/entities/factura/model/types';
import { useQuery } from '@tanstack/react-query';

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
    // Invalidate the specific factura query and its payments
    (args) => {
        if (args && typeof args === 'object' && 'facturaId' in args) {
            return [['factura', args.facturaId], ['facturas'], ['facturaPagos', args.facturaId]];
        }
        return [['facturas'], ['facturaPagos'], ['factura']]; // fallback if we don't have facturaId (like on delete)
    }
);

export const useFacturaPagos = (facturaId?: number) => {
    return useQuery({
        queryKey: ['facturaPagos', facturaId],
        queryFn: () => facturaApi.getPagosByFacturaId(facturaId!),
        enabled: !!facturaId
    });
};
