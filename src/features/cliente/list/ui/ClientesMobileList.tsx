import {
    Box,
    Typography,
    Stack,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Factory as FactoryIcon,
    Email as EmailIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import type { Cliente } from '@entities/cliente/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface ClientesMobileListProps {
    data?: PagedResponse<Cliente>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (cliente: Cliente) => void;
    onEdit: (cliente: Cliente) => void;
    onDelete: (cliente: Cliente) => void;
}

export function ClientesMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: ClientesMobileListProps) {
    const theme = useTheme();

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando clientes...</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <MobileListShell
                items={data?.items || []}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                emptyMessage="No se encontraron clientes"
                keyExtractor={(item) => item.clienteID}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                renderHeader={(cliente) => (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main'
                        }}>
                            <FactoryIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                                {cliente.razonSocial}
                            </Typography>
                            <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                                {cliente.ruc}
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderBody={(cliente) => (
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FactoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.primary">
                                    {cliente.contactoPrincipal || 'Sin contacto'}
                                </Typography>
                            </Box>
                            {cliente.eliminado ? (
                                <Chip 
                                    label="Eliminado" 
                                    size="small" 
                                    color="error" 
                                    variant="outlined"
                                    sx={{ fontWeight: 600 }}
                                />
                            ) : (
                                <StatusChip active={cliente.activo} />
                            )}
                        </Box>
                        
                        {(cliente.email || cliente.telefono) && (
                            <Box sx={{ 
                                p: 1.5, 
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                {cliente.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{cliente.email}</Typography>
                                    </Box>
                                )}
                                {cliente.telefono && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">{cliente.telefono}</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Stack>
                )}
            />
        </Box>
    );
}
