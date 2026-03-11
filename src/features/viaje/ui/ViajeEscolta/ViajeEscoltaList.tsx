import { useState } from 'react';
import { Box, Typography, CircularProgress, useTheme, alpha } from '@mui/material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeEscolta } from '@/entities/viaje/model/types';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import { TableCell } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { useViajeEscoltas, useDeleteViajeEscolta } from '@/features/viaje/hooks/useViajeEscoltas';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
    onEdit?: (item: ViajeEscolta) => void;
}

export function ViajeEscoltaList({ viajeId, viewOnly, flotas, colaboradores, onEdit }: Props) {
    const theme = useTheme();
    
    // Query & Mutations
    const { data: escoltas = [], isLoading } = useViajeEscoltas(viajeId);
    const deleteMutation = useDeleteViajeEscolta();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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
            console.error("Error deleting escolta:", error);
        }
    };

    const getEscoltaInfo = (item: ViajeEscolta) => {
        if (item.tercero) {
            return {
                tipo: 'Tercero',
                conductor: item.nombreConductor || '-',
                vehiculo: item.empresa || '-' 
            };
        }
        const flota = flotas.find(f => f.id === item.flotaID)?.text || item.flota?.placa || '-';
        const colab = colaboradores.find(c => c.id === item.colaboradorID)?.text || item.colaborador?.nombres || '-';
        return {
            tipo: 'Propio',
            conductor: colab,
            vehiculo: flota
        };
    };

    const columns: Column[] = [
        { id: 'tipo', label: 'Tipo' },
        { id: 'conductor', label: 'Conductor / Personal' },
        { id: 'vehiculo', label: 'Vehículo / Empresa' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    // Client-side pagination
    const paginatedFields = escoltas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const pagedData = {
        items: paginatedFields,
        total: escoltas.length,
        page: page + 1,
        size: rowsPerPage,
        totalPages: Math.ceil(escoltas.length / rowsPerPage)
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Escoltas Asignados
                    </Typography>
                    {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Box>
                <Box sx={{ 
                    px: 1.5, py: 0.5, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    Total: {escoltas.length}
                </Box>
            </Box>

            <SharedTable
                data={pagedData}
                isLoading={isLoading}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                columns={columns}
                keyExtractor={(item) => item.viajeEscoltaID}
                emptyMessage="No hay escoltas asignados"
                renderRow={(item) => {
                    const info = getEscoltaInfo(item);
                    
                    return (
                        <>
                            <TableCell>
                                <Box sx={{ 
                                    display: 'inline-block',
                                    px: 1, py: 0.5, 
                                    borderRadius: 1, 
                                    bgcolor: info.tipo === 'Propio' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                                    color: info.tipo === 'Propio' ? 'primary.main' : 'warning.main',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    {info.tipo}
                                </Box>
                            </TableCell>
                            <TableCell>{info.conductor}</TableCell>
                            <TableCell>{info.vehiculo}</TableCell>
                            <TableCell align="right">
                                <TableActions
                                    onEdit={() => onEdit?.(item)}
                                    onDelete={() => handleDelete(item.viajeEscoltaID)}
                                    disableEdit={viewOnly}
                                    disableDelete={viewOnly || deleteMutation.isPending}
                                    editTooltip="Editar escolta"
                                    deleteTooltip="Eliminar escolta"
                                />
                            </TableCell>
                        </>
                    );
                }}
            />
        </Box>
    );
}
