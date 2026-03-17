import { Box, Alert } from '@mui/material';
import { useState } from 'react';
import type { ViajePermiso } from '@/entities/viaje/model/types';
import { ViajePermisoCreateEdit, ViajePermisoList } from './Index';

interface Props {
    viajeId?: number;
    viewOnly?: boolean;
}

export function ViajePermiso({ viajeId, viewOnly }: Props) {
    const [itemToEdit, setItemToEdit] = useState<ViajePermiso | null>(null);

    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de registrar permisos.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!viewOnly && viajeId && (
                <ViajePermisoCreateEdit 
                    viajeId={viajeId} 
                    permiso={itemToEdit}
                    onCancel={() => setItemToEdit(null)}
                />
            )}

            {viajeId && (
                <ViajePermisoList 
                    viajeId={viajeId} 
                    viewOnly={viewOnly} 
                    onEdit={setItemToEdit}
                />
            )}
        </Box>
    );
}
