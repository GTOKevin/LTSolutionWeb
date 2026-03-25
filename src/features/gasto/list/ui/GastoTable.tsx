import { Typography, TableCell, Box } from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import type { Gasto } from '@entities/gasto/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import type { PagedResponse } from '@/shared/model/types';

interface Props {
    data?: PagedResponse<Gasto>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (gasto: Gasto) => void;
    onDelete: (gasto: Gasto) => void;
}

export function GastoTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete
}: Props) {
    const columns: Column[] = [
        { id: 'nombre', label: 'Nombre' },
        { id: 'estado', label: 'Estado', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'center' }
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
            keyExtractor={(item) => item.gastoID}
            emptyMessage="No se encontraron gastos"
            renderRow={(row) => (
                <>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WalletIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight="medium">
                                {row.nombre}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell align="center">
                        <StatusChip active={row.activo ?? true} />
                    </TableCell>
                    <TableCell align="center">
                        <TableActions
                            onEdit={() => onEdit(row)}
                            onDelete={() => onDelete(row)}
                            editTooltip="Editar"
                            deleteTooltip="Eliminar"
                        />
                    </TableCell>
                </>
            )}
        />
    );
}