import { Box, Typography, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import type { ViajeDetail } from '@/entities/viaje/model/types';
import {
    isViajeAgendado,
    isViajeCompletado,
    isViajeDescargando,
    isViajeTransito,
} from '@entities/viaje/model/status';
import { formatDateShort } from '@/shared/utils/date-utils';

interface ViajeTimelineProps {
    viaje: ViajeDetail;
}

export function ViajeTimeline({ viaje }: ViajeTimelineProps) {
    const steps = [
        {
            label: 'Programado',
            description: `El viaje fue programado para el ${formatDateShort(viaje.fechaCarga)}.`,
            key: 'agendado'
        },
        {
            label: 'En Ruta',
            description: viaje.fechaPartida ? `Salió a ruta el ${formatDateShort(viaje.fechaPartida)}.` : 'Pendiente de salida.',
            key: 'transito'
        },
        {
            label: 'Descargando',
            description: viaje.fechaLlegada ? `Llegó a destino el ${formatDateShort(viaje.fechaLlegada)}.` : 'Pendiente de llegada.',
            key: 'descargando'
        },
        {
            label: 'Completado',
            description: viaje.fechaDescarga ? `Descarga completada el ${formatDateShort(viaje.fechaDescarga)}.` : 'Pendiente de descarga.',
            key: 'completado'
        }
    ];

    const getActiveStep = () => {
        if (isViajeAgendado(viaje)) return 0;
        if (isViajeTransito(viaje)) return 1;
        if (isViajeDescargando(viaje)) return 2;
        if (isViajeCompletado(viaje)) return 3;
        return 0;
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
