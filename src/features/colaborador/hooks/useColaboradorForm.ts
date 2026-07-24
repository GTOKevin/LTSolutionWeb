import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { createColaboradorSchema, type CreateColaboradorSchema } from '../model/schema';
import { useEffect, useState } from 'react';
import type { Colaborador } from '@entities/colaborador/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { useCreateColaborador, useUpdateColaborador } from './useColaboradorCrud';
import { useCrudFormPageState } from '@shared/hooks/useCrudFormPageState';

interface UseColaboradorFormProps {
    colaboradorToEdit?: Colaborador | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useColaboradorForm({ colaboradorToEdit, onSuccess, onClose, open }: UseColaboradorFormProps) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
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
        entityId: colaboradorToEdit?.colaboradorID,
        onSuccess,
        onClose,
        detailsTabIndex: 2,
        keepOpenAfterCreate: true,
    });

    const createMutation = useCreateColaborador();
    const updateMutation = useUpdateColaborador();

    // --- Queries ---
    const { data: roles } = useQuery({
        queryKey: ['roles-colaborador'],
        queryFn: () => rolColaboradorApi.getSelect(undefined, 100),
        enabled: open
    });

    const { data: generos } = useQuery({
        queryKey: ['tipos-genero'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.SEXO),
        enabled: open
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect(undefined, 100),
        enabled: open
    });

    // --- Form ---
    const form = useForm({
        resolver: zodResolver(createColaboradorSchema),
        defaultValues: {
            activo: true,
            rolColaboradorID: 0,
            tipoGeneroID: 0,
            nombres: '',
            primerApellido: '',
            segundoApellido: '',
            direccion: '',
            telefono: '',
            email: '',
            fechaNacimiento: '',
            fechaIngreso: new Date().toISOString().split('T')[0],
            monedaID: 0,
            salario: 0
        }
    });

    const { reset, setError } = form;

    // --- Effects ---
    useEffect(() => {
        if (open) {
            if (colaboradorToEdit) {
                reset({
                    rolColaboradorID: colaboradorToEdit.rolColaboradorID,
                    tipoGeneroID: colaboradorToEdit.tipoGeneroID,
                    nombres: colaboradorToEdit.nombres,
                    primerApellido: colaboradorToEdit.primerApellido,
                    segundoApellido: colaboradorToEdit.segundoApellido || '',
                    direccion: colaboradorToEdit.direccion || '',
                    telefono: colaboradorToEdit.telefono || '',
                    email: colaboradorToEdit.email || '',
                    fechaNacimiento: colaboradorToEdit.fechaNacimiento || '',
                    fechaIngreso: colaboradorToEdit.fechaIngreso || '',
                    monedaID: colaboradorToEdit.monedaID,
                    salario: colaboradorToEdit.salario,
                    activo: colaboradorToEdit.activo
                });
            } else {
                reset({
                    rolColaboradorID: 0,
                    tipoGeneroID: 0,
                    nombres: '',
                    primerApellido: '',
                    segundoApellido: '',
                    direccion: '',
                    telefono: '',
                    email: '',
                    fechaNacimiento: '',
                    fechaIngreso: new Date().toISOString().split('T')[0],
                    monedaID: 0,
                    salario: 0,
                    activo: true
                });
            }

            const resetSnackbarTimer = window.setTimeout(() => {
                setOpenSnackbar(false);
            }, 0);
            const cleanupUiState = resetUiState();

            return () => {
                window.clearTimeout(resetSnackbarTimer);
                cleanupUiState();
            };
        }
    }, [open, colaboradorToEdit, reset, resetUiState]);

    // --- Mutations ---
    const handleError = (error: unknown) => {
        const genericError = handleBackendErrors<CreateColaboradorSchema>(error, setError);
        if (genericError) {
            setErrorMessage(genericError);
            setOpenSnackbar(true);
        }
    };

    const onSubmit = (data: CreateColaboradorSchema) => {
        if (isEdit && colaboradorToEdit) {
            updateMutation.mutate(
                { id: colaboradorToEdit.colaboradorID, data },
                {
                    onSuccess: () => handleMutationSuccess(colaboradorToEdit.colaboradorID),
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
                    onSuccess: (result) => handleMutationSuccess(result),
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
        openSnackbar,
        setOpenSnackbar,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        
        // Catalogs
        roles,
        generos: generos ?? [],
        monedas: monedas ?? []
    };
}
