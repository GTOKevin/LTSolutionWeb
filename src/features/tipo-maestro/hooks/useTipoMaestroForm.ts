import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tipoMaestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { tipoMaestroSchema, type TipoMaestroSchema } from '../model/schema';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';

interface UseTipoMaestroFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (id: number) => void;
    maestroToEdit: TipoMaestro | null;
}

export function useTipoMaestroForm({ open, onClose, onSuccess, maestroToEdit }: UseTipoMaestroFormProps) {
    const queryClient = useQueryClient();
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

    const mutation = useMutation({
        mutationFn: async (data: TipoMaestroSchema) => {
            if (isEdit && maestroToEdit) {
                await tipoMaestroApi.update(maestroToEdit.tipoMaestroID, data);
                return maestroToEdit.tipoMaestroID;
            }
            const response = await tipoMaestroApi.create(data);
            return response.data;
        },
        onSuccess: (id: number) => {
            queryClient.invalidateQueries({ queryKey: ['tipo-maestros'] });
            queryClient.invalidateQueries({ queryKey: ['secciones-maestro'] }); // Invalidate sections as we might have added one
            onSuccess(id);
            onClose();
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<TipoMaestroSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
            }
        }
    });

    const onSubmit = (data: TipoMaestroSchema) => {
        mutation.mutate(data);
    };

    return {
        form,
        errorMessage,
        setErrorMessage,
        secciones,
        onSubmit,
        isEdit,
        isSubmitting: mutation.isPending
    };
}
