import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { usuarioApi } from '@entities/usuario/api/usuario.api';
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import { estadoApi } from '@shared/api/estado.api';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import { createUsuarioSchemaFull, editUsuarioSchemaFull, type CreateUsuarioSchema, type UsuarioFormSchema } from '../model/schema';
import { useEffect, useState } from 'react';
import type { Usuario, CreateUsuarioDto } from '@entities/usuario/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';

interface UseUsuarioFormProps {
    usuarioToEdit?: Usuario | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useUsuarioForm({ usuarioToEdit, onSuccess, onClose, open }: UseUsuarioFormProps) {
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const isEdit = !!usuarioToEdit;

    // --- Queries ---
    const { data: roles } = useQuery({
        queryKey: ['roles-usuario-select'],
        queryFn: () => rolUsuarioApi.getSelect(),
        enabled: open
    });

    const { data: estados } = useQuery({
        queryKey: ['estados-usuario-select'],
        queryFn: () => estadoApi.getSelect(),
        enabled: open
    });

    const { data: colaboradores } = useQuery({
        queryKey: ['colaboradores-select-available', usuarioToEdit?.colaboradorID],
        queryFn: () => colaboradorApi.getSelectAvailable(usuarioToEdit?.colaboradorID),
        enabled: open
    });

    const listaRoles = roles?.data || [];
    const listaEstados = estados?.data || [];
    const listaColaboradores = colaboradores?.data || [];

    // --- Form ---
    const form = useForm({
        resolver: zodResolver(isEdit ? editUsuarioSchemaFull : createUsuarioSchemaFull),
        defaultValues: {
            nombre: '',
            email: '',
            rolUsuarioID: 0,
            estadoID: 1, // Default Activo
            colaboradorID: 0,
            clave: ''
        }
    });

    const { reset, setError, setValue } = form;

    // --- Effects ---
    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            setShowPassword(false);
            setActiveTab(0);
            
            if (usuarioToEdit) {
                reset({
                    nombre: usuarioToEdit.nombre,
                    email: usuarioToEdit.email || '',
                    rolUsuarioID: usuarioToEdit.rolUsuarioID,
                    estadoID: usuarioToEdit.estadoID,
                    colaboradorID: usuarioToEdit.colaboradorID || 0,
                    clave: '' // Password not populated on edit
                });
            } else {
                reset({
                    nombre: '',
                    email: '',
                    rolUsuarioID: 0,
                    estadoID: 1, // Default Activo
                    colaboradorID: 0,
                    clave: ''
                });
            }
        }
    }, [open, usuarioToEdit, reset]);

    // --- Mutations ---
    const mutation = useMutation({
        mutationFn: async (data: UsuarioFormSchema) => {
            const commonData = {
                nombre: data.nombre,
                email: data.email,
                rolUsuarioID: data.rolUsuarioID,
                estadoID: data.estadoID,
                colaboradorID: data.colaboradorID || undefined
            };

            if (isEdit && usuarioToEdit) {
                const updateData: CreateUsuarioDto = {
                    ...commonData,
                    clave: data.clave || '' 
                };
                await usuarioApi.update(usuarioToEdit.usuarioID, updateData);
                return usuarioToEdit.usuarioID;
            }
            
            const createData: CreateUsuarioDto = {
                ...commonData,
                clave: data.clave!
            };
            const response = await usuarioApi.create(createData);
            return response;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            onSuccess(id);
            onClose();
        },
        onError: (error: unknown) => {
            const genericError = handleBackendErrors<CreateUsuarioSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
            }
        }
    });

    const onSubmit = (data: UsuarioFormSchema) => {
        mutation.mutate(data);
    };

    // --- Helpers ---
    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const generateSecurePassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            pass += charset[randomValues[i] % charset.length];
        }
        
        setValue('clave', pass);
        setShowPassword(true);
    };

    return {
        form,
        mutation,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        
        // Lists
        listaRoles,
        listaEstados,
        listaColaboradores,
        
        // Password helpers
        showPassword,
        handleTogglePasswordVisibility,
        generateSecurePassword,
        
        isEdit
    };
}
