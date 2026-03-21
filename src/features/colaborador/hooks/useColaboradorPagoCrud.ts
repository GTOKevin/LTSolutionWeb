import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { colaboradorPagoApi } from '@entities/colaborador-pago/api/colaborador-pago.api';
import type { CreateColaboradorPagoDto } from '@entities/colaborador-pago/model/types';

const ColaboradorPagoCrudApi = {
    create: (args: { colaboradorId: number; data: CreateColaboradorPagoDto }) => 
        colaboradorPagoApi.create(args.colaboradorId, args.data),
    update: (args: { id: number; data: CreateColaboradorPagoDto }) => 
        colaboradorPagoApi.update(args.id, args.data),
    delete: (id: number) => colaboradorPagoApi.delete(id)
};

export const { 
    useCreate: useCreateColaboradorPago, 
    useUpdate: useUpdateColaboradorPago, 
    useDelete: useDeleteColaboradorPago 
} = createGenericCrudHooks(
    ColaboradorPagoCrudApi,
    'Pago de Colaborador',
    (args) => {
        if (args && typeof args === 'object' && 'colaboradorId' in args) {
            return [['colaborador-pagos', args.colaboradorId]];
        }
        return [['colaborador-pagos']];
    }
);