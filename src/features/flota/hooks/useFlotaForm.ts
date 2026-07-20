import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { createFlotaSchema, type CreateFlotaSchema } from '../model/schema';
import { useEffect } from 'react';
import type { Flota } from '@entities/flota/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { useCreateFlota, useUpdateFlota } from './useFlotaCrud';
import { useCrudFormPageState } from '@shared/hooks/useCrudFormPageState';

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

    const listaFlota = tiposFlota?.data || [];
    const listaPeso = tiposPeso?.data || [];
    const listaMedida = tiposMedida?.data || [];

    // --- Form ---
    const form = useForm({
        resolver: zodResolver(createFlotaSchema),
        defaultValues: {
            activo: true,
            tipoFlota: 0,
            marca: '',
            modelo: '',
            placa: '',
            anio: new Date().getFullYear(),
            color: '',
            ejes: 0,
            tipoPesoID: 0,
            pesoBruto: 0,
            pesoNeto: 0,
            cargaUtil: 0,
            tipoMedidaID: 0,
            largo: 0,
            alto: 0,
            ancho: 0,
            tipoCombustible: '',
        }
    });

    const { reset, setError } = form;

    // --- Effects ---
    useEffect(() => {
        if (open) {
            if (flotaToEdit) {
                reset({
                    tipoFlota: flotaToEdit.tipoFlota,
                    marca: flotaToEdit.marca || '',
                    modelo: flotaToEdit.modelo || '',
                    placa: flotaToEdit.placa,
                    anio: flotaToEdit.anio,
                    color: flotaToEdit.color || '',
                    ejes: flotaToEdit.ejes,
                    tipoPesoID: flotaToEdit.tipoPesoID,
                    pesoBruto: flotaToEdit.pesoBruto,
                    pesoNeto: flotaToEdit.pesoNeto,
                    cargaUtil: flotaToEdit.cargaUtil,
                    tipoMedidaID: flotaToEdit.tipoMedidaID,
                    largo: flotaToEdit.largo,
                    alto: flotaToEdit.alto,
                    ancho: flotaToEdit.ancho,
                    tipoCombustible: flotaToEdit.tipoCombustible,
                    activo: flotaToEdit.estado
                });
            } else {
                reset({
                    tipoFlota: 0,
                    marca: '',
                    modelo: '',
                    placa: '',
                    anio: new Date().getFullYear(),
                    color: '',
                    ejes: 0,
                    tipoPesoID: 0,
                    pesoBruto: 0,
                    pesoNeto: 0,
                    cargaUtil: 0,
                    tipoMedidaID: 0,
                    largo: 0,
                    alto: 0,
                    ancho: 0,
                    tipoCombustible: '',
                    activo: true,
                });
            }

            return resetUiState();
        }
    }, [open, flotaToEdit, reset, resetUiState]);

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
        
        // Catalogs
        listaFlota,
        listaPeso,
        listaMedida
    };
}
