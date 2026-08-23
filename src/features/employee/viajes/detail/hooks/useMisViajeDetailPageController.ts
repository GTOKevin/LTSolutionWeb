import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type {
    CreateMiViajeGuiaDto,
    CreateMiViajeIncidenteDto,
    UpdateMiViajeKmsDto,
} from '@entities/employee/model/types';
import { useLayoutStore } from '@shared/store/layout.store';
import { getErrorMessage } from '@shared/utils/api-errors';
import { useToast } from '@shared/components/ui/Toast/useToast';
import { useViajeCatalogOptions } from '@features/viaje/options/hooks/useViajeCatalogOptions';
import {
    getUpdateMisViajesKmsDefaultValues,
    getUpdateMisViajeStatusDefaultValues,
    updateMisViajeStatusSchema,
    updateMisViajesKmsSchema,
    type UpdateMisViajeStatusForm,
    type UpdateMisViajeStatusFormInput,
    type UpdateMisViajesKmsForm,
    type UpdateMisViajesKmsFormInput,
} from '../../model/schema';
import {
    isEmployeeViajeClosed,
    isEmployeeViajeWorkflowBlocked,
    resolveEmployeeViajeNextEstadoId,
} from '../../model/workflow';

export type MisViajeTabKey = 'resumen' | 'estado' | 'incidentes' | 'guias' | 'permisos' | 'kms';

/**
 * Descriptor de tab con datos planos (sin JSX). El armado visual (iconos, badges)
 * es responsabilidad de la capa UI (`MisViajeDetailPageContent`), no del controller.
 */
export interface MisViajeTabDescriptor {
    key: MisViajeTabKey;
    label: string;
    count?: number;
    highlight?: boolean;
}

export function useMisViajeDetailPageController() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const viajeId = Number(id);
    const [activeTabKey, setActiveTabKey] = useState<MisViajeTabKey>('resumen');
    const resourceFilters = { page: 1, size: 100 };

    const { data: viaje, isLoading, isError, refetch } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajeDetail(viajeId),
        queryFn: () => employeePortalApi.getMyViajeById(viajeId),
        enabled: Number.isFinite(viajeId) && viajeId > 0,
    });

    const { estados, tiposIncidente, tiposGuia } = useViajeCatalogOptions(Number.isFinite(viajeId) && viajeId > 0);

    const { data: permisos } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajePermisos(viajeId, resourceFilters),
        queryFn: () => employeePortalApi.getMyViajePermisos(viajeId, resourceFilters),
        enabled: Number.isFinite(viajeId) && viajeId > 0,
    });

    const { data: incidentes } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajeIncidentes(viajeId, resourceFilters),
        queryFn: () => employeePortalApi.getMyViajeIncidentes(viajeId, resourceFilters),
        enabled: Number.isFinite(viajeId) && viajeId > 0,
    });

    const { data: guias } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajeGuias(viajeId, resourceFilters),
        queryFn: () => employeePortalApi.getMyViajeGuias(viajeId, resourceFilters),
        enabled: Number.isFinite(viajeId) && viajeId > 0,
    });

    const updateKmsMutation = useMutation({
        mutationFn: (payload: UpdateMiViajeKmsDto) => employeePortalApi.updateMyViajeKms(viajeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Kilometraje actualizado correctamente', severity: 'success' });
        },
        onError: (error: unknown) => {
            const msg = getErrorMessage(error, 'Error al actualizar kilometraje');
            showToast({ message: msg, severity: 'error' });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: (payload: UpdateMisViajeStatusForm) => employeePortalApi.updateMyViajeStatus(viajeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Estado del viaje actualizado correctamente', severity: 'success' });
        },
        onError: (error: unknown) => {
            const msg = getErrorMessage(error, 'Error al actualizar el estado del viaje');
            showToast({ message: msg, severity: 'error' });
        },
    });

    const createIncidenteMutation = useMutation({
        mutationFn: (payload: CreateMiViajeIncidenteDto) => employeePortalApi.createMyViajeIncidente(viajeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajeIncidentes(viajeId, resourceFilters) });
            showToast({ message: 'Incidente registrado correctamente', severity: 'success' });
        },
        onError: (error: unknown) => {
            const msg = getErrorMessage(error, 'Error al registrar incidente');
            showToast({ message: msg, severity: 'error' });
        },
    });

    const createGuiaMutation = useMutation({
        mutationFn: (payload: CreateMiViajeGuiaDto) => employeePortalApi.createMyViajeGuia(viajeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajeGuias(viajeId, resourceFilters) });
            showToast({ message: 'Guía registrada correctamente', severity: 'success' });
        },
        onError: (error: unknown) => {
            const msg = getErrorMessage(error, 'Error al registrar guía');
            showToast({ message: msg, severity: 'error' });
        },
    });

    const kmsForm = useForm<UpdateMisViajesKmsFormInput, unknown, UpdateMisViajesKmsForm>({
        resolver: zodResolver(updateMisViajesKmsSchema),
        defaultValues: getUpdateMisViajesKmsDefaultValues(),
    });

    const statusForm = useForm<UpdateMisViajeStatusFormInput, unknown, UpdateMisViajeStatusForm>({
        resolver: zodResolver(updateMisViajeStatusSchema),
        defaultValues: getUpdateMisViajeStatusDefaultValues(),
    });

    useEffect(() => {
        setPageTitle('Mis Viajes');
    }, [setPageTitle]);

    useEffect(() => {
        if (!viaje) {
            return;
        }

        kmsForm.reset(getUpdateMisViajesKmsDefaultValues({
            kmInicio: viaje.kmInicio,
            kmLlegada: viaje.kmLlegada,
            kmLlegadaBase: viaje.kmLlegadaBase,
        }));
        statusForm.reset(getUpdateMisViajeStatusDefaultValues({
            estadoId: viaje.estadoId,
            fechaLlegada: viaje.fechaLlegada,
        }));
    }, [kmsForm, statusForm, viaje]);

    // L-1 (review): `isCerrado` (administrativo) y `isWorkflowBlocked` (cerrado/facturado/completado)
    // son criterios intencionalmente distintos. Un viaje facturado o completado aún puede corregir
    // KMs o conservar su historial visible; solo el cierre administrativo termina la vida del viaje
    // en el portal y oculta los formularios/tabs de acción.
    const isCerrado = isEmployeeViajeClosed(viaje);

    const nextEstadoId = resolveEmployeeViajeNextEstadoId(viaje, estados);
    const nextEstado = estados?.find((item) => item.id === nextEstadoId) ?? null;
    const isClosedForWorkflow = isEmployeeViajeWorkflowBlocked(viaje);

    const incidentesItems = incidentes?.items ?? [];
    const guiasItems = guias?.items ?? [];
    const permisosItems = permisos?.items ?? [];

    const hasKmsInfo = Boolean(viaje?.kmInicio || viaje?.kmLlegada || viaje?.kmLlegadaBase);
    const hasNextEstado = Boolean(nextEstado);

    const tabs: MisViajeTabDescriptor[] = useMemo(
        () => [
            { key: 'resumen', label: 'Resumen' },
            ...(isCerrado
                ? []
                : [{ key: 'estado' as const, label: 'Estado', highlight: hasNextEstado }]),
            { key: 'incidentes', label: 'Incidentes', count: incidentesItems.length },
            { key: 'guias', label: 'Guías', count: guiasItems.length },
            { key: 'permisos', label: 'Permisos', count: permisosItems.length },
            ...(isCerrado
                ? []
                : [{ key: 'kms' as const, label: 'KMs', highlight: hasKmsInfo }]),
        ],
        [isCerrado, hasNextEstado, incidentesItems.length, guiasItems.length, permisosItems.length, hasKmsInfo],
    );

    // L-2 (review): si la tab activa desaparece (ej. viaje cerrado mientras estaba en "estado"/"kms"),
    // la UI cae a "resumen" pero el estado interno quedaba desincronizado. Ajuste de estado durante
    // el render (patrón oficial de React: "adjusting some state when a prop changes") — sin efecto.
    if (activeTabKey !== 'resumen' && !tabs.some((tab) => tab.key === activeTabKey)) {
        setActiveTabKey('resumen');
    }

    const currentTabIndex = Math.max(0, tabs.findIndex((tab) => tab.key === activeTabKey));
    const activeVisibleTabKey = tabs[currentTabIndex]?.key ?? 'resumen';

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        const nextTab = tabs[newValue];
        if (nextTab) {
            setActiveTabKey(nextTab.key);
        }
    };

    const handleBack = () => {
        navigate(APP_PATHS.misViajes);
    };

    const onSubmitKms = (data: UpdateMisViajesKmsForm) => {
        updateKmsMutation.mutate({
            kmInicio: data.kmInicio,
            kmLlegada: data.kmLlegada,
            kmLlegadaBase: data.kmLlegadaBase,
        });
    };

    const submitNextEstado = (fechaLlegada?: string | null) => {
        if (!nextEstadoId) {
            return;
        }

        updateStatusMutation.mutate({
            estadoId: nextEstadoId,
            fechaLlegada: fechaLlegada || null,
        });
    };

    const saveFechaLlegada = (fechaLlegada?: string | null) => {
        if (!viaje) {
            return;
        }

        updateStatusMutation.mutate({
            estadoId: viaje.estadoId,
            fechaLlegada: fechaLlegada || null,
        });
    };

    return {
        activeVisibleTabKey,
        canManageViaje: true,
        canManageViajeKms: true,
        createGuiaMutation,
        createIncidenteMutation,
        currentTabIndex,
        estados,
        guias: guiasItems,
        handleBack,
        handleTabChange,
        incidentes: incidentesItems,
        isCerrado,
        isError,
        isLoading,
        isWorkflowBlocked: isClosedForWorkflow,
        kmsForm,
        nextEstado,
        onSubmitKms,
        permisos: permisosItems,
        retryViajeLoad: () => refetch(),
        saveFechaLlegada,
        statusForm,
        submitNextEstado,
        tabs,
        tiposGuia: tiposGuia ?? [],
        tiposIncidente: tiposIncidente ?? [],
        updateKmsMutation,
        updateStatusMutation,
        viaje,
    };
}
