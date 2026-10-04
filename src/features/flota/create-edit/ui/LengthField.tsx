import { TextField } from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
    convertLengthFromMeters,
    convertLengthToMeters,
    round2,
    type LengthUnit,
} from '@shared/utils/format-utils';

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
 * Campo de longitud que almacena el valor canónico en metros y lo presenta en la
 * unidad seleccionada, centralizando la conversión en `format-utils`.
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
            render={({ field }) => {
                const meters = Number(field.value) || 0;
                const displayValue = round2(convertLengthFromMeters(meters, unit));

                return (
                    <TextField
                        label={`${label} (${unit === 'M' ? 'm' : 'ft'})`}
                        type="number"
                        fullWidth
                        value={displayValue}
                        onChange={(event) => {
                            const raw = event.target.value;
                            const parsed = raw === '' ? 0 : Number(raw);
                            field.onChange(round2(convertLengthToMeters(parsed, unit)));
                        }}
                        error={error}
                        helperText={helperText}
                        disabled={disabled}
                        slotProps={{ htmlInput: { step: '0.01' } }}
                    />
                );
            }}
        />
    );
}
