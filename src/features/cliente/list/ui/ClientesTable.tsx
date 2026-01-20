import React from 'react';
import { Box, Typography, TableCell } from '@mui/material';
import type { Cliente } from '@entities/cliente/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { TableActions } from '@/shared/components/ui/TableActions';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';

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
    const columns: Column[] = [
        { id: 'razonSocial', label: 'Razón Social' },
        { id: 'ruc', label: 'RUC' },
        { id: 'contactoPrincipal', label: 'Contacto Principal' },
        { id: 'estado', label: 'Estado' },
        { id: 'telefono', label: 'Teléfono' },
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
            keyExtractor={(item) => item.clienteID}
            emptyMessage="No se encontraron clientes"
            renderRow={(cliente) => (
                <>
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
                </>
            )}
        />
    );
}
