import { TextField, MenuItem, type TextFieldProps } from '@mui/material';
import type { ChangeEvent } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import type { SelectItem } from '@/shared/model/types';

type Props = Omit<TextFieldProps, 'variant'> & {
    label: string;
    options: SelectItem[];
    registration?: UseFormRegisterReturn;
    error?: boolean;
    helperText?: string;
    value?: string | number;
    defaultValue?: string | number;
    disabled?: boolean;
    variant?: 'outlined' | 'standard' | 'filled';
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const FormSelect = ({
    label,
    options,
    registration,
    error,
    helperText,
    value,
    defaultValue,
    disabled,
    variant = 'outlined',
    onChange,
    ...props
}: Props) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        registration?.onChange(event);
        onChange?.(event);
    };

    return (
        <TextField
            select
            label={label}
            fullWidth
            size="small"
            variant={variant}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            error={error}
            helperText={helperText}
            {...registration}
            onChange={handleChange}
            {...props}
        >
            <MenuItem value={0} disabled>
                Seleccione
            </MenuItem>
            {options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                    {option.text}
                </MenuItem>
            ))}
        </TextField>
    );
};
