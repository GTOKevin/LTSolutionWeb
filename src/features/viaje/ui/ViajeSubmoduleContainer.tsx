import { Box, Alert } from '@mui/material';
import type { ReactNode } from 'react';

interface ViajeSubmoduleContainerProps {
    viajeId?: number;
    viewOnly?: boolean;
    entityName: string; // e.g. "mercadería", "guías"
    renderForm: () => ReactNode;
    renderList: () => ReactNode;
}

export function ViajeSubmoduleContainer({
    viajeId,
    viewOnly,
    entityName,
    renderForm,
    renderList
}: ViajeSubmoduleContainerProps) {
    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de registrar {entityName}.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!viewOnly && viajeId && renderForm()}
            {viajeId && renderList()}
        </Box>
    );
}