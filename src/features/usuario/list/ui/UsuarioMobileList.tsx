import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Stack,
    Chip,
    useTheme,
    TablePagination,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import type { Usuario } from '@entities/usuario/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { EstadoUsuarioEnum } from '@/shared/constants/enums';

interface UsuarioMobileListProps {
    data?: PagedResponse<Usuario>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (usuario: Usuario) => void;
    onEdit: (usuario: Usuario) => void;
    onDelete: (usuario: Usuario) => void;
    onChangePassword: (usuario: Usuario) => void;
}

export function UsuarioMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete,
    onChangePassword
}: UsuarioMobileListProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, usuario: Usuario) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(usuario);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleAction = (action: 'view' | 'edit' | 'password' | 'delete') => {
        if (selectedUser) {
            if (action === 'view') onView(selectedUser);
            if (action === 'edit') onEdit(selectedUser);
            if (action === 'password') onChangePassword(selectedUser);
            if (action === 'delete') onDelete(selectedUser);
        }
        handleMenuClose();
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando usuarios...</Box>;
    }

    if (!data?.items.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron usuarios</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((user) => (
                    <Card 
                        key={user.usuarioID}
                        elevation={0}
                        sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 3,
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {user.nombre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                        ID: {user.usuarioID}
                                    </Typography>
                                </Box>
                                <Box>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Stack spacing={1} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email || 'Sin email'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BadgeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Chip 
                                        label={user.rolUsuario?.nombre} 
                                        size="small" 
                                        variant="outlined" 
                                        color="primary" 
                                        sx={{ height: 24 }}
                                    />
                                </Box>
                            </Stack>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                <Chip 
                                    label={user.estado?.nombre} 
                                    size="small"
                                    color={user.estadoID === EstadoUsuarioEnum.Activo ? 'success' : 'default'}
                                    variant={user.estadoID === EstadoUsuarioEnum.Activo ? 'filled' : 'outlined'}
                                />
                                <Button 
                                    size="small" 
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => onView(user)}
                                >
                                    Ver Detalle
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <TablePagination
                component="div"
                count={data.total}
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
                    <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Editar
                </MenuItem>
                <MenuItem onClick={() => handleAction('password')}>
                    <LockIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Cambiar Contraseña
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                    <Typography color="error">Eliminar</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
}
