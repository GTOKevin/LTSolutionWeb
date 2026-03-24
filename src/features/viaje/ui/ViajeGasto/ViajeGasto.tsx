import type { SelectItem } from '@/shared/model/types';
import type { ViajeGasto as ViajeGastoModel } from '@/entities/viaje/model/types';
import { ViajeGastoCreateEdit, ViajeGastoList } from './Index';
import { useState } from 'react';
import { ViajeSubmoduleContainer } from '../ViajeSubmoduleContainer';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
    tiposGasto: SelectItem[];
    monedas: SelectItem[]; 
}

export function ViajeGasto({ viajeId, viewOnly, tiposGasto, monedas }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajeGastoModel | null>(null);

    return (
        <ViajeSubmoduleContainer
            viajeId={viajeId}
            viewOnly={viewOnly}
            entityName="gastos"
            titleAdd="Agregar Gasto"
            titleEdit="Editar Gasto"
            isEditing={!!itemToEdit}
            onCancelEdit={() => setItemToEdit(null)}
            renderForm={(onClose) => (
                <ViajeGastoCreateEdit 
                    viajeId={viajeId!} 
                    tiposGasto={tiposGasto} 
                    monedas={monedas} 
                    gasto={itemToEdit}
                    onCancel={() => {
                        setItemToEdit(null);
                        onClose();
                    }}
                />
            )}
            renderList={() => (
                <ViajeGastoList 
                    viajeId={viajeId!} 
                    viewOnly={viewOnly} 
                    tiposGasto={tiposGasto} 
                    monedas={monedas} 
                    onEdit={setItemToEdit}
                />
            )}
        />
    );
}
