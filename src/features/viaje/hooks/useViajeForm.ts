import { useState, useEffect } from 'react';
import { useForm, type UseFormReturn, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ui/Toast';
import { viajeSchema } from '../model/schema';
import { useViajeOptions } from './useViajeOptions';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { ESTADO_VIAJE_ID } from '@/shared/constants/constantes';
import { getCurrentDateISO, toInputDate } from '@/shared/utils/date-utils';
import type { CreateViajeDto, Viaje } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { notifyMutationError, type ApiMutationError } from '@/shared/utils/api-errors';

export const TAB_INDICES = {
    GENERAL: 0,
    MERCADERIA: 1,
    GUIAS: 2,
    GASTOS: 3,
    INCIDENTES: 4,
    PERMISOS: 5,
    ESCOLTA: 6
} as const;

interface UseViajeFormProps {
    open: boolean;
    onClose: () => void;
    viaje?: Viaje | null;
}

interface UseViajeFormReturn {
    methods: UseFormReturn<CreateViajeDto>;
    activeTab: number;
    handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
    onSubmit: (data: CreateViajeDto) => void;
    showConfirmDialog: boolean;
    setShowConfirmDialog: (show: boolean) => void;
    pendingData: CreateViajeDto | null;
    handleConfirmSave: () => void;
    mutation: UseMutationResult<number | void, ApiMutationError, CreateViajeDto, unknown>;
    options: ReturnType<typeof useViajeOptions>;
    requiereEscolta: boolean;
    requierePermiso: boolean;
}

export function useViajeForm({ open, onClose, viaje }: UseViajeFormProps): UseViajeFormReturn {
    const [activeTab, setActiveTab] = useState<number>(TAB_INDICES.GENERAL);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingData, setPendingData] = useState<CreateViajeDto | null>(null);
    
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    const options = useViajeOptions(open);
    const { tractos, carretas } = options;

    const methods = useForm<CreateViajeDto>({
        resolver: zodResolver(viajeSchema) as Resolver<CreateViajeDto>,
        defaultValues: {
            estadoID: 0,
            requiereEscolta: false,
            requierePermiso: false
        }
    });

    const { reset, watch, setValue } = methods;
    
    const requiereEscolta = watch('requiereEscolta');
    const requierePermiso = watch('requierePermiso');
    const selectedTractoID = watch('tractoID');
    const selectedCarretaID = watch('carretaID');

    // Update Ejes when Tracto changes
    useEffect(() => {
        if (selectedTractoID && tractos) {
            const tracto = tractos.find(t => t.id === selectedTractoID);
            if (tracto && tracto.extraTwo !== undefined) {
                 setValue('ejesTracto', parseInt(tracto.extraTwo));
            }
        }
    }, [selectedTractoID, tractos, setValue]);

    // Update Ejes when Carreta changes
    useEffect(() => {
        if (selectedCarretaID && carretas) {
            const carreta = carretas.find(c => c.id === selectedCarretaID);
            if (carreta && carreta.extraTwo !== undefined) {
                 setValue('ejesCarreta', parseInt(carreta.extraTwo));
            }
        }
    }, [selectedCarretaID, carretas, setValue]);

    const mutation = useMutation<number | void, ApiMutationError, CreateViajeDto>({
        mutationFn: (data: CreateViajeDto) => {
            const cleanData = {
                ...data,
                fechaLlegada: data.fechaLlegada || undefined,
                fechaPartida: data.fechaPartida || undefined,
                fechaDescarga: data.fechaDescarga || undefined,
                fechaLlegadaBase: data.fechaLlegadaBase || undefined,
            };

            if (viaje?.viajeID) {
                return viajeApi.update(viaje.viajeID, { ...cleanData, viajeID: viaje.viajeID });
            }
            return viajeApi.create(cleanData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            showToast({ 
                entity: 'Viaje',
                action: viaje?.viajeID ? 'update' : 'create'
            });
            onClose();
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(
                showToast,
                'Viaje',
                viaje?.viajeID ? 'update' : 'create',
                error,
                'Error saving viaje:'
            );
        }
    });

    useEffect(() => {
        if (open) {
            // Refetch options
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.options.clientes() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.options.tractos() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.options.carretas() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.options.flotasEscolta() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.options.colaboradores() });

            if (viaje) {
                reset({
                    ...viaje,
                    clienteID: viaje.clienteID || 0,
                    colaboradorID: viaje.colaboradorID || 0,
                    cotizacionID: viaje.cotizacionID ?? undefined,
                    tractoID: viaje.tractoID || 0,
                    carretaID: viaje.carretaID || 0,
                    estadoID: viaje.estadoID || 0,
                    direccionOrigen: viaje.direccionOrigen ?? undefined,
                    direccionDestino: viaje.direccionDestino ?? undefined,
                    fechaCarga: viaje.fechaCarga ? toInputDate(viaje.fechaCarga) : '',
                    fechaPartida: viaje.fechaPartida ? toInputDate(viaje.fechaPartida) : undefined,
                    fechaLlegada: viaje.fechaLlegada ? toInputDate(viaje.fechaLlegada) : undefined,
                    fechaDescarga: viaje.fechaDescarga ? toInputDate(viaje.fechaDescarga) : undefined,
                    fechaLlegadaBase: viaje.fechaLlegadaBase ? toInputDate(viaje.fechaLlegadaBase) : undefined,
                    kmInicio: viaje.kmInicio ?? undefined,
                    kmLlegada: viaje.kmLlegada ?? undefined,
                    kmLlegadaBase: viaje.kmLlegadaBase ?? undefined,
                    tipoMedidaID: viaje.tipoMedidaID || 0,
                    tipoPesoID: viaje.tipoPesoID || 0,  
                    requiereEscolta: viaje.requiereEscolta ?? false,
                    requierePermiso: viaje.requierePermiso ?? false,
                    largo: viaje.largo ?? undefined,
                    alto: viaje.alto ?? undefined,
                    ancho: viaje.ancho ?? undefined,
                    peso: viaje.peso ?? undefined,
                    ejesTracto: viaje.ejesTracto || 0,
                    ejesCarreta: viaje.ejesCarreta || 0
                });
            } else {
                reset({
                    estadoID: 0,
                    requiereEscolta: false,
                    requierePermiso: false,
                    fechaCarga: getCurrentDateISO(),
                    clienteID: 0,
                    colaboradorID: 0,
                    tractoID: 0,
                    carretaID: 0,
                    ejesTracto: 0,
                    ejesCarreta: 0,
                    tipoMedidaID: 0,
                    tipoPesoID: 0,
                    largo: 0,
                    alto: 0,
                    ancho: 0,
                    peso: 0,
                    kmInicio: 0,
                    kmLlegada: 0,
                    kmLlegadaBase: 0,
                });
            }
            setActiveTab(TAB_INDICES.GENERAL);
            setShowConfirmDialog(false);
            setPendingData(null);
        }
    }, [open, viaje, reset, queryClient]);

    const onSubmit = (data: CreateViajeDto) => {
        if (data.estadoID === ESTADO_VIAJE_ID.COMPLETADO || data.estadoID === ESTADO_VIAJE_ID.CANCELADO) {
            setPendingData(data);
            setShowConfirmDialog(true);
        } else {
            mutation.mutate(data);
        }
    };

    const handleConfirmSave = () => {
        if (pendingData) {
            const cleanData = {
                ...pendingData,
                fechaLlegada: pendingData.fechaLlegada || undefined,
                fechaPartida: pendingData.fechaPartida || undefined,
                fechaDescarga: pendingData.fechaDescarga || undefined,
                fechaLlegadaBase: pendingData.fechaLlegadaBase || undefined
            };
            mutation.mutate(cleanData);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return {
        methods,
        activeTab,
        handleTabChange,
        onSubmit,
        showConfirmDialog,
        setShowConfirmDialog,
        pendingData,
        handleConfirmSave,
        mutation,
        options,
        requiereEscolta: !!requiereEscolta,
        requierePermiso: !!requierePermiso
    };
}
