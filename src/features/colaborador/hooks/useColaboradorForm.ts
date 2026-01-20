import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import { maestroApi } from '@shared/api/maestro.api';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { createColaboradorSchema, type CreateColaboradorSchema } from '../model/schema';
import { useEffect, useState } from 'react';
import type { Colaborador } from '@entities/colaborador/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';

interface UseColaboradorFormProps {
    colaboradorToEdit?: Colaborador | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    open: boolean;
}

export function useColaboradorForm({ colaboradorToEdit, onSuccess, onClose, open }: UseColaboradorFormProps) {
    const queryClient = useQueryClient();
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const isEdit = !!colaboradorToEdit;
    const effectiveId = colaboradorToEdit?.colaboradorID || createdId;
    const canEditDetails = !!effectiveId;

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
    const mutation = useMutation({
        mutationFn: async (data: CreateColaboradorSchema) => {
            if (isEdit && colaboradorToEdit) {
                await colaboradorApi.update(colaboradorToEdit.colaboradorID, data);
                return colaboradorToEdit.colaboradorID;
            }
            if (createdId) {
                await colaboradorApi.update(createdId, data);
                return createdId;
            }
            const response = await colaboradorApi.create(data);
            return response.data;
        },
        onSuccess: (id: number) => {
            queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
            onSuccess(id);
            if (!isEdit && !createdId) {
                setCreatedId(id);
                // Optionally move to next tab or keep open
                // onClose(); 
            } else {
                onClose();
            }
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<CreateColaboradorSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
                setOpenSnackbar(true);
            }
        }
    });

    const onSubmit = (data: CreateColaboradorSchema) => {
        mutation.mutate(data);
    };

    return {
        form,
        mutation,
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
        
        // Catalogs
        roles,
        generos,
        monedas
    };
}
