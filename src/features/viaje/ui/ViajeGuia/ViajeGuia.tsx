import { Box, Alert } from '@mui/material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeGuia as ViajeGuiaModel } from '@/entities/viaje/model/types';
import { ViajeGuiaCreateEdit } from './ViajeGuiaCreateEdit';
import { ViajeGuiaList } from './ViajeGuiaList';
import { useState } from 'react';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
    tiposGuia: SelectItem[];
}

export function ViajeGuia({ viajeId, viewOnly, tiposGuia }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajeGuiaModel | null>(null);

    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de registrar guías.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!viewOnly && viajeId && (
                <ViajeGuiaCreateEdit 
                    viajeId={viajeId} 
                    tiposGuia={tiposGuia} 
                    guia={itemToEdit}
                    onCancel={() => setItemToEdit(null)}
                />
            )}
            
            {viajeId && (
                <ViajeGuiaList 
                    viajeId={viajeId} 
                    viewOnly={viewOnly} 
                    tiposGuia={tiposGuia} 
                    onEdit={setItemToEdit}
                />
            )}
        </Box>
    );
}
