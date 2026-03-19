import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@shared/api/maestro.api';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import { monedaApi } from '@/shared/api/moneda.api';
import { createColaboradorSchema, type CreateColaboradorSchema } from '../model/schema';
import { useEffect, useState } from 'react';
import type { Colaborador } from '@entities/colaborador/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import { useCreateColaborador, useUpdateColaborador } from './useColaboradorCrud';
import type { AxiosError } from 'axios';

interface UseColaboradorFormProps {
    colaboradorToEdit?: Colaborador | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useColaboradorForm({ colaboradorToEdit, onSuccess, onClose, open }: UseColaboradorFormProps) {
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const isEdit = !!colaboradorToEdit;
    const effectiveId = colaboradorToEdit?.colaboradorID || createdId;
    const canEditDetails = !!effectiveId;

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
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_SEXO),
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
            setActiveTab(0);
            setCreatedId(null);
            setErrorMessage(null);
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
        }
    }, [open, colaboradorToEdit, reset]);

    // --- Mutations ---
    const handleError = (error: AxiosError | any) => {
        const genericError = handleBackendErrors<CreateColaboradorSchema>(error, setError);
        if (genericError) {
            setErrorMessage(genericError);
            setOpenSnackbar(true);
        }
    };

    const handleSuccess = (id: number) => {
        onSuccess(id);
        if (!isEdit && !createdId) {
            setCreatedId(id);
        } else {
            onClose();
        }
    };

    const onSubmit = (data: CreateColaboradorSchema) => {
        if (isEdit && colaboradorToEdit) {
            updateMutation.mutate(
                { id: colaboradorToEdit.colaboradorID, data },
                {
                    onSuccess: () => handleSuccess(colaboradorToEdit.colaboradorID),
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
        openSnackbar,
        setOpenSnackbar,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        
        // Catalogs
        roles,
        generos,
        monedas
    };
}
