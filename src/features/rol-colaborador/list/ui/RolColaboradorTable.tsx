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
    TablePagination,
    useTheme
} from '@mui/material';
import React from 'react';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { StatusChip } from '@/shared/components/ui/StatusChip';

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
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Nombre</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Descripción</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Estado</TableCell>
                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    Cargando datos...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((item) => (
                            <TableRow 
                                key={item.rolColaboradorID} 
                                hover
                                sx={{ 
                                    '&:hover .actions-group': { opacity: 1 },
                                    cursor: 'pointer'
                                }}
                            >
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
                            </TableRow>
                        ))}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron roles
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
