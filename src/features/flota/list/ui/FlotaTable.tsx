import React from 'react';
import { Typography, TableCell } from '@mui/material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { TableActions } from '@shared/components/ui/TableActions';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';

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
    const columns: Column[] = React.useMemo(() => [
        { id: 'placa', label: 'Placa' },
        { id: 'marca', label: 'Marca / Modelo' },
        { id: 'tipo', label: 'Tipo' },
        { id: 'anio', label: 'Año' },
        { id: 'combustible', label: 'Combustible' },
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
            keyExtractor={(item) => item.flotaID}
            emptyMessage="No se encontraron vehículos"
            renderRow={(flota) => (
                <>
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
                </>
            )}
        />
    );
}
