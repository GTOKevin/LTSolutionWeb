import { useState } from 'react';
import type { ViajePermiso as ViajePermisoType } from '@/entities/viaje/model/types';
import { ViajePermisoCreateEdit, ViajePermisoList } from './Index';
import { ViajeSubmoduleContainer } from '../ViajeSubmoduleContainer';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
}

export function ViajePermiso({ viajeId, viewOnly }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajePermisoType | null>(null);

    return (
        <ViajeSubmoduleContainer
            viajeId={viajeId}
            viewOnly={viewOnly}
            entityName="permisos"
            titleAdd="Agregar Permiso"
            titleEdit="Editar Permiso"
            isEditing={!!itemToEdit}
            onCancelEdit={() => setItemToEdit(null)}
            renderForm={(onClose) => (
                <ViajePermisoCreateEdit 
                    viajeId={viajeId!} 
                    permiso={itemToEdit}
                    onCancel={() => {
                        setItemToEdit(null);
                        onClose();
                    }}
                />
            )}
            renderList={() => (
                <ViajePermisoList 
                    viajeId={viajeId!} 
                    viewOnly={viewOnly} 
                    onEdit={setItemToEdit}
                />
            )}
        />
    );
}
