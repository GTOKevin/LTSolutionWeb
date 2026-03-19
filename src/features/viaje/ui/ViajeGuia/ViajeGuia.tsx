import type { SelectItem } from '@/shared/model/types';
import type { ViajeGuia as ViajeGuiaModel } from '@/entities/viaje/model/types';
import { ViajeGuiaList, ViajeGuiaCreateEdit } from './Index';
import { useState } from 'react';
import { ViajeSubmoduleContainer } from '../ViajeSubmoduleContainer';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
    tiposGuia: SelectItem[];
}

export function ViajeGuia({ viajeId, viewOnly, tiposGuia }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajeGuiaModel | null>(null);

    return (
        <ViajeSubmoduleContainer
            viajeId={viajeId}
            viewOnly={viewOnly}
            entityName="guías"
            renderForm={() => (
                <ViajeGuiaCreateEdit 
                    viajeId={viajeId!} 
                    tiposGuia={tiposGuia} 
                    guia={itemToEdit}
                    onCancel={() => setItemToEdit(null)}
                />
            )}
            renderList={() => (
                <ViajeGuiaList 
                    viajeId={viajeId!} 
                    viewOnly={viewOnly} 
                    tiposGuia={tiposGuia} 
                    onEdit={setItemToEdit}
                />
            )}
        />
    );
}
