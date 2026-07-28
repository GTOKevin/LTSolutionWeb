import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createClienteDefaultValues,
    createClienteSchema,
    mapClienteToFormValues,
    type CreateClienteSchema,
} from '../model/schema';
import type { Cliente } from '@entities/cliente/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { useCreateCliente, useUpdateCliente } from './useClienteCrud';

interface UseClienteFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (clienteId: number) => void;
    clienteToEdit?: Cliente | null;
}

export function useClienteForm({ open, onClose, onSuccess, clienteToEdit }: UseClienteFormProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [createdClientId, setCreatedClientId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isEdit = !!clienteToEdit;
    const effectiveClienteId = clienteToEdit?.clienteID || createdClientId;
    const canEditContacts = !!effectiveClienteId;

    const form = useForm<CreateClienteSchema>({
        resolver: zodResolver(createClienteSchema),
        defaultValues: createClienteDefaultValues,
    });

    const { reset, setError } = form;

    const createMutation = useCreateCliente();
    const updateMutation = useUpdateCliente();

    useEffect(() => {
        if (open) {
            reset(clienteToEdit ? mapClienteToFormValues(clienteToEdit) : createClienteDefaultValues);

            const resetUiTimer = window.setTimeout(() => {
                setActiveTab(0);
                setCreatedClientId(null);
                setErrorMessage(null);
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, clienteToEdit, reset]);

    const handleSuccess = (id: number) => {
        onSuccess(id);
        if (!isEdit && !createdClientId) {
            setCreatedClientId(id);
            setActiveTab(1);
        } else {
            onClose();
        }
    };

    const handleError = (error: unknown) => {
        const genericError = handleBackendErrors<CreateClienteSchema>(error, setError);
        if (genericError) {
            setErrorMessage(genericError);
        }
    };

    const onSubmit = (data: CreateClienteSchema) => {
        if (isEdit && clienteToEdit) {
            updateMutation.mutate(
                { id: clienteToEdit.clienteID, data },
                {
                    onSuccess: () => handleSuccess(clienteToEdit.clienteID),
                    onError: handleError
                }
            );
        } else if (createdClientId) {
            updateMutation.mutate(
                { id: createdClientId, data },
                {
                    onSuccess: () => handleSuccess(createdClientId),
                    onError: handleError
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: (id) => handleSuccess(id as number),
                onError: handleError
            });
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return {
        form,
        activeTab,
        errorMessage,
        setErrorMessage,
        handleTabChange,
        onSubmit,
        isEdit,
        createdClientId,
        effectiveClienteId,
        canEditContacts,
        isSubmitting
    };
}
