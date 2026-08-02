import { alpha, Box, Button, IconButton, Typography, useTheme, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import type { Factura } from '@/entities/factura/model/types';

interface FacturaCreateEditHeaderProps {
    title: string;
    subtitle: string;
    viewOnly: boolean;
    isSaving: boolean;
    canSubmit: boolean;
    factura?: Factura;
    onBack: () => void;
}

export function FacturaCreateEditHeader({
    title,
    subtitle,
    viewOnly,
    isSaving,
    canSubmit,
    factura,
    onBack,
}: FacturaCreateEditHeaderProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                bgcolor: alpha(theme.palette.background.default, 0.9),
                backdropFilter: 'blur(12px)',
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={onBack} size="small">
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            {title}
                        </Typography>
                        {factura?.esVencida && (
                            <Chip 
                                label="Factura Vencida" 
                                color="error" 
                                size="small" 
                                variant="outlined" 
                            />
                        )}
                        {factura?.esCompromisoVencido && !factura?.esVencida && (
                            <Chip 
                                label="Compromiso expirado" 
                                color="warning" 
                                size="small" 
                                variant="outlined" 
                            />
                        )}
                    </Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                    >
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={onBack} color="inherit">
                    Regresar
                </Button>
                {!viewOnly ? (
                    <Button
                        type="submit"
                        form="factura-form"
                        variant="contained"
                        disabled={!canSubmit}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            boxShadow: theme.shadows[4],
                        }}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Factura'}
                    </Button>
                ) : null}
            </Box>
        </Box>
    );
}
