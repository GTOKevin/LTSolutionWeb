import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { createMantenimientoSchema, type CreateMantenimientoFormInput, type CreateMantenimientoSchema } from '../model/schema';
import { useEffect, useMemo, useState } from 'react';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { resolveMantenimientoCompletadoId } from '@entities/mantenimiento/model/status';
import { ESTADO_SECTIONS, TIPO_MAESTRO_SECTIONS } from '@entities/master-data/model/constants';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { useCreateMantenimiento, useUpdateMantenimiento } from './useMantenimientoCrud';
import { useCrudFormPageState } from '@shared/hooks/useCrudFormPageState';

interface UseMantenimientoFormProps {
    mantenimientoToEdit?: Mantenimiento | null;
    onSuccess: (id: number) => void;
    onCreateSuccess?: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useMantenimientoForm({ mantenimientoToEdit, onSuccess, onCreateSuccess, onClose, open }: UseMantenimientoFormProps) {
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [pendingData, setPendingData] = useState<CreateMantenimientoSchema | null>(null);
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
        entityId: mantenimientoToEdit?.mantenimientoID,
        onSuccess,
        onClose,
        detailsTabIndex: 1,
        keepOpenAfterCreate: false,
        createSuccessBehavior: onCreateSuccess ? 'delegate' : 'close',
        onCreateSuccess,
    });

    // --- Queries ---
    const { data: flotas } = useQuery({
        queryKey: ['flotas-select'],
        queryFn: () => flotaApi.getSelect({ search: '', limit: 50 }),
        enabled: open
    });

    const { data: tiposServicio } = useQuery({
        queryKey: ['tipos-servicio'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO_SECTIONS.SERVICIO),
        enabled: open
    });

    const { data: estados } = useQuery({
        queryKey: ['estados-select'],
        queryFn: () => estadoApi.getSelect(undefined, undefined, ESTADO_SECTIONS.MANTENIMIENTO),
        enabled: open
    });

    const listaFlotas = flotas || [];
    const listaTiposServicio = tiposServicio || [];
    const listaEstados = estados || [];
    const estadoCompletadoId = resolveMantenimientoCompletadoId(listaEstados);

    // --- Form ---
    const mantenimientoSchema = useMemo(
        () => createMantenimientoSchema(estadoCompletadoId),
        [estadoCompletadoId],
    );
    const form = useForm<CreateMantenimientoFormInput, unknown, CreateMantenimientoSchema>({
        resolver: zodResolver(mantenimientoSchema)
    });

    const { reset, setError } = form;

    const createMutation = useCreateMantenimiento();
    const updateMutation = useUpdateMantenimiento();

    // --- Effects ---
    useEffect(() => {
        if (open) {
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

            const resetConfirmationTimer = window.setTimeout(() => {
                setPendingData(null);
                setConfirmationOpen(false);
            }, 0);
            const cleanupUiState = resetUiState();

            return () => {
                window.clearTimeout(resetConfirmationTimer);
                cleanupUiState();
            };
        }
    }, [open, mantenimientoToEdit, reset, resetUiState]);

    const handleError = (error: unknown) => {
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
                    onSuccess: () => handleMutationSuccess(mantenimientoToEdit.mantenimientoID),
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
            createMutation.mutate(data, {
                onSuccess: (response: number) => handleMutationSuccess(response),
                onError: handleError
            });
        }
    };

    const onSubmit: SubmitHandler<CreateMantenimientoSchema> = (data) => {
        if (estadoCompletadoId && data.estadoID === estadoCompletadoId) {
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
