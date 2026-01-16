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
    useTheme,
    Chip
} from '@mui/material';
import React from 'react';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { StatusChip } from '@/shared/components/ui/StatusChip';

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

    return (
        <Paper sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column', 
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            boxShadow: theme.shadows[1]
        }}>
            <TableContainer sx={{ overflow: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Nombre</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Sección</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Código</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Estado</TableCell>
                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    Cargando datos...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((item) => (
                            <TableRow 
                                key={item.tipoMaestroID} 
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
                            </TableRow>
                        ))}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron registros
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
