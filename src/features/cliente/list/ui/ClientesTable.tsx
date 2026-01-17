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
    Typography
} from '@mui/material';
import React from 'react';
import type { Cliente } from '@entities/cliente/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { TableActions } from '@/shared/components/ui/TableActions';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface ClientesTableProps {
    data?: PagedResponse<Cliente>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (cliente: Cliente) => void;
    onEdit: (cliente: Cliente) => void;
    onDelete: (cliente: Cliente) => void;
}

export function ClientesTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: ClientesTableProps) {
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
                            <TableCell>Razón Social</TableCell>
                            <TableCell>RUC</TableCell>
                            <TableCell>Contacto Principal</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                    Cargando clientes...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((cliente: Cliente) => (
                            <TableRow 
                                key={cliente.clienteID}
                                hover
                                sx={{ 
                                    '&:hover .actions-group': { opacity: 1 },
                                    cursor: 'pointer'
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {cliente.razonSocial}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {cliente.email || 'Sin correo'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                                        {cliente.ruc}
                                    </Typography>
                                </TableCell>
                                <TableCell>{cliente.contactoPrincipal}</TableCell>
                                <TableCell>
                                    <StatusChip active={cliente.activo} />
                                </TableCell>
                                <TableCell>{cliente.telefono || '-'}</TableCell>
                                <TableCell align="right">
                                    <TableActions 
                                        onView={() => onView(cliente)}
                                        onEdit={() => onEdit(cliente)}
                                        onDelete={() => onDelete(cliente)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron clientes
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
