import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    useTheme,
    Typography,
    Avatar,
    Chip,
    alpha
} from '@mui/material';
import { 
    Person as PersonIcon 
} from '@mui/icons-material';
import type { Colaborador } from '@entities/colaborador/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { TableActions } from '@shared/components/ui/TableActions';
import React from 'react';

interface ColaboradorTableProps {
    data?: PagedResponse<Colaborador>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (colaborador: Colaborador) => void;
    onEdit: (colaborador: Colaborador) => void;
    onDelete: (colaborador: Colaborador) => void;
}

export function ColaboradorTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: ColaboradorTableProps) {
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
                            <TableCell>Colaborador</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Contacto</TableCell>
                            <TableCell>Fecha Ingreso</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    Cargando colaboradores...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((row) => (
                            <TableRow 
                                key={row.colaboradorID} 
                                hover
                                sx={{ 
                                    '&:hover .actions-group': { opacity: 1 },
                                    cursor: 'pointer'
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ 
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main',
                                            width: 40,
                                            height: 40
                                        }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {row.nombres} {row.primerApellido}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {row.segundoApellido}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={row.rolColaborador?.nombre || 'Sin Rol'} 
                                        size="small" 
                                        variant="outlined" 
                                        color="primary"
                                        sx={{ borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2">{row.telefono || '-'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{row.email || '-'}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {row.fechaIngreso ? new Date(row.fechaIngreso).toLocaleDateString('es-ES') : '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <StatusChip active={row.activo} />
                                </TableCell>
                                <TableCell align="right">
                                    <TableActions 
                                        onView={() => onView(row)}
                                        onEdit={() => onEdit(row)}
                                        onDelete={() => onDelete(row)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron colaboradores registrados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
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
