import { Typography, TableCell } from '@mui/material';
import type { AuditLog } from '@entities/audit-log/model/types';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import type { PagedResponse } from '@/shared/model/types';
import { formatDateTime } from '@/shared/utils/date-utils';

interface Props {
    data?: PagedResponse<AuditLog>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AuditLogTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: Props) {
    const columns: Column[] = [
        { id: 'tableName', label: 'Tabla' },
        { id: 'dateTime', label: 'Fecha' },
        { id: 'action', label: 'Acción' },
        { id: 'username', label: 'Usuario' },
        { id: 'keyValues', label: 'Detalles' },
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
            keyExtractor={(item) => item.auditLogID}
            emptyMessage="No se encontraron registros de auditoría"
            renderRow={(row) => (
                <>
                    <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                            {row.tableName}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {formatDateTime(row.dateTime)}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {row.action}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {row.username ?? '-'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            title={row.keyValues}
                            sx={{
                                maxWidth: 340,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {row.keyValues}
                        </Typography>
                    </TableCell>
                </>
            )}
        />
    );
}
