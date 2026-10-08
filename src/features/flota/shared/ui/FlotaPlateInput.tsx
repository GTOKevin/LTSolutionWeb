import { Box, FormHelperText, Typography, useTheme } from '@mui/material';
import type { UseFormRegisterReturn } from 'react-hook-form';
import {
    PERUVIAN_PLATE_SIZE_CONFIG,
    peruvianPlatePernoSx,
    peruvianPlatePeruTextSx,
    peruvianPlateStripSx,
    peruvianPlateSurfaceSx,
    peruvianPlateValueSx,
} from './peruvianPlate.styles';

interface FlotaPlateInputProps {
    /** Retorno de `register('placa')`: integra el input con react-hook-form. */
    registration: UseFormRegisterReturn;
    error?: string;
    disabled?: boolean;
    maxLength?: number;
    helperText?: string;
}

/**
 * Input editable con la estética de la placa peruana oficial. Reutiliza el
 * estilo compartido de `PeruvianPlate` para evitar duplicar la superficie.
 */
export function FlotaPlateInput({
    registration,
    error,
    disabled = false,
    maxLength = 8,
    helperText,
}: FlotaPlateInputProps) {
    const theme = useTheme();
    const config = PERUVIAN_PLATE_SIZE_CONFIG.md;
    const feedback = error || helperText;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
            <Box
                sx={{
                    ...peruvianPlateSurfaceSx('md'),
                    width: '100%',
                    height: 60,
                    cursor: disabled ? 'default' : 'text',
                    opacity: disabled ? 0.65 : 1,
                    ...(error ? { borderColor: theme.palette.error.main } : {}),
                }}
            >
                {/* Fila superior: Perno izquierdo, texto PERÚ, Perno derecho */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        lineHeight: 1,
                    }}
                >
                    <Box sx={peruvianPlatePernoSx(config.dotSize)} />
                    <Typography component="span" sx={peruvianPlatePeruTextSx(config.peruFontSize)}>
                        PERÚ
                    </Typography>
                    <Box sx={peruvianPlatePernoSx(config.dotSize)} />
                </Box>

                {/* Matrícula editable */}
                <Box
                    component="input"
                    {...registration}
                    disabled={disabled}
                    maxLength={maxLength}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="ABC-123"
                    sx={{
                        ...peruvianPlateValueSx(config.plateFontSize),
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        p: 0,
                        m: 0,
                        my: 'auto',
                        '::placeholder': { color: 'rgba(15, 23, 42, 0.35)' },
                    }}
                />

                {/* Franja reflectiva inferior amarilla oficial */}
                <Box sx={peruvianPlateStripSx(config.bandHeight)} />
            </Box>

            {feedback ? <FormHelperText error={!!error} sx={{ mx: 1.5 }}>{feedback}</FormHelperText> : null}
        </Box>
    );
}
