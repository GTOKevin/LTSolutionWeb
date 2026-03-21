import {
    Box,
    Typography,
    Chip,
    useTheme
} from '@mui/material';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { formatDateLong } from '@shared/utils/date-utils';
import { useMantenimientoReport } from '../../hooks/useMantenimientoReport';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { useAuthStore } from '@/shared/store/auth.store';
import { ROL_USUARIO_ID } from '@/shared/constants/constantes';

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
    const theme = useTheme();
    const { generateExcel, generatePdf } = useMantenimientoReport();
    const user = useAuthStore((state) => state.user);

    const getStatusColor = (statusName: string = '') => {
        const name = statusName.toLowerCase();
        if (name.includes('pendiente') || name.includes('agendado')) return 'default';
        if (name.includes('proceso') || name.includes('taller')) return 'warning';
        if (name.includes('finalizado') || name.includes('completado')) return 'success';
        if (name.includes('cancelado')) return 'error';
        return 'default';
    };

    if (isLoading) {
        return <Box sx={{ p: 2, textAlign: 'center' }}>Cargando datos...</Box>;
    }

    const isCompleted = (item: Mantenimiento | null) => {
        const name = item?.estado?.nombre?.toUpperCase();
        return name === 'FINALIZADO' || name === 'COMPLETADO';
    };

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
                canEdit={(item) => !(isCompleted(item) && item.cerrado)}
                canDelete={(item) => !(isCompleted(item) && item.cerrado)}
                canReopen={(item) => Boolean(isCompleted(item) && item.cerrado && user && (Number(user.roleId) === ROL_USUARIO_ID.ADMINISTRADOR || Number(user.roleId) === ROL_USUARIO_ID.GERENTE_GENERAL))}
                canExportExcel={(item) => isCompleted(item) && item.cerrado}
                canExportPdf={(item) => isCompleted(item) && item.cerrado}
                renderHeader={(item) => {
                    const statusColor = getStatusColor(item.estado?.nombre);
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
                                    color={statusColor as any}
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
