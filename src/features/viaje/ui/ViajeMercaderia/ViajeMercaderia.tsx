import { useState } from 'react';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeMercaderia as ViajeMercaderiaType } from '@/entities/viaje/model/types';
import { ViajeMercaderiaCreateEdit,ViajeMercaderiaList } from './Index';
import { ViajeSubmoduleContainer } from '../ViajeSubmoduleContainer';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    tiposMedida: SelectItem[];
    tiposPeso: SelectItem[];
    mercaderias: SelectItem[];
}

export function ViajeMercaderia({ viajeId, viewOnly, tiposMedida, tiposPeso, mercaderias }: Props) {
    const [editItem, setEditItem] = useState<ViajeMercaderiaType | null>(null);

    const handleEdit = (item: ViajeMercaderiaType) => {
        setEditItem(item);
    };

    const handleCancelEdit = () => {
        setEditItem(null);
    };

    return (
        <ViajeSubmoduleContainer
            viajeId={viajeId}
            viewOnly={viewOnly}
            entityName="mercadería"
            renderForm={() => (
                <ViajeMercaderiaCreateEdit 
                    viajeId={viajeId} 
                    tiposMedida={tiposMedida}
                    tiposPeso={tiposPeso}
                    mercaderias={mercaderias}
                    onCancelEdit={handleCancelEdit}
                    editItem={editItem}
                />
            )}
            renderList={() => (
                <ViajeMercaderiaList 
                    viajeId={viajeId} 
                    viewOnly={viewOnly} 
                    tiposMedida={tiposMedida}
                    tiposPeso={tiposPeso}
                    mercaderias={mercaderias}
                    onEdit={handleEdit}
                />
            )}
        />
    );
}
