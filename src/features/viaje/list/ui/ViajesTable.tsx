import {
    Box,
    Typography,
    alpha,
    useTheme,
    Avatar,
    Stack,
    TableCell,
    Tooltip,
    IconButton
} from '@mui/material';
import { ArrowForward, Lock, LockOpen } from '@mui/icons-material';
import type { ViajeListItem } from '@entities/viaje/model/types';
import { VIAJE_STATUS_CODE } from '@entities/viaje/model/status';
import type { PagedResponse } from '@/shared/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { TableActions } from '@shared/components/ui/TableActions';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';

interface Props {
    data?: PagedResponse<ViajeListItem>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    canManage?: boolean;
    canReabrir?: boolean;
    canCerrar?: boolean;
    onEdit?: (viaje: ViajeListItem) => void;
    onDelete?: (viaje: ViajeListItem) => void;
    onView?: (viaje: ViajeListItem) => void;
    onExportExcel?: (viaje: ViajeListItem) => void;
    onExportPdf?: (viaje: ViajeListItem) => void;
    onReopen?: (viaje: ViajeListItem) => void;
    onCerrar?: (viaje: ViajeListItem) => void;
}

export function ViajesTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    canManage = false,
    canReabrir = false,
    canCerrar = false,
    onEdit,
    onDelete,
    onView,
    onExportExcel,
    onExportPdf,
    onReopen,
    onCerrar
}: Props) {
    const theme = useTheme();
    const getRouteLabel = (value?: string) => value?.split('-')[2]?.trim() || value || 'Ruta no registrada';
    const getDisplayValue = (value: string | undefined, fallback: string) => value?.trim() || fallback;

    const columns: Column[] = [
        { id: 'cliente', label: 'Cliente' },
        { id: 'ruta', label: 'Ruta' },
        { id: 'fechaPartida', label: 'Fecha Partida' },
        { id: 'recursos', label: 'Recursos (Activos)' },
        { id: 'carga', label: 'Carga' },
        { id: 'estado', label: 'Estado', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    const getEstadoConfig = (codigo?: string, nombre?: string) => {
        const label = nombre || 'Sin estado';

        if (codigo === VIAJE_STATUS_CODE.AGENDADO) {
            return {
                label,
                bg: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                dotColor: theme.palette.info.main
            };
        }
        if (codigo === VIAJE_STATUS_CODE.TRANSITO) {
            return {
                label,
                bg: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.dark,
                dotColor: theme.palette.warning.main
            };
        }
        if (codigo === VIAJE_STATUS_CODE.COMPLETADO) {
            return {
                label,
                bg: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.dark,
                dotColor: theme.palette.success.main
            };
        }
        if (codigo === VIAJE_STATUS_CODE.DESCARGANDO) {
            return {
                label,
                bg: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                dotColor: theme.palette.secondary.main
            };
        }
        return {
            label,
            bg: alpha(theme.palette.text.secondary, 0.1),
            color: theme.palette.text.secondary,
            dotColor: theme.palette.text.secondary
        };
    };

    return (
        <SharedTable
            data={data}
            isLoading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            columns={columns}
            keyExtractor={(item) => item.viajeID}
            emptyMessage="No se encontraron viajes registrados."
            renderRow={(viaje) => {
                const estado = getEstadoConfig(viaje.estadoCodigo, viaje.estadoNombre);
                const isEditable = canManage && !viaje.cerrado;
                const showReports = viaje.cerrado && Boolean(onExportExcel || onExportPdf);
                const showReopen = canReabrir && viaje.cerrado;
                const showCerrar = canCerrar && onCerrar && viaje.estadoCodigo === VIAJE_STATUS_CODE.COMPLETADO && !viaje.cerrado;

                return (
                    <>
                        <TableCell>
                            <Box>
                                <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                                    {viaje.clienteRazonSocial}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {getDisplayValue(viaje.clienteRuc, 'Sin RUC registrado')}
                                </Typography>
                            </Box>
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    {getRouteLabel(viaje.origenDescripcion)}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: 'primary.main' }} />
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    {getRouteLabel(viaje.destinoDescripcion)}
                                </Typography>
                            </Stack>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                {viaje.fechaPartida ? formatDateShort(viaje.fechaPartida) : 'Pendiente de partida'}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{ width: 32, height: 32, bgcolor: theme.palette.grey[200], color: theme.palette.grey[600], fontSize: '0.8rem', fontWeight: 'bold' }}
                                    src=""
                                    alt={viaje.conductorNombreCompleto}
                                >
                                    {viaje.conductorNombreCompleto.charAt(0) || '?'}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                                        {getDisplayValue(viaje.conductorNombreCompleto, 'Sin conductor asignado')}
                                    </Typography>
                                    <Stack direction="row" spacing={1} mt={0.5}>
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontSize: '0.65rem',
                                                bgcolor: alpha(theme.palette.background.default, 0.8),
                                                border: `1px solid ${theme.palette.divider}`,
                                                px: 0.8,
                                                py: 0.2,
                                                borderRadius: 0.5,
                                                color: 'text.secondary'
                                            }}
                                        >
                                            {getDisplayValue(viaje.tractoPlaca, 'Sin tracto')}
                                        </Typography>
                                        {viaje.carretaPlaca && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.65rem',
                                                    bgcolor: alpha(theme.palette.background.default, 0.8),
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    px: 0.8,
                                                    py: 0.2,
                                                    borderRadius: 0.5,
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                {viaje.carretaPlaca}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        </TableCell>
                        <TableCell>
                            <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {viaje.mercaderiaDescripcion || 'Sin detalle'}
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    bgcolor: estado.bg,
                                    color: estado.color,
                                    border: `1px solid ${alpha(estado.color, 0.2)}`,
                                    borderRadius: 10,
                                    px: 1.5,
                                    py: 0.5
                                }}
                            >
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: estado.dotColor, mr: 1 }} />
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {estado.label}
                                </Typography>
                            </Box>
                        </TableCell>
                        <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                {showReopen && (
                                    <Tooltip title="Reabrir Viaje">
                                        <IconButton
                                            size="small"
                                            color="warning"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReopen?.(viaje);
                                            }}
                                            sx={{
                                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                                                }
                                            }}
                                        >
                                            <LockOpen fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {showCerrar && (
                                    <Tooltip title="Cerrar Viaje">
                                        <IconButton
                                            size="small"
                                            color="success"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCerrar?.(viaje);
                                            }}
                                            sx={{
                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.success.main, 0.2),
                                                }
                                            }}
                                        >
                                            <Lock fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <TableActions
                                    useMenu={true}
                                    onView={onView ? () => onView(viaje) : undefined}
                                    onEdit={isEditable && onEdit ? () => onEdit(viaje) : undefined}
                                    onDelete={isEditable && viaje.estadoCodigo === VIAJE_STATUS_CODE.AGENDADO && !viaje.fechaPartida && onDelete ? () => onDelete(viaje) : undefined}
                                    onExportExcel={showReports && onExportExcel ? () => onExportExcel(viaje) : undefined}
                                    onExportPdf={showReports && onExportPdf ? () => onExportPdf(viaje) : undefined}
                                    viewTooltip="Visualizar"
                                    editTooltip="Modificar"
                                    deleteTooltip="Eliminar"
                                />
                            </Stack>
                        </TableCell>
                    </>
                );
            }}
        />
    );
}
