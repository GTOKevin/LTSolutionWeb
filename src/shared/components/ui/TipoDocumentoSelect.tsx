import {
    TextField,
    MenuItem,
    CircularProgress, 
    type TextFieldProps
} from '@mui/material';


import { useQuery } from '@tanstack/react-query';
import { tipoDocumentoApi } from '@entities/tipo-documento/api/tipo-documento.api';

type TipoDocumentoSelectProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
    value?: number;
    onChange: (value: number) => void;
    seccion?: string;
};

export function TipoDocumentoSelect({
    value,
    onChange,
    seccion,
    label = "Tipo Documento",
    helperText,
    error,
    disabled,
    InputProps,
    ...props
}: TipoDocumentoSelectProps) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['tipos-documento-select', seccion],
        queryFn: () => tipoDocumentoApi.getSelect(undefined, seccion),
        staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    });

    const options = data?.data || [];
    const currentValue = value || 0;

    return (
        <TextField
            select
            label={label}
            fullWidth
            value={currentValue}
            onChange={(e) => onChange(Number(e.target.value))}
            error={error || isError}
            helperText={isError ? "Error al cargar tipos" : helperText}
            disabled={disabled || isLoading}
            InputProps={{
                ...InputProps,
                startAdornment: isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : InputProps?.startAdornment
            }}
            {...props}
        >
            <MenuItem value={0} disabled>
                Seleccione un tipo
            </MenuItem>
            {options.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.text}
                </MenuItem>
            ))}
        </TextField>
    );
}
