import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { tipoMaestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { tipoMaestroSchema, type TipoMaestroSchema } from '../model/schema';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { useCreateTipoMaestro, useUpdateTipoMaestro } from './useTipoMaestroCrud';

interface UseTipoMaestroFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (id?: number) => void;
    maestroToEdit: TipoMaestro | null;
}

export function useTipoMaestroForm({ open, onClose, onSuccess, maestroToEdit }: UseTipoMaestroFormProps) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isEdit = !!maestroToEdit;

    const form = useForm<TipoMaestroSchema>({
        resolver: zodResolver(tipoMaestroSchema),
        defaultValues: {
            nombre: '',
            codigo: '',
            seccion: '',
            activo: true
        }
    });

    const { reset, setError } = form;

    const createMutation = useCreateTipoMaestro();
    const updateMutation = useUpdateTipoMaestro();

    // Fetch secciones for Autocomplete
    const { data: secciones } = useQuery({
        queryKey: ['secciones-maestro'],
        queryFn: tipoMaestroApi.getSecciones,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            if (maestroToEdit) {
                reset({
                    nombre: maestroToEdit.nombre,
                    codigo: maestroToEdit.codigo || '',
                    seccion: maestroToEdit.seccion || '',
                    activo: maestroToEdit.activo
                });
            } else {
                reset({
                    nombre: '',
                    codigo: '',
                    seccion: '',
                    activo: true
                });
            }
        }
    }, [open, maestroToEdit, reset]);

    const onSubmit = (data: TipoMaestroSchema) => {
        if (isEdit && maestroToEdit) {
            updateMutation.mutate(
                { id: maestroToEdit.tipoMaestroID, data },
                {
                    onSuccess: () => {
                        onSuccess();
                        onClose();
                    },
                    onError: (error: any) => {
                        const genericError = handleBackendErrors<TipoMaestroSchema>(error, setError);
                        if (genericError) {
                            setErrorMessage(genericError);
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
                        const genericError = handleBackendErrors<TipoMaestroSchema>(error, setError);
                        if (genericError) {
                            setErrorMessage(genericError);
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
        secciones,
        onSubmit,
        isEdit,
        isSubmitting: createMutation.isPending || updateMutation.isPending
    };
}
