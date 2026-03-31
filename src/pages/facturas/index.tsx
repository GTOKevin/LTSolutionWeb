import {
    Box,
    Typography,
    Button,
    useTheme,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useCreateFactura, useUpdateFactura, useDeleteFactura } from '@/features/factura/hooks/useFacturaCrud';
import { facturaApi } from '@/entities/factura/api/factura.api';
import { useQuery } from '@tanstack/react-query';
import { FacturaTable } from '@/features/factura/list/ui/FacturaTable';
import { FacturaMobileList } from '@/features/factura/list/ui/FacturaMobileList';
import { CreateEditFacturaModal } from '@/features/factura/create-edit/ui/CreateEditFacturaModal';
import { useMediaQuery } from '@mui/material';
import type { Factura, FacturaFilters } from '@/entities/factura/model/types';
import type { CreateFacturaSchema } from '@/features/factura/model/schema';

export function FacturasPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [filters, setFilters] = useState<FacturaFilters>({ page: 1, size: 10, search: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['facturas', filters],
        queryFn: () => facturaApi.getAll(filters)
    });

    const createMutation = useCreateFactura();
    const updateMutation = useUpdateFactura();
    const deleteMutation = useDeleteFactura();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

    const handleCreateClick = () => {
        setSelectedFactura(null);
        setModalOpen(true);
    };

    const handleEditClick = (factura: Factura) => {
        setSelectedFactura(factura);
        setModalOpen(true);
    };

    const handleViewClick = (factura: Factura) => {
        setSelectedFactura(factura);
        setModalOpen(true);
    };

    const handleDeleteClick = async (factura: Factura) => {
        await deleteMutation.mutateAsync(factura.facturaID);
    };

    const handleSubmit = async (formData: CreateFacturaSchema) => {
        if (selectedFactura) {
            await updateMutation.mutateAsync({ 
                id: selectedFactura.facturaID, 
                data: {
                    ...formData,
                    activo: true
                } 
            });
            setModalOpen(false);
        } else {
            const newId = await createMutation.mutateAsync({ ...formData, detalles: [], pagos: [] });
            const newFactura = await facturaApi.getById(newId);
            setSelectedFactura(newFactura);
        }
    };

    return (
        <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
            p: { xs: 2, md: 3 },
            position: 'relative',
            pb: { xs: 10, md: 3 }
        }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, height: '100%' }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', sm: 'center' }, 
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <ReceiptIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                Facturas
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Gestión de facturación y pagos
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateClick}
                            fullWidth={isMobile}
                        >
                            Nueva Factura
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    {isMobile ? (
                        <FacturaMobileList
                            data={data}
                            isLoading={isLoading}
                            page={filters.page}
                            rowsPerPage={filters.size}
                            onPageChange={(_, page) => setFilters(prev => ({ ...prev, page }))}
                            onRowsPerPageChange={(e) => setFilters(prev => ({ ...prev, size: parseInt(e.target.value, 10), page: 1 }))}
                            onView={handleViewClick}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ) : (
                        <FacturaTable
                            data={data}
                            isLoading={isLoading}
                            page={filters.page}
                            rowsPerPage={filters.size}
                            onPageChange={(_, page) => setFilters(prev => ({ ...prev, page }))}
                            onRowsPerPageChange={(e) => setFilters(prev => ({ ...prev, size: parseInt(e.target.value, 10), page: 1 }))}
                            onView={handleViewClick}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </Box>
            </Box>

            <CreateEditFacturaModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                factura={selectedFactura || undefined}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </Box>
    );
}
