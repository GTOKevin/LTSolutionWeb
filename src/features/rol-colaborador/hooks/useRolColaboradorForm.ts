import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import { rolColaboradorSchema, type RolColaboradorSchema } from '../model/schema';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';

interface UseRolColaboradorFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (id: number) => void;
    rolToEdit?: RolColaborador | null;
}

export function useRolColaboradorForm({ open, onClose, onSuccess, rolToEdit }: UseRolColaboradorFormProps) {
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const isEdit = !!rolToEdit;

    const form = useForm<RolColaboradorSchema>({
        resolver: zodResolver(rolColaboradorSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
            activo: true
        }
    });

    const { reset, setError } = form;

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            if (rolToEdit) {
                reset({
                    nombre: rolToEdit.nombre,
                    descripcion: rolToEdit.descripcion || '',
                    activo: rolToEdit.activo
                });
            } else {
                reset({
                    nombre: '',
                    descripcion: '',
                    activo: true
                });
            }
        }
    }, [open, rolToEdit, reset]);

    const mutation = useMutation({
        mutationFn: async (data: RolColaboradorSchema) => {
            if (isEdit && rolToEdit) {
                await rolColaboradorApi.update(rolToEdit.rolColaboradorID, data);
                return rolToEdit.rolColaboradorID;
            }
            const response = await rolColaboradorApi.create(data);
            return response.data;
        },
        onSuccess: (id: number) => {
            queryClient.invalidateQueries({ queryKey: ['roles-colaborador'] });
            onSuccess(id);
            onClose();
        },
        onError: (error: any) => {
            if (error?.response?.status === 409) {
                setErrorMessage('El nombre del rol ya se encuentra registrado.');
            } else {
                const genericError = handleBackendErrors<RolColaboradorSchema>(error, setError);
                if (genericError) {
                    setErrorMessage(genericError);
                }
            }
        }
    });

    const onSubmit = (data: RolColaboradorSchema) => {
        mutation.mutate(data);
    };

    return {
        form,
        errorMessage,
        setErrorMessage,
        onSubmit,
        isEdit,
        isSubmitting: mutation.isPending
    };
}
