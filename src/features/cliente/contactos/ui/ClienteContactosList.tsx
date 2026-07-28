import { Box, Typography } from '@mui/material';
import { useClienteContactosController } from '../hooks/useClienteContactosController';
import { ClienteContactosFormCard } from './ClienteContactosFormCard';
import { ClienteContactosDataView } from './ClienteContactosDataView';
import { ClienteContactosDeleteDialog } from './ClienteContactosDeleteDialog';

interface ClienteContactosListProps {
    clienteId: number;
    viewOnly?: boolean;
}

export function ClienteContactosList({ clienteId, viewOnly = false }: ClienteContactosListProps) {
    const controller = useClienteContactosController({ clienteId });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            {!viewOnly ? <ClienteContactosFormCard controller={controller} /> : null}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">
                    Lista de Contactos
                </Typography>
            </Box>

            <ClienteContactosDataView controller={controller} viewOnly={viewOnly} />
            <ClienteContactosDeleteDialog controller={controller} />
        </Box>
    );
}
