import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { estadoApi } from '@shared/api/estado.api';
import { maestroApi } from '@shared/api/maestro.api';
import { createMantenimientoSchema, type CreateMantenimientoSchema } from '../model/schema';
import { useEffect, useState } from 'react';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { TIPO_ESTADO, TIPO_MAESTRO } from '@/shared/constants/constantes';

interface UseMantenimientoFormProps {
    mantenimientoToEdit?: Mantenimiento | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useMantenimientoForm({ mantenimientoToEdit, onSuccess, onClose, open }: UseMantenimientoFormProps) {
    const queryClient = useQueryClient();
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
        queryFn: () => flotaApi.getSelect(),
        enabled: open
    });

    const { data: tiposServicio } = useQuery({
        queryKey: ['tipos-servicio'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_SERVICIO),
        enabled: open
    });

    const { data: estados } = useQuery({
        queryKey: ['estados-select'],
        queryFn: () => estadoApi.getSelect(undefined, undefined, TIPO_ESTADO.MANTENIMIENTO),
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

    // --- Mutations ---
    const mutation = useMutation({
        mutationFn: (data: CreateMantenimientoSchema) => {
            if (isEdit && mantenimientoToEdit) {
                return mantenimientoApi.update(mantenimientoToEdit.mantenimientoID, data).then(() => mantenimientoToEdit.mantenimientoID);
            }
            if (createdId) {
                return mantenimientoApi.update(createdId, data).then(() => createdId);
            }
            return mantenimientoApi.create(data);
        },
        onSuccess: (id: number) => {
            queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
            onSuccess(id);

            if (!isEdit && !createdId) {
                setCreatedId(id);
                onClose();
            } else {
                onClose();
            }
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<CreateMantenimientoSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
            }
        }
    });

    const onSubmit: SubmitHandler<CreateMantenimientoSchema> = (data) => {
        if (data.estadoID === 102) { // Completed/Finalized
            setPendingData(data);
            setConfirmationOpen(true);
        } else {
            mutation.mutate(data);
        }
    };

    const handleConfirmSave = () => {
        if (pendingData) {
            mutation.mutate(pendingData);
            setConfirmationOpen(false);
            setPendingData(null);
        }
    };

    return {
        form,
        mutation,
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
