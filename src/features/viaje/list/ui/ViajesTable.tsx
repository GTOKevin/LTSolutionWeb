import {
    Box,
    Typography,
    alpha,
    useTheme,
    Avatar,
    Stack,
    TableCell
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import type { ViajeListItem } from '@entities/viaje/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { ESTADO_VIAJE_COD } from '@/shared/constants/constantes';
import { TableActions } from '@shared/components/ui/TableActions';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';

interface Props {
    data?: PagedResponse<ViajeListItem>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (viaje: ViajeListItem) => void;
    onDelete: (viaje: ViajeListItem) => void;
    onView: (viaje: ViajeListItem) => void;
}

export function ViajesTable({ 
    data, 
    isLoading, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    onEdit, 
    onDelete, 
    onView 
}: Props) {
    const theme = useTheme();

    const columns: Column[] = [
        { id: 'cliente', label: 'Cliente' },
        { id: 'ruta', label: 'Ruta' },
        { id: 'recursos', label: 'Recursos (Activos)' },
        { id: 'carga', label: 'Carga' },
        { id: 'estado', label: 'Estado', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    const getEstadoConfig = (codigo?: string, nombre?: string) => {
        const label = nombre || 'Sin estado';

        if (codigo === ESTADO_VIAJE_COD.Agendado) {
            return {
                label,
                bg: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                dotColor: theme.palette.info.main
            };
        }
        if (codigo === ESTADO_VIAJE_COD.Transito) {
            return {
                label,
                bg: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.dark,
                dotColor: theme.palette.warning.main
            };
        }
        if (codigo === ESTADO_VIAJE_COD.Completado) {
            return {
                label,
                bg: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.dark,
                dotColor: theme.palette.success.main
            };
        }
        if (codigo === ESTADO_VIAJE_COD.Cancelado) {
            return {
                label,
                bg: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                dotColor: theme.palette.error.main
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

                return (
                    <>
                        <TableCell>
                            <Box>
                                <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                                    {viaje.clienteRazonSocial}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    RUC: {viaje.clienteRuc || 'N/A'}
                                </Typography>
                            </Box>
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    {viaje.origenDescripcion.split('-')[2]?.trim() || viaje.origenDescripcion}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: 'primary.main' }} />
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    {viaje.destinoDescripcion.split('-')[2]?.trim() || viaje.destinoDescripcion}
                                </Typography>
                            </Stack>
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{ width: 32, height: 32, bgcolor: theme.palette.grey[200], color: theme.palette.grey[600], fontSize: '0.8rem', fontWeight: 'bold' }}
                                    src="" // No image URL in DTO yet
                                    alt={viaje.conductorNombreCompleto}
                                >
                                    {viaje.conductorNombreCompleto.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                                        {viaje.conductorNombreCompleto}
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
                                            {viaje.tractoPlaca}
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
                            <TableActions
                                onView={() => onView(viaje)}
                                onEdit={() => onEdit(viaje)}
                                onDelete={() => onDelete(viaje)}
                                viewTooltip="Ver detalle"
                                editTooltip="Editar"
                                deleteTooltip="Eliminar"
                            />
                        </TableCell>
                    </>
                );
            }}
        />
    );
}
