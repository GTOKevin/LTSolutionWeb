import { Typography, TableCell } from '@mui/material';
import type { DeleteLog } from '@entities/delete-log/model/types';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import type { PagedResponse } from '@/shared/model/types';
import { formatDateTime } from '@/shared/utils/date-utils';

interface Props {
    data?: PagedResponse<DeleteLog>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DeleteLogTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: Props) {
    const columns: Column[] = [
        { id: 'entidad', label: 'Entidad' },
        { id: 'entidadId', label: 'Entidad ID' },
        { id: 'fechaEliminacion', label: 'Fecha Eliminación' },
        { id: 'usuario', label: 'Usuario' },
        { id: 'datos', label: 'Datos' },
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
            keyExtractor={(item) => item.deleteLogID}
            emptyMessage="No se encontraron registros de eliminación"
            renderRow={(row) => (
                <>
                    <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                            {row.entidad}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                            {row.entidadId}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {formatDateTime(row.fechaEliminacion)}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {row.usuarioEliminacionId}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            title={row.datos}
                            sx={{
                                maxWidth: 340,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {row.datos}
                        </Typography>
                    </TableCell>
                </>
            )}
        />
    );
}
