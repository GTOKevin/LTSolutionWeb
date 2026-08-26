import {
    Box,
    Typography,
    alpha,
    useTheme,
    Avatar,
    Stack,
    TableCell,
    Tooltip,
    IconButton,
    Chip
} from '@mui/material';
import { ArrowForward, Lock, LockOpen, PlayArrow } from '@mui/icons-material';
import type { ViajeListItem } from '@entities/viaje/model/types';
import { VIAJE_STATUS_CODE, resolveViajeStatusVisual } from '@entities/viaje/model/status';
import type { PagedResponse } from '@/shared/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { TableActions } from '@shared/components/ui/TableActions';
import { StatusPill } from '@shared/components/ui/StatusPill';
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
    onAdvanceEstado?: (viaje: ViajeListItem) => void;
    getNextEstadoLabel?: (viaje: ViajeListItem) => string | undefined;
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
    onCerrar,
    onAdvanceEstado,
    getNextEstadoLabel
}: Props) {
    const theme = useTheme();
    const getRouteLabel = (value?: string) => value?.split('-')[2]?.trim() || value || 'Ruta no registrada';
    const getDisplayValue = (value: string | undefined, fallback: string) => value?.trim() || fallback;

    const columns: Column[] = [
        { id: 'codigo', label: 'Código' },
        { id: 'cliente', label: 'Cliente' },
        { id: 'ruta', label: 'Ruta' },
        { id: 'fechaPartida', label: 'Fecha Partida' },
        { id: 'recursos', label: 'Recursos (Activos)' },
        { id: 'carga', label: 'Carga' },
        { id: 'estado', label: 'Estado', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
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
            keyExtractor={(item) => item.viajeID}
            emptyMessage="No se encontraron viajes registrados."
            renderRow={(viaje) => {
                const estado = resolveViajeStatusVisual(viaje.estadoCodigo, viaje.estadoNombre);
                const isEditable = canManage && !viaje.cerrado;
                const showReports = viaje.cerrado && Boolean(onExportExcel || onExportPdf);
                const showReopen = canReabrir && viaje.cerrado;
                const showCerrar = canCerrar && onCerrar && viaje.estadoCodigo === VIAJE_STATUS_CODE.COMPLETADO && !viaje.cerrado;
                const nextEstadoLabel = getNextEstadoLabel?.(viaje);
                const showAdvance = canManage && !viaje.cerrado && Boolean(nextEstadoLabel) && Boolean(onAdvanceEstado);

                return (
                    <>
                        <TableCell>
                            <Typography
                                component="span"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    color: 'primary.main',
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    px: 1,
                                    py: 0.4,
                                    borderRadius: 1.5,
                                    whiteSpace: 'nowrap',
                                    display: 'inline-block',
                                    letterSpacing: 0.5,
                                }}
                            >
                                {viaje.codigo || `#${viaje.viajeID}`}
                            </Typography>
                        </TableCell>
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
                            <Stack direction="column" alignItems="center" spacing={0.5}>
                                <StatusPill label={estado.label} tone={estado.tone} size="small" />
                                {viaje.facturado ? (
                                    <Chip
                                        label={`Facturado · ${viaje.facturaNumero ?? ''}`}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.success.main, 0.12),
                                            color: theme.palette.success.dark,
                                            fontWeight: 700,
                                            fontSize: '0.62rem',
                                            height: 20
                                        }}
                                    />
                                ) : null}
                            </Stack>
                        </TableCell>
                        <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                {showAdvance && (
                                    <Tooltip title={`Pasar a ${nextEstadoLabel}`}>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAdvanceEstado?.(viaje);
                                            }}
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                }
                                            }}
                                        >
                                            <PlayArrow fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
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
