import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { UpdateMiViajeKmsDto } from '@entities/employee/model/types';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useLayoutStore } from '@shared/store/layout.store';
import { getErrorMessage } from '@shared/utils/api-errors';
import { useToast } from '@shared/components/ui/Toast/useToast';
import {
    getUpdateMisViajesKmsDefaultValues,
    updateMisViajesKmsSchema,
    type UpdateMisViajesKmsForm,
    type UpdateMisViajesKmsFormInput,
} from '../../model/schema';

export function useMisViajeDetailPageController() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const viajeId = Number(id);
    const canManageViajeKms = usePermission(PERMISSIONS.EMPLOYEE.VIAJES.GESTIONAR);
    const [activeTab, setActiveTab] = useState(0);

    const { data: viaje, isLoading, isError, refetch } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajeDetail(viajeId),
        queryFn: () => employeePortalApi.getMyViajeById(viajeId),
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

    const form = useForm<UpdateMisViajesKmsFormInput, unknown, UpdateMisViajesKmsForm>({
        resolver: zodResolver(updateMisViajesKmsSchema),
        defaultValues: getUpdateMisViajesKmsDefaultValues(),
    });

    useEffect(() => {
        setPageTitle('Mis Viajes');
    }, [setPageTitle]);

    useEffect(() => {
        if (!viaje) {
            return;
        }

        form.reset(getUpdateMisViajesKmsDefaultValues({
            kmInicio: viaje.kmInicio,
            kmLlegada: viaje.kmLlegada,
            kmLlegadaBase: viaje.kmLlegadaBase,
        }));
    }, [form, viaje]);

    const showKmsTab = canManageViajeKms;
    const currentTab = showKmsTab ? activeTab : 0;
    const isKmsTabActive = showKmsTab && currentTab === 1;

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        if (!showKmsTab && newValue !== 0) {
            return;
        }

        setActiveTab(newValue);
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

    return {
        canManageViajeKms,
        currentTab,
        form,
        handleBack,
        handleTabChange,
        isKmsTabActive,
        isError,
        isLoading,
        onSubmitKms,
        retryViajeLoad: () => refetch(),
        showKmsTab,
        updateKmsMutation,
        viaje,
    };
}
