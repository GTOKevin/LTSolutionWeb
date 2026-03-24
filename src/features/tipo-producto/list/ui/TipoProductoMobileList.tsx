import { Box, Typography, Chip, Stack } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import type { TipoProducto } from '@entities/tipo-producto/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
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

export function TipoProductoMobileList({
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
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando tipos de producto...</Box>;
    }

    return (
        <MobileListShell<TipoProducto>
            items={data?.items || []}
            total={data?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="No se encontraron tipos de producto"
            keyExtractor={(item) => item.tipoProductoID}
            renderHeader={(item) => (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon color="primary" sx={{ fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                            {item.nombre}
                        </Typography>
                    </Box>
                    <StatusChip active={item.activo ?? true} />
                </Box>
            )}
            renderBody={(item) => (
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Tipo:
                        </Typography>
                        <Chip 
                            label={item.tipo === 'PROD' ? 'Producto' : item.tipo === 'SERV' ? 'Servicio' : item.tipo} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Categoría:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {item.categoria}
                        </Typography>
                    </Box>
                </Stack>
            )}
        />
    );
}
