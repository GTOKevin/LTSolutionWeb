import { Box, Typography, Stack } from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import type { Gasto } from '@entities/gasto/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
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

export function GastoMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete
}: Props) {
    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando gastos...</Box>;
    }

    return (
        <MobileListShell<Gasto>
            items={data?.items || []}
            total={data?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="No se encontraron gastos"
            keyExtractor={(item) => item.gastoID}
            renderHeader={(item) => (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WalletIcon color="primary" sx={{ fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                            {item.nombre}
                        </Typography>
                    </Box>
                    <StatusChip active={item.activo ?? true} />
                </Box>
            )}
            renderBody={(item) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                        ID: {item.gastoID}
                    </Typography>
                </Stack>
            )}
        />
    );
}
