import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { APP_PATHS } from '@shared/config/app-routes';
import { useViajeOptions } from '@features/viaje/options';
import { useViajeWizardController } from '../hooks/useViajeWizardController';
import { ViajeWizardShell } from './ViajeWizardShell';
import { ViajeWizardStepContent } from './ViajeWizardStepContent';
import { WizardSidebar } from './WizardSidebar';

export function ViajeCreatePageContent() {
    const navigate = useNavigate();
    const options = useViajeOptions(true);
    const controller = useViajeWizardController({
        defaultTipoMedidaId: options.defaultTipoMedidaId,
        defaultTipoPesoId: options.defaultTipoPesoId,
        defaultEstadoId: options.viajeEstadoAgendadoId,
    });
    const { methods, activeStep, steps, handleNext, handleBack, handleSubmit, onSubmit, mutation } = controller;

    return (
        <FormProvider {...methods}>
            <ViajeWizardShell
                steps={steps}
                activeStep={activeStep}
                title="Creación de Nuevo Viaje"
                subtitle="Defina los parámetros esenciales para iniciar el proceso logístico y garantizar la seguridad operativa."
                sidebar={<WizardSidebar activeStep={activeStep} totalSteps={steps.length} options={options} />}
                onCancel={() => navigate(APP_PATHS.viajes)}
                onBack={handleBack}
                onNext={handleNext}
                onSave={handleSubmit(onSubmit)}
                isSaving={mutation.isPending}
            >
                <ViajeWizardStepContent activeStep={activeStep} options={options} />
            </ViajeWizardShell>
        </FormProvider>
    );
}
