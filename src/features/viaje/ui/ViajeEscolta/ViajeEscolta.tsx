import { Box, Alert } from '@mui/material';
import { useState } from 'react';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeEscolta } from '@/entities/viaje/model/types';
import { ViajeEscoltaCreateEdit, ViajeEscoltaList } from './Index';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
}

export function ViajeEscolta({ viajeId, viewOnly, flotas, colaboradores }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajeEscolta | null>(null);

    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de asignar escoltas.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!viewOnly && viajeId && (
                <ViajeEscoltaCreateEdit 
                    viajeId={viajeId}
                    flotas={flotas} 
                    colaboradores={colaboradores}
                    escolta={itemToEdit}
                    onCancel={() => setItemToEdit(null)}
                />
            )}

            {viajeId && (
                <ViajeEscoltaList 
                    viajeId={viajeId} 
                    viewOnly={viewOnly} 
                    flotas={flotas} 
                    colaboradores={colaboradores}
                    onEdit={setItemToEdit}
                />
            )}
        </Box>
    );
}
