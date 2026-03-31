import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { CreateFacturaDto, UpdateFacturaDto } from '@/entities/factura/model/types';
import { useQuery } from '@tanstack/react-query';

const facturaCrudApi = {
    create: (data: CreateFacturaDto) => facturaApi.create(data),
    update: (args: { id: number; data: UpdateFacturaDto }) => facturaApi.update(args.id, args.data),
    delete: (id: number) => facturaApi.delete(id)
};

export const {
    useCreate: useCreateFactura,
    useUpdate: useUpdateFactura,
    useDelete: useDeleteFactura
} = createGenericCrudHooks(
    facturaCrudApi,
    'Factura',
    () => [['facturas']]
);

export const useFactura = (id?: number) => {
    return useQuery({
        queryKey: ['factura', id],
        queryFn: () => facturaApi.getById(id!),
        enabled: !!id
    });
};
