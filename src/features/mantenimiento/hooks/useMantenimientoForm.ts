import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import { estadoApi } from '@shared/api/estado.api';
import { maestroApi } from '@shared/api/maestro.api';
import { createMantenimientoSchema, type CreateMantenimientoSchema } from '../model/schema';
import { useEffect, useState } from 'react';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { ESTADO_SECCIONES, TIPO_MAESTRO } from '@/shared/constants/constantes';
import { useCreateMantenimiento, useUpdateMantenimiento } from './useMantenimientoCrud';

interface UseMantenimientoFormProps {
    mantenimientoToEdit?: Mantenimiento | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useMantenimientoForm({ mantenimientoToEdit, onSuccess, onClose, open }: UseMantenimientoFormProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [pendingData, setPendingData] = useState<CreateMantenimientoSchema | null>(null);

    const isEdit = !!mantenimientoToEdit;
    const effectiveId = mantenimientoToEdit?.mantenimientoID || createdId;
    const canEditDetails = !!effectiveId;

    // --- Queries ---
    const { data: flotas } = useQuery({
        queryKey: ['flotas-select'],
        queryFn: () => flotaApi.getSelect({ search: '', limit: 50 }),
        enabled: open
    });

    const { data: tiposServicio } = useQuery({
        queryKey: ['tipos-servicio'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_SERVICIO),
        enabled: open
    });

    const { data: estados } = useQuery({
        queryKey: ['estados-select'],
        queryFn: () => estadoApi.getSelect(undefined, undefined, ESTADO_SECCIONES.MANTENIMIENTO),
        enabled: open
    });

    const listaFlotas = flotas?.data || [];
    const listaTiposServicio = tiposServicio?.data || [];
    const listaEstados = estados?.data || [];

    // --- Form ---
    const form = useForm({
        resolver: zodResolver(createMantenimientoSchema)
    });

    const { reset, setError } = form;

    const createMutation = useCreateMantenimiento();
    const updateMutation = useUpdateMantenimiento();

    // --- Effects ---
    useEffect(() => {
        if (open) {
            setActiveTab(0);
            setCreatedId(null);
            setErrorMessage(null);
            if (mantenimientoToEdit) {
                reset({
                    flotaID: mantenimientoToEdit.flotaID,
                    tipoServicioID: mantenimientoToEdit.tipoServicioID,
                    fechaIngreso: mantenimientoToEdit.fechaIngreso,
                    fechaSalida: mantenimientoToEdit.fechaSalida,
                    motivoIngreso: mantenimientoToEdit.motivoIngreso,
                    diagnosticoMecanico: mantenimientoToEdit.diagnosticoMecanico,
                    solucion: mantenimientoToEdit.solucion,
                    kmIngreso: mantenimientoToEdit.kmIngreso,
                    kmSalida: mantenimientoToEdit.kmSalida,
                    estadoID: mantenimientoToEdit.estadoID
                });
            } else {
                reset({
                    flotaID: 0,
                    tipoServicioID: 0,
                    fechaIngreso: new Date().toISOString().split('T')[0],
                    fechaSalida: undefined,
                    motivoIngreso: '',
                    diagnosticoMecanico: '',
                    solucion: '',
                    kmIngreso: 0,
                    kmSalida: 0,
                    estadoID: 0
                });
            }
        }
    }, [open, mantenimientoToEdit, reset]);

    const handleSuccess = (id: number) => {
        onSuccess(id);

        if (!isEdit && !createdId) {
            setCreatedId(id);
            onClose();
        } else {
            onClose();
        }
    };

    const handleError = (error: any) => {
        const genericError = handleBackendErrors<CreateMantenimientoSchema>(error, setError);
        if (genericError) {
            setErrorMessage(genericError);
        }
    };

    const submitData = (data: CreateMantenimientoSchema) => {
        if (isEdit && mantenimientoToEdit) {
            updateMutation.mutate(
                { id: mantenimientoToEdit.mantenimientoID, data },
                {
                    onSuccess: () => handleSuccess(mantenimientoToEdit.mantenimientoID),
                    onError: handleError
                }
            );
        } else if (createdId) {
            updateMutation.mutate(
                { id: createdId, data },
                {
                    onSuccess: () => handleSuccess(createdId),
                    onError: handleError
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: (response: any) => handleSuccess(response?.data || response),
                onError: handleError
            });
        }
    };

    const onSubmit: SubmitHandler<CreateMantenimientoSchema> = (data) => {
        if (data.estadoID === 102) { // Completed/Finalized
            setPendingData(data);
            setConfirmationOpen(true);
        } else {
            submitData(data);
        }
    };

    const handleConfirmSave = () => {
        if (pendingData) {
            submitData(pendingData);
            setConfirmationOpen(false);
            setPendingData(null);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return {
        form,
        isSubmitting,
        onSubmit,
        handleConfirmSave,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        confirmationOpen,
        setConfirmationOpen,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        
        // Catalogs
        listaFlotas,
        listaTiposServicio,
        listaEstados
    };
}
