import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TablePagination,
    useTheme,
    Tooltip,
    IconButton,
    Avatar,
    alpha
} from '@mui/material';
import React from 'react';
import {
    LockReset as LockResetIcon,
    Link as LinkIcon,
} from '@mui/icons-material';
import type { Usuario } from '@entities/usuario/model/types';
import type { PagedResponse } from '@shared/api/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
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

    return (
        <Paper sx={{ 
            display: { xs: 'none', md: 'flex' },
            flex: 1, 
            flexDirection: 'column', 
            minHeight: 0, 
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            boxShadow: theme.shadows[1]
        }}>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Usuario</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Rol</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Colaborador</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Estado</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Último Acceso</TableCell>
                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    Cargando datos...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((item) => (
                            <TableRow 
                                key={item.usuarioID} 
                                hover
                                sx={{ 
                                    '&:hover .actions-group': { opacity: 1 },
                                    cursor: 'pointer'
                                }}
                            >
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
                                        bgcolor: item.estado?.nombre === 'Activo' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                        color: item.estado?.nombre === 'Activo' ? theme.palette.success.main : theme.palette.error.main,
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
                            </TableRow>
                        ))}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                component="div"
                count={data?.total || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage="Filas por página"
            />
        </Paper>
    );
}
