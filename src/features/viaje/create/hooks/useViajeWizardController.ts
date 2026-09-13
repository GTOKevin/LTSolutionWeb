import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type DefaultValues, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { CreateViajeDto } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyMutationError, type ApiMutationError } from '@/shared/utils/api-errors';
import { APP_PATHS, buildAppDetailPath } from '@shared/config/app-routes';
import { buildCreateViajePayload, getCreateViajeDefaultValues } from '../../model/form-values';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';
import { viajeWizardSchema, type ViajeWizardFormData } from '../../model/schema';
import { getViajeWizardStepFields, VIAJE_WIZARD_STEPS } from '../model/wizard-config';

interface ViajeWizardControllerOptions {
    defaultTipoMedidaId?: number;
    defaultTipoPesoId?: number;
    defaultEstadoId?: number;
}

export function useViajeWizardController(options: ViajeWizardControllerOptions = {}) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [activeStep, setActiveStep] = useState(0);
    // L2: los defaults base ya vienen de getCreateViajeDefaultValues; aqui solo se
    // aplican los overrides que dependen de las opciones resueltas del catalogo.
    const defaultValues: DefaultValues<ViajeWizardFormData> = {
        ...getCreateViajeDefaultValues(options.defaultEstadoId),
        // L2: estos overrides estrechan `number | null` (CreateViajeDto) a `number`
        // (wizard schema: `z.number().optional()`). No son redundantes: sin ellos
        // el spread no asigna a `DefaultValues<ViajeWizardFormData>`.
        cotizacionID: undefined,
        tractoID: 0,
        colaboradorID: 0,
        carretaID: 0,
        tipoMedidaID: options.defaultTipoMedidaId ?? 0,
        tipoPesoID: options.defaultTipoPesoId ?? 0,
        mercaderias: [],
    };

    const methods = useForm<ViajeWizardFormData>({
        resolver: zodResolver(viajeWizardSchema) as Resolver<ViajeWizardFormData>,
        defaultValues,
    });

    const { handleSubmit, trigger, getValues, setValue } = methods;

    useEffect(() => {
        if (!getValues('tipoMedidaID') && options.defaultTipoMedidaId) {
            setValue('tipoMedidaID', options.defaultTipoMedidaId);
        }

        if (!getValues('tipoPesoID') && options.defaultTipoPesoId) {
            setValue('tipoPesoID', options.defaultTipoPesoId);
        }

        if (!getValues('estadoID') && options.defaultEstadoId) {
            setValue('estadoID', options.defaultEstadoId, { shouldValidate: true });
        }
    }, [
        getValues,
        options.defaultEstadoId,
        options.defaultTipoMedidaId,
        options.defaultTipoPesoId,
        setValue,
    ]);

    const mutation = useMutation<number | void, ApiMutationError, CreateViajeDto>({
        // M3: payload construido en un unico helper de `model/` (recursos + fechas).
        mutationFn: async (data: CreateViajeDto) => viajeApi.create(buildCreateViajePayload(data)),
        onSuccess: (newViajeId) => {
            showToast({ message: 'Viaje creado exitosamente', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });

            if (typeof newViajeId === 'number' && newViajeId > 0) {
                navigate(buildAppDetailPath(APP_PATHS.viajes, newViajeId));
                return;
            }

            navigate(APP_PATHS.viajes);
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(showToast, 'Viaje', 'create', error);
        },
    });

    const handleNext = async () => {
        const isStepValid = await trigger(getViajeWizardStepFields(activeStep));
        if (isStepValid) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const onSubmit: SubmitHandler<ViajeWizardFormData> = (data) => {
        mutation.mutate(data);
    };

    return {
        methods,
        activeStep,
        setActiveStep,
        steps: VIAJE_WIZARD_STEPS,
        handleNext,
        handleBack,
        handleSubmit,
        onSubmit,
        mutation,
        getValues,
        setValue,
    };
}
