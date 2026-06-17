import {
    Box,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface PasswordFieldProps {
    label: string;
    placeholder: string;
    visible: boolean;
    onToggle: () => void;
    registration: UseFormRegisterReturn;
    error?: string;
    themeMode: 'light' | 'dark';
    dividerColor: string;
}

export function PasswordField({
    label,
    placeholder,
    visible,
    onToggle,
    registration,
    error,
    themeMode,
    dividerColor,
}: PasswordFieldProps) {
    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                {label}
            </Typography>
            <TextField
                placeholder={placeholder}
                type={visible ? 'text' : 'password'}
                fullWidth
                {...registration}
                error={!!error}
                helperText={error}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        pr: 0,
                    },
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end" sx={{ mr: 2.5 }}>
                            <IconButton
                                type="button"
                                onClick={onToggle}
                                edge="end"
                                sx={{
                                    borderLeft: `1px solid ${dividerColor}`,
                                    borderRadius: '0 8px 8px 0',
                                    px: 2,
                                    height: '100%',
                                    bgcolor: themeMode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc',
                                }}
                            >
                                {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
}
