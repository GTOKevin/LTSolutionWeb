import { TextField, MenuItem, type TextFieldProps } from '@mui/material';
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
            onChange={onChange}
            {...registration}
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
