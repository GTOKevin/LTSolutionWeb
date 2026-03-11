import { Box, Alert } from '@mui/material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeIncidente as ViajeIncidenteModel } from '@/entities/viaje/model/types';
import { ViajeIncidenteCreateEdit } from './ViajeIncidenteCreateEdit';
import { ViajeIncidenteList } from './ViajeIncidenteList';
import { useState } from 'react';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
    tiposIncidente: SelectItem[];
}

export function ViajeIncidente({ viajeId, viewOnly, tiposIncidente }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajeIncidenteModel | null>(null);

    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de registrar incidentes.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!viewOnly && viajeId && (
                <ViajeIncidenteCreateEdit 
                    viajeId={viajeId} 
                    tiposIncidente={tiposIncidente} 
                    incidente={itemToEdit}
                    onCancel={() => setItemToEdit(null)}
                />
            )}
            
            {viajeId && (
                <ViajeIncidenteList 
                    viajeId={viajeId} 
                    viewOnly={viewOnly} 
                    tiposIncidente={tiposIncidente} 
                    onEdit={setItemToEdit}
                />
            )}
        </Box>
    );
}
