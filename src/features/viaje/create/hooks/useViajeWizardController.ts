import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { CreateViajeDto } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyMutationError, type ApiMutationError } from '@/shared/utils/api-errors';
import { addDaysToDateISO, toInputDate } from '@/shared/utils/date-utils';
import { APP_PATHS, buildAppDetailPath } from '@app/router/model/navigation';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';
import { viajeWizardSchema, type ViajeWizardFormData } from '../../model/schema';
import { getViajeWizardStepFields, VIAJE_WIZARD_STEPS } from '../model/wizard-config';

export function useViajeWizardController() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [activeStep, setActiveStep] = useState(0);

    const methods = useForm<ViajeWizardFormData>({
        resolver: zodResolver(viajeWizardSchema) as Resolver<ViajeWizardFormData>,
        defaultValues: {
            clienteID: 0,
            estadoID: 0,
            tractoID: 0,
            carretaID: 0,
            colaboradorID: 0,
            origenID: 0,
            destinoID: 0,
            fechaCarga: addDaysToDateISO(7),
            tipoMedidaID: 0,
            tipoPesoID: 0,
            ejesTracto: 0,
            mercaderias: [],
        },
    });

    const { handleSubmit, trigger, getValues, setValue } = methods;

    const mutation = useMutation<number | void, ApiMutationError, CreateViajeDto>({
        mutationFn: async (data: CreateViajeDto) => {
            const cleanData: CreateViajeDto = {
                ...data,
                fechaCarga: toInputDate(data.fechaCarga),
                fechaPartida: data.fechaPartida ? toInputDate(data.fechaPartida) : undefined,
                fechaLlegada: data.fechaLlegada ? toInputDate(data.fechaLlegada) : undefined,
                fechaDescarga: data.fechaDescarga ? toInputDate(data.fechaDescarga) : undefined,
                fechaLlegadaBase: data.fechaLlegadaBase ? toInputDate(data.fechaLlegadaBase) : undefined,
                cotizacionID: data.cotizacionID || undefined,
                direccionOrigen: data.direccionOrigen || undefined,
                direccionDestino: data.direccionDestino || undefined,
                ejesCarreta: data.ejesCarreta || undefined,
                largo: data.largo ?? undefined,
                alto: data.alto ?? undefined,
                ancho: data.ancho ?? undefined,
                peso: data.peso ?? undefined,
                kmInicio: data.kmInicio ?? undefined,
                kmLlegada: data.kmLlegada ?? undefined,
                kmLlegadaBase: data.kmLlegadaBase ?? undefined,
                mercaderias: data.mercaderias?.map((mercaderia) => ({
                    ...mercaderia,
                    descripcion: mercaderia.descripcion || undefined,
                    largo: mercaderia.largo ?? undefined,
                    alto: mercaderia.alto ?? undefined,
                    ancho: mercaderia.ancho ?? undefined,
                    peso: mercaderia.peso ?? undefined,
                })),
            };

            const response = await viajeApi.create(cleanData);
            return response.data;
        },
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
