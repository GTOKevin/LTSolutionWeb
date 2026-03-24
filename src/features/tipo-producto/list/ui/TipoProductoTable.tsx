import { Box, Typography, TableCell, useTheme } from '@mui/material';
import type { TipoProducto } from '@entities/tipo-producto/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import type { PagedResponse } from '@/shared/model/types';

interface Props {
    data?: PagedResponse<TipoProducto>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (tipoProducto: TipoProducto) => void;
    onDelete: (tipoProducto: TipoProducto) => void;
}

export function TipoProductoTable({
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
        { id: 'tipo', label: 'Tipo' },
        { id: 'categoria', label: 'Categoría' },
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
            keyExtractor={(item) => item.tipoProductoID}
            emptyMessage="No se encontraron tipos de producto"
            renderRow={(row) => (
                <>
                    <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                            {row.nombre}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {row.tipo === 'PROD' ? 'Producto' : row.tipo === 'SERV' ? 'Servicio' : row.tipo}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">{row.categoria}</Typography>
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