import { Box, Alert } from '@mui/material';
import { useState } from 'react';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeMercaderia as ViajeMercaderiaType } from '@/entities/viaje/model/types';
import { ViajeMercaderiaCreateEdit,ViajeMercaderiaList } from './Index';

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

    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de registrar mercadería.
            </Alert>
        );
    }

    return (
        <Box>
            {!viewOnly && (
                <ViajeMercaderiaCreateEdit 
                    viajeId={viajeId} 
                    tiposMedida={tiposMedida}
                    tiposPeso={tiposPeso}
                    mercaderias={mercaderias}
                    onCancelEdit={handleCancelEdit}
                    editItem={editItem}
                />
            )}

            <ViajeMercaderiaList 
                viajeId={viajeId} 
                viewOnly={viewOnly} 
                tiposMedida={tiposMedida}
                tiposPeso={tiposPeso}
                mercaderias={mercaderias}
                onEdit={handleEdit}
            />
        </Box>
    );
}
