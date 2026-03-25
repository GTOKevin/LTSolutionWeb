import { Box, Stack, Typography } from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import type { Mercaderia } from '@entities/mercaderia/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import type { PagedResponse } from '@/shared/model/types';

interface Props {
    data?: PagedResponse<Mercaderia>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (mercaderia: Mercaderia) => void;
    onDelete: (mercaderia: Mercaderia) => void;
}

export function MercaderiaMobileList({
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
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando mercaderías...</Box>;
    }

    return (
        <MobileListShell<Mercaderia>
            items={data?.items || []}
            total={data?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="No se encontraron mercaderías"
            keyExtractor={(item) => item.mercaderiaID}
            renderHeader={(item) => (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon color="primary" sx={{ fontSize: 20 }} />
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
                        ID: {item.mercaderiaID}
                    </Typography>
                </Stack>
            )}
        />
    );
}
