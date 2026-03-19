import { Box, Typography, Button, Stack, Chip, useTheme } from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import type { Usuario } from '@entities/usuario/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { EstadoUsuarioEnum } from '@/shared/constants/enums';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

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

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando usuarios...</Box>;
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
                emptyMessage="No se encontraron usuarios"
                keyExtractor={(item) => item.usuarioID}
                onEdit={onEdit}
                onDelete={onDelete}
                renderHeader={(user) => (
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {user.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                            ID: {user.usuarioID}
                        </Typography>
                    </Box>
                )}
                renderBody={(user) => (
                    <>
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
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                    size="small" 
                                    startIcon={<LockIcon />}
                                    onClick={() => onChangePassword(user)}
                                >
                                    Contraseña
                                </Button>
                                <Button 
                                    size="small" 
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => onView(user)}
                                >
                                    Detalle
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            />
        </Box>
    );
}
