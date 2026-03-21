import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { licenciaApi } from '@entities/licencia/api/licencia.api';
import type { CreateLicenciaDto } from '@entities/licencia/model/types';

const LicenciaCrudApi = {
    create: (args: { colaboradorId: number; data: CreateLicenciaDto }) => 
        licenciaApi.create(args.colaboradorId, args.data),
    update: (args: { id: number; data: CreateLicenciaDto }) => 
        licenciaApi.update(args.id, args.data),
    delete: (id: number) => licenciaApi.delete(id)
};

export const { 
    useCreate: useCreateLicencia, 
    useUpdate: useUpdateLicencia, 
    useDelete: useDeleteLicencia 
} = createGenericCrudHooks(
    LicenciaCrudApi,
    'Licencia',
    (args) => {
        if (args && typeof args === 'object' && 'colaboradorId' in args) {
            return [['colaborador-licencias', args.colaboradorId]];
        }
        return [['colaborador-licencias']];
    }
);