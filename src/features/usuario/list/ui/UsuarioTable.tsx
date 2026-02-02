import React from 'react';
import {
    Box,
    Typography,
    TableCell,
    Chip,
    Tooltip,
    IconButton,
    Avatar,
    alpha,
    useTheme
} from '@mui/material';
import {
    LockReset as LockResetIcon,
    Link as LinkIcon,
} from '@mui/icons-material';
import type { Usuario } from '@entities/usuario/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { EstadoUsuarioEnum } from '@/shared/constants/enums';

interface UsuarioTableProps {
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

export function UsuarioTable({
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
}: UsuarioTableProps) {
    const theme = useTheme();

    const columns: Column[] = React.useMemo(() => [
        { id: 'usuario', label: 'Usuario' },
        { id: 'rol', label: 'Rol' },
        { id: 'colaborador', label: 'Colaborador' },
        { id: 'estado', label: 'Estado' },
        { id: 'ultimoAcceso', label: 'Último Acceso' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ], []);

    return (
        <SharedTable
            data={data}
            isLoading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            columns={columns}
            keyExtractor={(item) => item.usuarioID}
            emptyMessage="No se encontraron usuarios"
            renderRow={(item) => (
                <>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                                sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    fontSize: '0.875rem', 
                                    bgcolor: theme.palette.primary.light 
                                }}
                            >
                                {item.nombre.substring(0, 2).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                    {item.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {item.email || 'Sin email'}
                                </Typography>
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Chip 
                            label={item.rolUsuario?.nombre || 'Sin Rol'} 
                            size="small"
                            sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                            }}
                        />
                    </TableCell>
                    <TableCell>
                        {item.colaborador ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <LinkIcon sx={{ fontSize: 18 }} />
                                <Typography variant="body2">
                                    {item.colaborador.nombres} {item.colaborador.primerApellido}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                Sin vinculación
                            </Typography>
                        )}
                    </TableCell>
                    <TableCell>
                        <Box sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 1,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 10,
                            bgcolor: item.estadoID === EstadoUsuarioEnum.Activo ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                            color: item.estadoID === EstadoUsuarioEnum.Activo ? theme.palette.success.main : theme.palette.error.main,
                        }}>
                            <Box sx={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                bgcolor: 'currentColor' 
                            }} />
                            <Typography variant="caption" fontWeight="bold">
                                {item.estado?.nombre || 'Desconocido'}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {item.ultimoAcceso ? item.ultimoAcceso : 'Nunca'}
                        </Typography>
                    </TableCell>
                    <TableCell align="right" width={140}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Tooltip title="Cambiar Contraseña">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => { e.stopPropagation(); onChangePassword(item); }}
                                    sx={{ color: 'warning.main', mr: 0.5 }}
                                >
                                    <LockResetIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <TableActions 
                                onView={() => onView(item)}
                                onEdit={() => onEdit(item)}
                                onDelete={() => onDelete(item)}
                                editTooltip="Editar Usuario"
                                viewTooltip="Ver Detalle"
                                deleteTooltip="Eliminar Usuario"
                            />
                        </Box>
                    </TableCell>
                </>
            )}
        />
    );
}
