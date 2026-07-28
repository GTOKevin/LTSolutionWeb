import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import type { ClienteContacto } from '@entities/cliente/model/types';
import type { PagedResponse } from '@shared/model/types';
import {
    createContactoDefaultValues,
    createContactoSchema,
    type CreateContactoSchema,
} from '@features/cliente/model/schema';
import {
    useCreateClienteContacto,
    useDeleteClienteContacto,
    useUpdateClienteContacto,
} from '@features/cliente/hooks/useClienteContactosCrud';

interface UseClienteContactosControllerArgs {
    clienteId: number;
}

function mapContactoToFormValues(contacto: ClienteContacto): CreateContactoSchema {
    return {
        nombreCompleto: contacto.nombreCompleto,
        email: contacto.email || '',
        telefonoPrincipal: contacto.telefonoPrincipal,
        telefonoSecundario: contacto.telefonoSecundario || '',
        rol: contacto.rol || '',
        activo: contacto.activo,
    };
}

export function useClienteContactosController({ clienteId }: UseClienteContactosControllerArgs) {
    const formRef = useRef<HTMLDivElement>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isFormExpanded, setIsFormExpanded] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [contactoToDelete, setContactoToDelete] = useState<ClienteContacto | null>(null);

    const contactosQuery = useQuery<PagedResponse<ClienteContacto>>({
        queryKey: ['cliente-contactos', clienteId, page, rowsPerPage],
        queryFn: () => clienteApi.getContactos(clienteId, undefined, undefined, page + 1, rowsPerPage),
        enabled: clienteId > 0,
    });

    const form = useForm<CreateContactoSchema>({
        resolver: zodResolver(createContactoSchema),
        defaultValues: createContactoDefaultValues,
    });

    const createMutation = useCreateClienteContacto();
    const updateMutation = useUpdateClienteContacto();
    const deleteMutation = useDeleteClienteContacto();

    const scrollToForm = useCallback(() => {
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    const resetForm = useCallback(() => {
        form.reset(createContactoDefaultValues);
        setEditingId(null);
        setIsFormExpanded(false);
    }, [form]);

    const handleCreate = useCallback(() => {
        resetForm();
        setIsFormExpanded(true);
        scrollToForm();
    }, [resetForm, scrollToForm]);

    const handleEdit = useCallback((contacto: ClienteContacto) => {
        setEditingId(contacto.clienteContactoID);
        form.reset(mapContactoToFormValues(contacto));
        setIsFormExpanded(true);
        scrollToForm();
    }, [form, scrollToForm]);

    const handleDeleteRequest = useCallback((contacto: ClienteContacto) => {
        setContactoToDelete(contacto);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (!contactoToDelete) {
            return;
        }

        deleteMutation.mutate(contactoToDelete.clienteContactoID, {
            onSuccess: () => {
                setContactoToDelete(null);
            },
        });
    }, [contactoToDelete, deleteMutation]);

    const submit = useCallback((formData: CreateContactoSchema) => {
        if (editingId) {
            updateMutation.mutate(
                { id: editingId, data: formData },
                { onSuccess: resetForm },
            );
            return;
        }

        createMutation.mutate(
            { clienteId, data: formData },
            { onSuccess: resetForm },
        );
    }, [clienteId, createMutation, editingId, resetForm, updateMutation]);

    const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    return {
        formRef,
        form,
        data: contactosQuery.data,
        isLoading: contactosQuery.isLoading,
        editingId,
        isFormExpanded,
        page,
        rowsPerPage,
        contactoToDelete,
        createMutation,
        updateMutation,
        deleteMutation,
        onSubmit: form.handleSubmit(submit),
        resetForm,
        handleCreate,
        handleEdit,
        handleDeleteRequest,
        handleDeleteConfirm,
        closeDeleteDialog: () => setContactoToDelete(null),
        toggleFormExpanded: () => setIsFormExpanded((prev) => !prev),
        openForm: () => setIsFormExpanded(true),
        setPage,
        handleRowsPerPageChange,
    };
}

export type ClienteContactosController = ReturnType<typeof useClienteContactosController>;
