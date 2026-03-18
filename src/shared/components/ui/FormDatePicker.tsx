import { TextField, type TextFieldProps } from '@mui/material';
import { type UseFormRegisterReturn } from 'react-hook-form';

type Props = Omit<TextFieldProps, 'variant'> & {
    label: string;
    registration?: UseFormRegisterReturn;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
};

export const FormDatePicker = ({
    label,
    registration,
    error,
    helperText,
    disabled,
    ...props
}: Props) => {
    return (
        <TextField
            label={label}
            type="date"
            fullWidth
            size="small"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            error={error}
            helperText={helperText}
            disabled={disabled}
            {...registration}
            {...props}
        />
    );
};
