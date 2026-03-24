import { useState } from 'react';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeEscolta as ViajeEscoltaModel } from '@/entities/viaje/model/types';
import { ViajeEscoltaCreateEdit, ViajeEscoltaList } from './Index';
import { ViajeSubmoduleContainer } from '../ViajeSubmoduleContainer';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
}

export function ViajeEscolta({ viajeId, viewOnly, flotas, colaboradores }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajeEscoltaModel | null>(null);

    return (
        <ViajeSubmoduleContainer
            viajeId={viajeId}
            viewOnly={viewOnly}
            entityName="escoltas"
            titleAdd="Agregar Escolta"
            titleEdit="Editar Escolta"
            isEditing={!!itemToEdit}
            onCancelEdit={() => setItemToEdit(null)}
            renderForm={(onClose) => (
                <ViajeEscoltaCreateEdit 
                    viajeId={viajeId!}
                    flotas={flotas} 
                    colaboradores={colaboradores}
                    escolta={itemToEdit}
                    onCancel={() => {
                        setItemToEdit(null);
                        onClose();
                    }}
                />
            )}
            renderList={() => (
                <ViajeEscoltaList 
                    viajeId={viajeId!} 
                    viewOnly={viewOnly} 
                    flotas={flotas} 
                    colaboradores={colaboradores}
                    onEdit={setItemToEdit}
                />
            )}
        />
    );
}
