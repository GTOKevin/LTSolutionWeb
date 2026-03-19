import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rolColaboradorSchema, type RolColaboradorSchema } from '../model/schema';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { useCreateRolColaborador, useUpdateRolColaborador } from './useRolColaboradorCrud';

interface UseRolColaboradorFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (id?: number) => void;
    rolToEdit?: RolColaborador | null;
}

export function useRolColaboradorForm({ open, onClose, onSuccess, rolToEdit }: UseRolColaboradorFormProps) {
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

    const createMutation = useCreateRolColaborador();
    const updateMutation = useUpdateRolColaborador();

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

    const onSubmit = (data: RolColaboradorSchema) => {
        if (isEdit && rolToEdit) {
            updateMutation.mutate(
                { id: rolToEdit.rolColaboradorID, data },
                {
                    onSuccess: () => {
                        onSuccess();
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
                }
            );
        } else {
            createMutation.mutate(
                data,
                {
                    onSuccess: () => {
                        onSuccess();
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
                }
            );
        }
    };

    return {
        form,
        errorMessage,
        setErrorMessage,
        onSubmit,
        isEdit,
        isSubmitting: createMutation.isPending || updateMutation.isPending
    };
}
