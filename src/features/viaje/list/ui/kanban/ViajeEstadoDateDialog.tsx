import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { FormDatePicker } from '@shared/components/ui/FormDatePicker';

interface ViajeEstadoDateDialogProps {
    open: boolean;
    title: string;
    fieldLabel: string;
    value: string;
    onValueChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

/**
 * Modal para registrar la fecha asociada al cambio de estado en el Kanban
 * (fecha de partida al pasar a En Ruta, fecha de descarga al pasar a En Descarga).
 * El valor se maneja como string `YYYY-MM-DD` (el contrato de la API espera ese formato).
 */
export function ViajeEstadoDateDialog({
    open,
    title,
    fieldLabel,
    value,
    onValueChange,
    onConfirm,
    onCancel,
    isLoading = false,
}: ViajeEstadoDateDialogProps) {
    const hasValue = Boolean(value);

    return (
        <Dialog open={open} onClose={isLoading ? undefined : onCancel} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
                <Stack spacing={2}>
                    <FormDatePicker
                        label={fieldLabel}
                        value={value}
                        onChange={(event) => onValueChange(event.target.value)}
                        disabled={isLoading}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={onConfirm} disabled={isLoading || !hasValue}>
                    {isLoading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
