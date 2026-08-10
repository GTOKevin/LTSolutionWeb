import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { formatDateOnly } from '@shared/utils/date-utils';
import type { MiViajeDetailDto } from '@entities/employee/model/types';

interface MisViajeQuickStatusDialogProps {
    open: boolean;
    viaje: MiViajeDetailDto | null | undefined;
    actionLabel: string | null;
    nextEstadoNombre: string | null;
    canEditFechaLlegada: boolean;
    fechaLlegada: string;
    onFechaLlegadaChange: (value: string) => void;
    onClose: () => void;
    onSaveFechaLlegada: () => void;
    onAdvance: () => void;
    isLoading: boolean;
    isSaving: boolean;
}

export function MisViajeQuickStatusDialog({
    open,
    viaje,
    actionLabel,
    nextEstadoNombre,
    canEditFechaLlegada,
    fechaLlegada,
    onFechaLlegadaChange,
    onClose,
    onSaveFechaLlegada,
    onAdvance,
    isLoading,
    isSaving,
}: MisViajeQuickStatusDialogProps) {
    const hasFechaLlegada = Boolean(fechaLlegada);

    return (
        <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {actionLabel ?? 'Actualizar flujo'}
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
                {isLoading ? (
                    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                            Cargando información del viaje...
                        </Typography>
                    </Stack>
                ) : viaje ? (
                    <Stack spacing={2.5}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {viaje.codigo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {viaje.origenDescripcion} {'->'} {viaje.destinoDescripcion}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Estado actual: {viaje.estadoNombre}
                            </Typography>
                        </Stack>

                        {canEditFechaLlegada ? (
                            <TextField
                                label="Fecha de llegada"
                                type="date"
                                value={fechaLlegada}
                                onChange={(event) => onFechaLlegadaChange(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText={
                                    viaje.fechaPartida
                                        ? `Fecha de partida registrada: ${formatDateOnly(viaje.fechaPartida)}`
                                        : 'Puedes registrar la fecha de llegada antes o junto al cambio de estado.'
                                }
                                disabled={isSaving}
                                fullWidth
                            />
                        ) : (
                            <Alert severity="info">
                                Este estado no requiere captura de fecha de llegada antes del siguiente avance.
                            </Alert>
                        )}

                        {nextEstadoNombre ? (
                            <Alert severity="info">
                                Siguiente estado permitido: <strong>{nextEstadoNombre}</strong>
                            </Alert>
                        ) : (
                            <Alert severity="warning">
                                Este viaje no tiene un siguiente estado disponible desde el listado.
                            </Alert>
                        )}
                    </Stack>
                ) : (
                    <Alert severity="warning">
                        No se pudo cargar el detalle del viaje seleccionado.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSaving}>
                    Cerrar
                </Button>
                {canEditFechaLlegada ? (
                    <Button
                        variant="outlined"
                        onClick={onSaveFechaLlegada}
                        disabled={isSaving || !hasFechaLlegada || !viaje}
                    >
                        Guardar fecha de llegada
                    </Button>
                ) : null}
                <Button
                    variant="contained"
                    onClick={onAdvance}
                    disabled={isSaving || !nextEstadoNombre || !viaje}
                >
                    {isSaving ? 'Guardando...' : nextEstadoNombre ? `Pasar a ${nextEstadoNombre}` : 'Sin siguiente estado'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
