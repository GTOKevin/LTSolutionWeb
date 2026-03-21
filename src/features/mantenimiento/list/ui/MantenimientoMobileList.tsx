import {
    Box,
    Typography,
    Chip
} from '@mui/material';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { formatDateLong } from '@shared/utils/date-utils';
import { useMantenimientoReport } from '../../hooks/useMantenimientoReport';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { useMantenimientoPermissions } from '../../hooks/useMantenimientoPermissions';

import { getMantenimientoStatusColor } from '../../utils/mantenimientoStatus';

interface MantenimientoMobileListProps {
    data?: Mantenimiento[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    onView: (item: Mantenimiento) => void;
    onEdit: (item: Mantenimiento) => void;
    onDelete: (item: Mantenimiento) => void;
    onReopen?: (item: Mantenimiento) => void;
}

export function MantenimientoMobileList({
    data,
    total,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    isLoading,
    onView,
    onEdit,
    onDelete,
    onReopen
}: MantenimientoMobileListProps) {
    const { generateExcel, generatePdf } = useMantenimientoReport();
    const { canEdit, canDelete, canReopen: checkCanReopen, canExport } = useMantenimientoPermissions();

    if (isLoading) {
        return <Box sx={{ p: 2, textAlign: 'center' }}>Cargando datos...</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <MobileListShell
                items={data || []}
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                emptyMessage="No se encontraron registros"
                keyExtractor={(item) => item.mantenimientoID}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onReopen={onReopen}
                onExportExcel={(item) => generateExcel(item.mantenimientoID)}
                onExportPdf={(item) => generatePdf(item.mantenimientoID)}
                canEdit={(item) => canEdit(item)}
                canDelete={(item) => canDelete(item)}
                canReopen={(item) => checkCanReopen(item)}
                canExportExcel={(item) => canExport(item)}
                canExportPdf={(item) => canExport(item)}
                renderHeader={(item) => {
                    const statusColor = getMantenimientoStatusColor(item.estado);
                    return (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {item.flota?.marca} {item.flota?.modelo}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {item.flota?.placa} • #MNT-{item.mantenimientoID}
                                </Typography>
                            </Box>
                            <Box>
                                <Chip 
                                    label={item.estado?.nombre || 'Desconocido'} 
                                    size="small" 
                                    color={statusColor}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', mr: 1 }}
                                />
                            </Box>
                        </Box>
                    );
                }}
                renderBody={(item) => (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Tipo Servicio
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {item.tipoServicio?.nombre}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Ingreso
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {formatDateLong(item.fechaIngreso)}
                            </Typography>
                        </Box>
                    </Box>
                )}
            />
        </Box>
    );
}
