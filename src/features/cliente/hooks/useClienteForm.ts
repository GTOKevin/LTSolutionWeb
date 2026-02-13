import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { createClienteSchema, type CreateClienteSchema } from '../model/schema';
import type { Cliente } from '@entities/cliente/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';

interface UseClienteFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (clienteId: number) => void;
    clienteToEdit?: Cliente | null;
}

export function useClienteForm({ open, onClose, onSuccess, clienteToEdit }: UseClienteFormProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0);
    const [createdClientId, setCreatedClientId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const isEdit = !!clienteToEdit;
    const effectiveClienteId = clienteToEdit?.clienteID || createdClientId;
    const canEditContacts = !!effectiveClienteId;

    const form = useForm<CreateClienteSchema>({
        resolver: zodResolver(createClienteSchema),
        defaultValues: {
            activo: true
        }
    });

    const { reset, setError } = form;

    useEffect(() => {
        if (open) {
            setActiveTab(0);
            setCreatedClientId(null);
            setErrorMessage(null);
            setOpenSnackbar(false);

            if (clienteToEdit) {
                reset({
                    ruc: clienteToEdit.ruc,
                    razonSocial: clienteToEdit.razonSocial,
                    direccionLegal: clienteToEdit.direccionLegal || '',
                    direccionFiscal: clienteToEdit.direccionFiscal || '',
                    contactoPrincipal: clienteToEdit.contactoPrincipal,
                    telefono: clienteToEdit.telefono || '',
                    email: clienteToEdit.email || '',
                    activo: clienteToEdit.activo
                });
            } else {
                reset({
                    ruc: '',
                    razonSocial: '',
                    direccionLegal: '',
                    direccionFiscal: '',
                    contactoPrincipal: '',
                    telefono: '',
                    email: '',
                    activo: true
                });
            }
        }
    }, [open, clienteToEdit, reset]);

    const mutation = useMutation({
        mutationFn: async (data: CreateClienteSchema) => {
            if (isEdit && clienteToEdit) {
                await clienteApi.update(clienteToEdit.clienteID, data);
                return clienteToEdit.clienteID;
            }
            if (createdClientId) {
                await clienteApi.update(createdClientId, data);
                return createdClientId;
            }
            const response = await clienteApi.create(data);
            return response.data;
        },
        onSuccess: (id: number) => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            onSuccess(id);

            if (!isEdit && !createdClientId) {
                setCreatedClientId(id);
                setActiveTab(1);
            } else {
                onClose();
            }
        },
        onError: (error: any) => {
            console.warn("Mutation Error:", error);
            const genericError = handleBackendErrors<CreateClienteSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
                setOpenSnackbar(true);
            }
        }
    });

    const onSubmit = (data: CreateClienteSchema) => {
        mutation.mutate(data);
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return {
        form,
        activeTab,
        errorMessage,
        openSnackbar,
        setErrorMessage,
        setOpenSnackbar,
        handleTabChange,
        onSubmit,
        isEdit,
        createdClientId,
        effectiveClienteId,
        canEditContacts,
        mutation
    };
}
