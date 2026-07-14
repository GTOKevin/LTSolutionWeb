import { Box, Typography, Paper, Divider, Stack } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { InfoOutlined } from '@mui/icons-material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeWizardFormData } from '../../model/schema';

interface SidebarProps {
    activeStep: number;
    totalSteps: number;
    options: {
        clientes?: SelectItem[];
        estados?: SelectItem[];
        viajeEstadoAgendadoId?: number;
        viajeEstadoTransitoId?: number;
    };
}

export function WizardSidebar({ activeStep, totalSteps, options }: SidebarProps) {
    const { control } = useFormContext<ViajeWizardFormData>();
    
    // Watch relevant fields for the summary
    const clienteID = useWatch({ control, name: 'clienteID', defaultValue: 0 });
    const origenID = useWatch({ control, name: 'origenID', defaultValue: 0 });
    const estadoID = useWatch({ control, name: 'estadoID', defaultValue: 0 });
    const peso = useWatch({ control, name: 'peso' });

    const clienteSeleccionado = options.clientes?.find(c => c.id === clienteID);
    const nombreCliente = clienteSeleccionado ? clienteSeleccionado.text : null;
    const estadoSeleccionado = options.estados?.find((estado) => estado.id === estadoID);
    const isAgendado = estadoID === options.viajeEstadoAgendadoId;
    const isTransito = estadoID === options.viajeEstadoTransitoId;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Summary Card */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Sumario en Tiempo Real
                    </Typography>
                    <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        Paso {activeStep + 1}/{totalSteps}
                    </Box>
                </Box>
                
                <Stack spacing={2} mb={2}>
                    <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
                            Cliente
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {nombreCliente ? nombreCliente : <Box component="span" sx={{ fontStyle: 'italic', opacity: 0.5 }}>No definido</Box>}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
                            Ruta
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {origenID ? `Ruta configurada` : <Box component="span" sx={{ fontStyle: 'italic', opacity: 0.5 }}>No definido</Box>}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
                                Peso Estimado
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {peso ? `${peso} kg` : <Box component="span" sx={{ fontStyle: 'italic', opacity: 0.5 }}>--</Box>}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
                                Estado
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color={isAgendado ? 'error.info' : 'text.primary'}>
                                {estadoSeleccionado?.text || (isAgendado ? 'Agendado' : (isTransito ? 'En Transito' : '--'))}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <InfoOutlined fontSize="small" color="primary" />
                    <Typography variant="caption" fontWeight={500}>
                        Progreso guardado automáticamente
                    </Typography>
                </Box>
            </Paper>

            {/* Assistance Card */}
            {/* <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    bgcolor: (theme) => `${theme.palette.primary.main}0A`,
                    border: '1px solid',
                    borderColor: (theme) => `${theme.palette.primary.main}1A`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: (theme) => `${theme.palette.primary.main}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HeadsetMic color="primary" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                            ¿Necesita ayuda?
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Soporte 24/7
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.5 }}>
                    Nuestro equipo está disponible para ayudar en la planificación de rutas críticas.
                </Typography>
                <Button 
                    fullWidth 
                    variant="outlined" 
                    color="primary" 
                    sx={{ bgcolor: 'background.paper', fontWeight: 700, borderRadius: 2 }}
                >
                    Hablar con un Consultor
                </Button>
            </Paper> */}
        </Box>
    );
}
