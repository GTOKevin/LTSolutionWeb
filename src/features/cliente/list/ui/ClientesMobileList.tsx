import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    useTheme,
    alpha,
    TablePagination,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Factory as FactoryIcon,
    Email as EmailIcon,
    AccessTime as AccessTimeIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import type { Cliente } from '@entities/cliente/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cliente: Cliente) => {
        setAnchorEl(event.currentTarget);
        setSelectedCliente(cliente);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCliente(null);
    };

    const handleAction = (action: 'view' | 'edit' | 'delete') => {
        if (!selectedCliente) return;

        switch (action) {
            case 'view':
                onView(selectedCliente);
                break;
            case 'edit':
                onEdit(selectedCliente);
                break;
            case 'delete':
                onDelete(selectedCliente);
                break;
        }
        handleMenuClose();
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando clientes...</Box>;
    }

    if (!data?.items.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron clientes</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((cliente) => (
                    <Card 
                        key={cliente.clienteID}
                        elevation={0}
                        sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 3,
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
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
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleMenuOpen(e, cliente)}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FactoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.primary">
                                            {cliente.contactoPrincipal || 'Sin contacto'}
                                        </Typography>
                                    </Box>
                                    <StatusChip active={cliente.activo} />
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
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <TablePagination
                component="div"
                count={data?.total || 0}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Filas:"
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleAction('view')}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Ver Detalle
                </MenuItem>
                <MenuItem onClick={() => handleAction('edit')}>
                    <EditIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    Editar
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                    <Typography color="error">Eliminar</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
}
