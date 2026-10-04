import { TextField } from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
    convertWeightFromKg,
    convertWeightToKg,
    round2,
    type WeightUnit,
} from '@shared/utils/format-utils';

interface WeightFieldProps<TFieldValues extends FieldValues = FieldValues> {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    unit: WeightUnit;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

/**
 * Campo de peso que almacena el valor canónico en KG y lo presenta en la unidad
 * seleccionada, centralizando la conversión en `format-utils`.
 */
export function WeightField<TFieldValues extends FieldValues = FieldValues>({
    control,
    name,
    label,
    unit,
    disabled,
    error,
    helperText,
}: WeightFieldProps<TFieldValues>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => {
                const kg = Number(field.value) || 0;
                const displayValue = round2(convertWeightFromKg(kg, unit));

                return (
                    <TextField
                        label={`${label} (${unit})`}
                        type="number"
                        fullWidth
                        value={displayValue}
                        onChange={(event) => {
                            const raw = event.target.value;
                            const parsed = raw === '' ? 0 : Number(raw);
                            field.onChange(round2(convertWeightToKg(parsed, unit)));
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
