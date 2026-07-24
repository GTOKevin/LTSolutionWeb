import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { APP_PATHS } from '@app/router/model/navigation';
import { useViajeOptions } from '@features/viaje/options';
import { useViajeWizardController } from '../hooks/useViajeWizardController';
import { WizardSidebar } from '@features/viaje/ui/ViajeWizardCreate/WizardSidebar';
import { ViajeWizardShell } from './ViajeWizardShell';
import { ViajeWizardStepContent } from './ViajeWizardStepContent';

export function ViajeCreatePageContent() {
    const navigate = useNavigate();
    const options = useViajeOptions(true);
    const controller = useViajeWizardController();
    const { methods, activeStep, steps, handleNext, handleBack, handleSubmit, onSubmit, mutation, getValues, setValue } = controller;

    useEffect(() => {
        if (!getValues('tipoMedidaID') && options.defaultTipoMedidaId) {
            setValue('tipoMedidaID', options.defaultTipoMedidaId);
        }

        if (!getValues('tipoPesoID') && options.defaultTipoPesoId) {
            setValue('tipoPesoID', options.defaultTipoPesoId);
        }
    }, [getValues, options.defaultTipoMedidaId, options.defaultTipoPesoId, setValue]);

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
