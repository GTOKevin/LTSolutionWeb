import React from 'react';
import { Box, Typography, TableCell } from '@mui/material';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';

interface RolColaboradorTableProps {
    data?: PagedResponse<RolColaborador>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (rol: RolColaborador) => void;
}

export function RolColaboradorTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit
}: RolColaboradorTableProps) {
    const columns: Column[] = React.useMemo(() => [
        { id: 'nombre', label: 'Nombre' },
        { id: 'descripcion', label: 'Descripción' },
        { id: 'estado', label: 'Estado' },
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
            keyExtractor={(item) => item.rolColaboradorID}
            emptyMessage="No se encontraron roles"
            renderRow={(item) => (
                <>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box>
                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                    {item.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ID: {item.rolColaboradorID}
                                </Typography>
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                            maxWidth: 300, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                        }}>
                            {item.descripcion || '-'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <StatusChip active={item.activo} />
                    </TableCell>
                    <TableCell align="right" width={120}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TableActions 
                                onEdit={() => onEdit(item)}
                                editTooltip="Editar Rol"
                            />
                        </Box>
                    </TableCell>
                </>
            )}
        />
    );
}
