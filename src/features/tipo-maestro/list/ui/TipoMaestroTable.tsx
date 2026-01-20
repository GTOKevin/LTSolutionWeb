import { Box, Typography, Chip, useTheme, TableCell } from '@mui/material';
import React from 'react';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { SharedTable } from '@/shared/components/ui/SharedTable';
import type { Column } from '@/shared/components/ui/SharedTable';

interface TipoMaestroTableProps {
    data?: PagedResponse<TipoMaestro>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (maestro: TipoMaestro) => void;
}

export function TipoMaestroTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit
}: TipoMaestroTableProps) {
    const theme = useTheme();

    const columns: Column[] = [
        { id: 'nombre', label: 'Nombre' },
        { id: 'seccion', label: 'Sección' },
        { id: 'codigo', label: 'Código' },
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
            keyExtractor={(item) => item.tipoMaestroID}
            renderRow={(item) => (
                <>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box>
                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                    {item.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ID: {item.tipoMaestroID}
                                </Typography>
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Chip 
                            label={item.seccion} 
                            size="small" 
                            sx={{ 
                                borderRadius: 1,
                                fontWeight: 600,
                                bgcolor: theme.palette.action.hover,
                                color: theme.palette.text.secondary
                            }} 
                        />
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                            {item.codigo || '-'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <StatusChip active={item.activo} />
                    </TableCell>
                    <TableCell align="right" width={120}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TableActions 
                                onEdit={() => onEdit(item)}
                                editTooltip="Editar Maestro"
                            />
                        </Box>
                    </TableCell>
                </>
            )}
        />
    );
}
