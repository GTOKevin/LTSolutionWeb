import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { MiViajeDetailDto } from '@entities/employee/model/types';
import { employeeViajeDetailStyles } from '../../model/view-helpers';

interface MisViajeDetailHeaderProps {
    viaje: MiViajeDetailDto;
    onBack: () => void;
}

export function MisViajeDetailHeader({ viaje, onBack }: MisViajeDetailHeaderProps) {
    const isCerrado = viaje.cerrado;
    const isFacturado = viaje.facturado;

    return (
        <>
            <Box
                sx={{
                    ...employeeViajeDetailStyles.heroHeader,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    px: { xs: 2, md: 4 },
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            onClick={onBack}
                            sx={{
                                minWidth: 'auto',
                                p: 1,
                                borderRadius: '50%',
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <ArrowBackIcon />
                        </Button>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                                    Viaje: {viaje.codigo}
                                </Typography>
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '999px',
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {viaje.estadoNombre}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.5,
                                py: 0.5,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                CERRADO:
                            </Typography>
                            <Typography variant="caption" fontWeight="900" color={isCerrado ? 'success.main' : 'error.main'}>
                                {isCerrado ? 'SÍ' : 'NO'}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.5,
                                py: 0.5,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                FACTURADO:
                            </Typography>
                            <Typography variant="caption" fontWeight="900" color={isFacturado ? 'success.main' : 'error.main'}>
                                {isFacturado ? 'SÍ' : 'NO'}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: 'background.default' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        color: 'text.secondary',
                        '& > span': {
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        },
                    }}
                >
                    <span>Portal del Empleado</span>
                    <span>›</span>
                    <span>Mis Viajes</span>
                    <span>›</span>
                    <span>{viaje.codigo}</span>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                            Ruta: {viaje.origenDescripcion} - {viaje.destinoDescripcion}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Cliente: {viaje.clienteRazonSocial}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
