import { Box, Alert } from '@mui/material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeIncidente as ViajeIncidenteModel } from '@/entities/viaje/model/types';
import { ViajeIncidenteCreateEdit } from '@features/viaje/ui/ViajeEditar/IncidenteTab/ViajeIncidenteCreateEdit';
import { ViajeIncidenteList } from '@features/viaje/ui/ViajeEditar/IncidenteTab/ViajeIncidenteList';
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 4, alignItems: 'start' }}>
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
