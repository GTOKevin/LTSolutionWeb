import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    useTheme,
    Typography
} from '@mui/material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { TableActions } from '@shared/components/ui/TableActions';
import React from 'react';

interface FlotaTableProps {
    data?: PagedResponse<Flota>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (flota: Flota) => void;
    onEdit: (flota: Flota) => void;
    onDelete: (flota: Flota) => void;
}

export function FlotaTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: FlotaTableProps) {
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
                            <TableCell>Placa</TableCell>
                            <TableCell>Marca / Modelo</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Año</TableCell>
                            <TableCell>Combustible</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    Cargando datos...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((flota) => (
                            <TableRow 
                                key={flota.flotaID}
                                 hover
                                sx={{ 
                                    '&:hover .actions-group': { opacity: 1 },
                                    cursor: 'pointer'
                                }}
                            >
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                                        {flota.placa}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {flota.marca} {flota.modelo}
                                </TableCell>
                                <TableCell>
                                    {flota.tipoFlotaNavigation?.nombre || flota.tipoFlota}
                                </TableCell>
                                <TableCell>{flota.anio}</TableCell>
                                <TableCell>{flota.tipoCombustible}</TableCell>
                                <TableCell>
                                    <StatusChip active={flota.estado} />
                                </TableCell>
                                <TableCell align="right">
                                    <TableActions 
                                        onView={() => onView(flota)}
                                        onEdit={() => onEdit(flota)}
                                        onDelete={() => onDelete(flota)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron vehículos
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
