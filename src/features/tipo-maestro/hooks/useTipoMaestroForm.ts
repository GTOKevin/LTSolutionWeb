import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { tipoMaestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { tipoMaestroSchema, type TipoMaestroSchema } from '../model/schema';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { useDebounce } from '@shared/hooks/useDebounce';
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
            tipoMaestroID: 0,
            nombre: '',
            codigo: '',
            seccion: '',
            activo: true
        }
    });

    const { reset, setError, setValue, formState } = form;
    const selectedSeccion = useWatch({
        control: form.control,
        name: 'seccion',
    });
    const currentTipoMaestroId = useWatch({
        control: form.control,
        name: 'tipoMaestroID',
    });

    const createMutation = useCreateTipoMaestro();
    const updateMutation = useUpdateTipoMaestro();

    // Fetch secciones for Autocomplete
    const { data: secciones } = useQuery({
        queryKey: ['secciones-maestro'],
        queryFn: tipoMaestroApi.getSecciones,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const normalizedSeccion = selectedSeccion?.trim() ?? '';
    const debouncedSeccion = useDebounce(open && !isEdit ? normalizedSeccion : '', 300);

    const { data: seccionResumen } = useQuery({
        queryKey: ['tipo-maestro-section-hints', debouncedSeccion],
        queryFn: () => tipoMaestroApi.getSeccionResumen(debouncedSeccion),
        enabled: open && !isEdit && debouncedSeccion.length >= 2,
        staleTime: 1000 * 60 * 2
    });

    useEffect(() => {
        if (open) {
            if (maestroToEdit) {
                reset({
                    tipoMaestroID: maestroToEdit.tipoMaestroID,
                    nombre: maestroToEdit.nombre,
                    codigo: maestroToEdit.codigo || '',
                    seccion: maestroToEdit.seccion || '',
                    activo: maestroToEdit.activo
                });
            } else {
                reset({
                    tipoMaestroID: 0,
                    nombre: '',
                    codigo: '',
                    seccion: '',
                    activo: true
                });
            }

            const resetUiTimer = window.setTimeout(() => {
                setErrorMessage(null);
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, maestroToEdit, reset]);

    useEffect(() => {
        if (!open || isEdit) {
            return;
        }

        const suggestedId = seccionResumen?.siguienteIdSugerido;
        if (!suggestedId) {
            return;
        }

        const shouldSeedSuggestedId = !formState.dirtyFields.tipoMaestroID && (!currentTipoMaestroId || currentTipoMaestroId <= 0);
        if (shouldSeedSuggestedId) {
            setValue('tipoMaestroID', suggestedId, { shouldDirty: false, shouldValidate: true });
        }
    }, [currentTipoMaestroId, formState.dirtyFields.tipoMaestroID, isEdit, open, seccionResumen?.siguienteIdSugerido, setValue]);

    const onSubmit = (data: TipoMaestroSchema) => {
        if (isEdit && maestroToEdit) {
            updateMutation.mutate(
                { id: maestroToEdit.tipoMaestroID, data },
                {
                    onSuccess: () => {
                        onSuccess();
                        onClose();
                    },
                    onError: (error: unknown) => {
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
                    onError: (error: unknown) => {
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
        seccionResumen,
        onSubmit,
        isEdit,
        isSubmitting: createMutation.isPending || updateMutation.isPending
    };
}
