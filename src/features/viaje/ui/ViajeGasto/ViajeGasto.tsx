import { Box, Alert } from '@mui/material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeGasto as ViajeGastoModel } from '@/entities/viaje/model/types';
import { ViajeGastoCreateEdit, ViajeGastoList } from './Index';
import { useState } from 'react';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
    tiposGasto: SelectItem[];
    monedas: SelectItem[]; 
}

export function ViajeGasto({ viajeId, viewOnly, tiposGasto, monedas }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajeGastoModel | null>(null);

    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de registrar gastos.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!viewOnly && viajeId && (
                <ViajeGastoCreateEdit 
                    viajeId={viajeId} 
                    tiposGasto={tiposGasto} 
                    monedas={monedas} 
                    gasto={itemToEdit}
                    onCancel={() => setItemToEdit(null)}
                />
            )}
            
            {viajeId && (
                <ViajeGastoList 
                    viajeId={viajeId} 
                    viewOnly={viewOnly} 
                    tiposGasto={tiposGasto} 
                    monedas={monedas} 
                    onEdit={setItemToEdit}
                />
            )}
        </Box>
    );
}
