import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import {
    createFlotaSchema,
    FLOTA_FORM_DEFAULTS,
    mapFlotaToFormValues,
    type CreateFlotaInput,
    type CreateFlotaSchema,
} from '../model/schema';
import { useEffect } from 'react';
import type { Flota } from '@entities/flota/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { SECCION_MAESTRO, TIPO_MAESTRO_CODES } from '@entities/master-data/model/constants';
import { getSelectItemId } from '@entities/master-data/lib/catalog-utils';
import { useCreateFlota, useUpdateFlota } from './useFlotaCrud';
import { useCrudFormPageState } from '@shared/hooks/useCrudFormPageState';
import { FLOTA_QUERY_KEYS } from '../model/query-keys';

interface UseFlotaFormProps {
    flotaToEdit?: Flota | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useFlotaForm({ flotaToEdit, onSuccess, onClose, open }: UseFlotaFormProps) {
    const {
        activeTab,
        setActiveTab,
        createdId,
        errorMessage,
        setErrorMessage,
        effectiveId,
        canEditDetails,
        isEdit,
        resetUiState,
        handleMutationSuccess,
    } = useCrudFormPageState({
        entityId: flotaToEdit?.flotaID,
        onSuccess,
        onClose,
        detailsTabIndex: 1,
        keepOpenAfterCreate: true,
    });

    const createMutation = useCreateFlota();
    const updateMutation = useUpdateFlota();

    // --- Queries ---
    const { data: tiposFlota } = useQuery({
        queryKey: ['tipos-flota'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.FLOTA),
        enabled: open
    });

    const { data: tiposPeso } = useQuery({
        queryKey: ['tipos-peso'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.PESO),
        enabled: open
    });

    const { data: tiposMedida } = useQuery({
        queryKey: ['tipos-medida'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.MEDIDA),
        enabled: open
    });

    const { data: tiposCombustible } = useQuery({
        queryKey: ['tipos-combustible'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.COMBUSTIBLE),
        enabled: open
    });

    const { data: configuracionesEjes } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.configuracionesEjes(),
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.CONFIG_EJES),
        enabled: open
    });

    const listaFlota = tiposFlota || [];
    const listaPeso = tiposPeso || [];
    const listaMedida = tiposMedida || [];
    const listaCombustible = tiposCombustible || [];
    const listaConfigEjes = configuracionesEjes || [];

    // --- Form ---
    const form = useForm({
        resolver: zodResolver(createFlotaSchema),
        defaultValues: FLOTA_FORM_DEFAULTS,
    });

    const { reset, setError, setValue, getValues } = form;

    // --- Effects ---
    useEffect(() => {
        if (open) {
            if (flotaToEdit) {
                reset(mapFlotaToFormValues(flotaToEdit));
            } else {
                reset(FLOTA_FORM_DEFAULTS);
            }

            return resetUiState();
        }
    }, [open, flotaToEdit, reset, resetUiState]);

    // En modo crear (sin edición ni creación previa), precarga los catálogos por código.
    useEffect(() => {
        if (!open || flotaToEdit || createdId) {
            return;
        }

        const defaultTipoPesoID = getSelectItemId(tiposPeso, [TIPO_MAESTRO_CODES.PESO_KILOGRAMO]);
        const defaultTipoMedidaID = getSelectItemId(tiposMedida, [TIPO_MAESTRO_CODES.MEDIDA_METRO]);
        const defaultTipoCombustibleID = getSelectItemId(tiposCombustible, [TIPO_MAESTRO_CODES.COMBUSTIBLE_DIESEL]);

        if (!(Number(getValues('tipoPesoID')) > 0) && defaultTipoPesoID) {
            setValue('tipoPesoID', defaultTipoPesoID);
        }
        if (!(Number(getValues('tipoMedidaID')) > 0) && defaultTipoMedidaID) {
            setValue('tipoMedidaID', defaultTipoMedidaID);
        }
        if (!(Number(getValues('tipoCombustibleID')) > 0) && defaultTipoCombustibleID) {
            setValue('tipoCombustibleID', defaultTipoCombustibleID);
        }
    }, [open, flotaToEdit, createdId, tiposPeso, tiposMedida, tiposCombustible, setValue, getValues]);

    // --- Mutations ---
    const handleError = (error: unknown) => {
        const genericError = handleBackendErrors<CreateFlotaSchema>(error, setError);
        if (genericError) {
            setErrorMessage(genericError);
        }
    };

    const onSubmit = (data: CreateFlotaSchema) => {
        if (isEdit && flotaToEdit) {
            updateMutation.mutate(
                { id: flotaToEdit.flotaID, data },
                {
                    onSuccess: () => handleMutationSuccess(flotaToEdit.flotaID),
                    onError: handleError
                }
            );
        } else if (createdId) {
            updateMutation.mutate(
                { id: createdId, data },
                {
                    onSuccess: () => handleMutationSuccess(createdId),
                    onError: handleError
                }
            );
        } else {
            createMutation.mutate(
                data,
                {
                    onSuccess: (response) => handleMutationSuccess(response),
                    onError: handleError
                }
            );
        }
    };

    return {
        form,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveFlotaId: effectiveId,
        canEditDocs: canEditDetails,
        isEdit,
        createdFlotaId: createdId,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        defaults: FLOTA_FORM_DEFAULTS as CreateFlotaInput,

        // Catalogs
        listaFlota,
        listaPeso,
        listaMedida,
        listaCombustible,
        listaConfigEjes,
    };
}
