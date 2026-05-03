import { Box, Typography, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { ESTADO_VIAJE_ID } from '@/shared/constants/constantes';

interface ViajeTimelineProps {
    viaje: Viaje;
}

export function ViajeTimeline({ viaje }: ViajeTimelineProps) {
    const steps = [
        {
            label: 'Programado',
            description: `El viaje fue programado para el ${new Date(viaje.fechaCarga).toLocaleDateString()}.`,
            stateId: ESTADO_VIAJE_ID.AGENDADO
        },
        {
            label: 'En Ruta',
            description: viaje.fechaPartida ? `Salió a ruta el ${new Date(viaje.fechaPartida).toLocaleDateString()}.` : 'Pendiente de salida.',
            stateId: ESTADO_VIAJE_ID.TRANSITO
        },
        {
            label: 'Descargando',
            description: viaje.fechaLlegada ? `Llegó a destino el ${new Date(viaje.fechaLlegada).toLocaleDateString()}.` : 'Pendiente de llegada.',
            stateId: ESTADO_VIAJE_ID.DESCARGANDO
        },
        {
            label: 'Completado',
            description: viaje.fechaDescarga ? `Descarga completada el ${new Date(viaje.fechaDescarga).toLocaleDateString()}.` : 'Pendiente de descarga.',
            stateId: ESTADO_VIAJE_ID.COMPLETADO
        }
    ];

    const getActiveStep = () => {
        switch (viaje.estadoID) {
            case ESTADO_VIAJE_ID.AGENDADO: return 0;
            case ESTADO_VIAJE_ID.TRANSITO: return 1;
            case ESTADO_VIAJE_ID.DESCARGANDO: return 2;
            case ESTADO_VIAJE_ID.COMPLETADO: return 4; // all done
            default: return 0;
        }
    };

    const activeStep = getActiveStep();

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel
                            optional={
                                index === activeStep ? (
                                    <Typography variant="caption">Estado actual</Typography>
                                ) : null
                            }
                        >
                            {step.label}
                        </StepLabel>
                        <StepContent>
                            <Typography variant="body2" color="text.secondary">
                                {step.description}
                            </Typography>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}