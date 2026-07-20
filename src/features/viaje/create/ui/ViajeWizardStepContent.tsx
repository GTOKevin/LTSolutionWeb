import {
    Step1DatosBase,
    Step2Ruta,
    Step3Recursos,
    Step4DetallesCarga,
    Step5Resumen,
} from './steps';
import type { useViajeOptions } from '@features/viaje/options';

interface ViajeWizardStepContentProps {
    activeStep: number;
    options: ReturnType<typeof useViajeOptions>;
}

export function ViajeWizardStepContent({ activeStep, options }: ViajeWizardStepContentProps) {
    switch (activeStep) {
        case 0:
            return <Step1DatosBase options={options} />;
        case 1:
            return <Step2Ruta />;
        case 2:
            return <Step3Recursos options={options} />;
        case 3:
            return <Step4DetallesCarga options={options} />;
        case 4:
            return <Step5Resumen options={options} />;
        default:
            return 'Paso desconocido';
    }
}
