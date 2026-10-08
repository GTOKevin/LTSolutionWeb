import { TextField } from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { LENGTH_UNIT_SUFFIX, type LengthUnit } from '@shared/utils/format-utils';

interface LengthFieldProps<TFieldValues extends FieldValues = FieldValues> {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    unit: LengthUnit;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

/**
 * Campo de longitud que almacena y muestra el número tal cual en la unidad
 * seleccionada (según el `TipoMaestro`), sin convertir a una unidad canónica.
 */
export function LengthField<TFieldValues extends FieldValues = FieldValues>({
    control,
    name,
    label,
    unit,
    disabled,
    error,
    helperText,
}: LengthFieldProps<TFieldValues>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    label={`${label} (${LENGTH_UNIT_SUFFIX[unit]})`}
                    type="number"
                    fullWidth
                    value={Number(field.value) || 0}
                    onChange={(event) => {
                        const raw = event.target.value;
                        field.onChange(raw === '' ? 0 : Number(raw));
                    }}
                    error={error}
                    helperText={helperText}
                    disabled={disabled}
                    slotProps={{ htmlInput: { step: '0.01' } }}
                />
            )}
        />
    );
}
