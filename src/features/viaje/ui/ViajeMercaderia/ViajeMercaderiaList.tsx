import { logger } from '@/shared/utils/logger';
import { 
    Box, 
    Typography, 
    Paper, 
    useTheme,
    alpha,
    CircularProgress,
    TableCell
} from '@mui/material';
import { useState } from 'react';
import type { ViajeMercaderia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useViajeMercaderias, useDeleteViajeMercaderia } from '@/features/viaje/hooks/useViajeMercaderias';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';

import { ViajeMercaderiaMobileList } from './Index';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    tiposMedida: SelectItem[];
    tiposPeso: SelectItem[];
    mercaderias: SelectItem[];
    onEdit: (item: ViajeMercaderia) => void;
}

export function ViajeMercaderiaList({ viajeId, viewOnly, tiposMedida, tiposPeso, mercaderias, onEdit }: Props) {
    const theme = useTheme();

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Query & Mutations
    const { data, isLoading } = useViajeMercaderias(viajeId, page + 1, rowsPerPage);
    const deleteMutation = useDeleteViajeMercaderia();
    const mercaderiaList = data?.items ?? [];

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async (id: number) => {
        if (!viajeId) return;
        try {
            await deleteMutation.mutateAsync({ id, viajeId });
        } catch (error) {
            logger.error("Error deleting mercaderia:", error);
        }
    };

    // Calcular totales y máximos
    const totalPeso = mercaderiaList.reduce((acc: number, item: ViajeMercaderia) => acc + (Number(item.peso) || 0), 0);
    // Calcular dimensiones máximas para la plataforma (Largo se suma, Ancho y Alto son máximos)
    const totalLargo = mercaderiaList.reduce((acc: number, item: ViajeMercaderia) => acc + (Number(item.largo) || 0), 0);
    const maxAncho = mercaderiaList.length > 0 ? Math.max(...mercaderiaList.map((item: ViajeMercaderia) => Number(item.ancho) || 0)) : 0;
    const maxAlto = mercaderiaList.length > 0 ? Math.max(...mercaderiaList.map((item: ViajeMercaderia) => Number(item.alto) || 0)) : 0;

    const columns: Column[] = [
        { id: 'descripcion', label: 'Descripción Principal' },
        { id: 'dimensiones', label: 'Dimensiones (L x A x A)' },
        { id: 'peso', label: 'Peso' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    return (
        <Box>
            {/* Listado de Mercadería */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} px={1}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" fontWeight="bold">Ítems Registrados</Typography>
                    {isLoading && <CircularProgress size={20} />}
                </Box>
                <Typography variant="caption" color="text.secondary">({data?.total ?? 0} ítems)</Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <SharedTable
                    data={data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    columns={columns}
                    keyExtractor={(item) => item.viajeMercaderiaID}
                    emptyMessage="No hay mercadería registrada"
                    renderRow={(item) => {
                        const medida = tiposMedida.find(t => t.id === item.tipoMedidaID)?.text || '';
                        const pesoUnit = tiposPeso.find(t => t.id === item.tipoPesoID)?.text || '';
                        const mercaderiaNombre = mercaderias.find(m => m.id === item.mercaderiaID)?.text;

                        return (
                            <>
                                <TableCell>
                                    <Box display="flex" flexDirection="column">
                                        <Typography variant="body2" fontWeight="bold" color="text.primary">
                                            {item.descripcion || mercaderiaNombre || 'Sin descripción'}
                                        </Typography>
                                        {mercaderiaNombre && item.descripcion && item.descripcion !== mercaderiaNombre && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                Categoría: {mercaderiaNombre}
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1} color="text.secondary" fontSize="0.875rem">
                                        <Box 
                                            component="span" 
                                            sx={{ 
                                                bgcolor: alpha(theme.palette.background.default, 1), 
                                                px: 1, 
                                                py: 0.5, 
                                                borderRadius: 1, 
                                                border: `1px solid ${theme.palette.divider}`,
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                color: 'text.primary'
                                            }}
                                        >
                                            {item.largo || 0} × {item.ancho || 0} × {item.alto || 0} {medida}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" fontWeight="600">
                                            {item.peso}
                                        </Typography>
                                        <Box 
                                            component="span" 
                                            sx={{ 
                                                bgcolor: alpha(theme.palette.background.default, 1), 
                                                px: 0.8, 
                                                py: 0.3, 
                                                borderRadius: 1, 
                                                color: 'text.secondary',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                border: `1px solid ${theme.palette.divider}`
                                            }}
                                        >
                                            {pesoUnit}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <TableActions
                                        onEdit={!viewOnly ? () => onEdit(item) : undefined}
                                        onDelete={!viewOnly ? () => handleDelete(item.viajeMercaderiaID) : undefined}
                                        editTooltip="Editar ítem"
                                        deleteTooltip="Eliminar ítem"
                                    />
                                </TableCell>
                            </>
                        );
                    }}
                />
            </Box>

            <ViajeMercaderiaMobileList 
                items={mercaderiaList}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                viewOnly={viewOnly}
                tiposMedida={tiposMedida}
                tiposPeso={tiposPeso}
                mercaderias={mercaderias}
                onEdit={onEdit}
                onDelete={handleDelete}
            />

            {/* Footer Totales */}
            {mercaderiaList.length > 0 && (
                <Box mt={3} display="flex" justifyContent="flex-end" flexWrap="wrap" gap={2}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            px: 3, 
                            py: 2, 
                            borderRadius: 3, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 3,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            borderColor: theme.palette.divider
                        }}
                    >
                        <Box display="flex" flexDirection="column">
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', lineHeight: 1, mb: 0.5 }}>
                                Dimensiones Carga (Largo x Ancho x Alto)
                            </Typography>
                            <Typography textAlign="center" variant="body1" fontWeight="bold">
                                {totalLargo} x {maxAncho} x {maxAlto}
                            </Typography>
                        </Box>
                        <Box width="1px" height="32px" bgcolor="divider" />
                        <Box display="flex" flexDirection="column">
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', lineHeight: 1, mb: 0.5 }}>
                                Peso Total
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                                {totalPeso.toFixed(2)} KG
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            )}
        </Box>
    );
}
