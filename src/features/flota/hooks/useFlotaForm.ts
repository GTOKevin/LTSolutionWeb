import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@shared/api/maestro.api';
import { createFlotaSchema, type CreateFlotaSchema } from '../model/schema';
import { useEffect, useState } from 'react';
import type { Flota } from '@entities/flota/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import { useCreateFlota, useUpdateFlota } from './useFlotaCrud';
import type { AxiosError } from 'axios';

interface UseFlotaFormProps {
    flotaToEdit?: Flota | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useFlotaForm({ flotaToEdit, onSuccess, onClose, open }: UseFlotaFormProps) {
    const [createdFlotaId, setCreatedFlotaId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const isEdit = !!flotaToEdit;
    const effectiveFlotaId = flotaToEdit?.flotaID || createdFlotaId;
    const canEditDocs = !!effectiveFlotaId;

    const createMutation = useCreateFlota();
    const updateMutation = useUpdateFlota();

    // --- Queries ---
    const { data: tiposFlota } = useQuery({
        queryKey: ['tipos-flota'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_FLOTA),
        enabled: open
    });

    const { data: tiposPeso } = useQuery({
        queryKey: ['tipos-peso'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_PESO),
        enabled: open
    });

    const { data: tiposMedida } = useQuery({
        queryKey: ['tipos-medida'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_MEDIDA),
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
            setActiveTab(0);
            setCreatedFlotaId(null);
            setErrorMessage(null);
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
        }
    }, [open, flotaToEdit, reset]);

    // --- Mutations ---
    const handleError = (error: AxiosError | any) => {
        const genericError = handleBackendErrors<CreateFlotaSchema>(error, setError);
        if (genericError) {
            setErrorMessage(genericError);
        }
    };

    const handleSuccess = (id: number) => {
        onSuccess(id);
        if (!isEdit && !createdFlotaId) {
            setCreatedFlotaId(id);
            setActiveTab(1); 
        } else {
            onClose();
        }
    };

    const onSubmit = (data: CreateFlotaSchema) => {
        if (isEdit && flotaToEdit) {
            updateMutation.mutate(
                { id: flotaToEdit.flotaID, data },
                {
                    onSuccess: () => handleSuccess(flotaToEdit.flotaID),
                    onError: handleError
                }
            );
        } else if (createdFlotaId) {
            updateMutation.mutate(
                { id: createdFlotaId, data },
                {
                    onSuccess: () => handleSuccess(createdFlotaId),
                    onError: handleError
                }
            );
        } else {
            createMutation.mutate(
                data,
                {
                    onSuccess: (response) => handleSuccess(response.data),
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
        effectiveFlotaId,
        canEditDocs,
        isEdit,
        createdFlotaId,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        
        // Catalogs
        listaFlota,
        listaPeso,
        listaMedida
    };
}
