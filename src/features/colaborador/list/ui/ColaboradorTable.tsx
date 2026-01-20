import React from 'react';
import { Box, Typography, TableCell, Avatar, Chip, alpha, useTheme } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import type { Colaborador } from '@entities/colaborador/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { TableActions } from '@shared/components/ui/TableActions';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';

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

    const columns: Column[] = [
        { id: 'colaborador', label: 'Colaborador' },
        { id: 'rol', label: 'Rol' },
        { id: 'contacto', label: 'Contacto' },
        { id: 'fechaIngreso', label: 'Fecha Ingreso' },
        { id: 'estado', label: 'Estado' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    return (
        <SharedTable
            data={data}
            isLoading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            columns={columns}
            keyExtractor={(item) => item.colaboradorID}
            emptyMessage="No se encontraron colaboradores registrados"
            renderRow={(row) => (
                <>
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
                </>
            )}
        />
    );
}
