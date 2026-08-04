import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useForm, type Resolver, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { APP_PATHS, buildAppDetailPath } from '@shared/config/app-routes';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import { MONEDA_CODES, ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import { getSelectItemId } from '@entities/master-data/lib/catalog-utils';
import { resolveFacturaGeneradaId } from '@entities/factura/model/status';
import {
    createFacturaSchema,
    getCreateFacturaDefaultValues,
    mapFacturaToFormValues,
    buildCreateFacturaPayload,
    buildUpdateFacturaPayload,
    type CreateFacturaSchema,
} from '../../model/schema';
import { useCreateFactura, useFactura, useUpdateFactura } from '../../hooks/useFacturaCrud';
import { useToast } from '@shared/components/ui/Toast';
import { getErrorMessage } from '@shared/utils/api-errors';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { resolveCurrencyLabel } from '@shared/utils/format-utils';
import { logger } from '@shared/utils/logger';

interface UseFacturaCreateEditControllerArgs {
    id?: number;
    viewOnly?: boolean;
}

export function useFacturaCreateEditController({
    id,
    viewOnly = false,
}: UseFacturaCreateEditControllerArgs) {
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const {
        data: factura,
        isLoading: isLoadingFactura,
        isError: isFacturaError,
        refetch: refetchFactura,
    } = useFactura(id);
    const createMutation = useCreateFactura();
    const updateMutation = useUpdateFactura();
    const isSaving = createMutation.isPending || updateMutation.isPending;
    const facturaCurrencyLabel = resolveCurrencyLabel(factura?.moneda);

    const form = useForm<CreateFacturaSchema>({
        resolver: zodResolver(createFacturaSchema) as Resolver<CreateFacturaSchema>,
        defaultValues: getCreateFacturaDefaultValues(),
    });

    useEffect(() => {
        if (isEdit && factura) {
            form.reset(mapFacturaToFormValues(factura));
        }
    }, [factura, form, isEdit]);

    const { data: clientes } = useQuery({
        queryKey: ['clientes', 'select'],
        queryFn: () => clienteApi.getSelect('', 50),
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas', 'select'],
        queryFn: () => monedaApi.getSelect('', 50),
    });

    const { data: facturaEstadosResponse } = useQuery({
        queryKey: ['estados', 'factura-select'],
        queryFn: () => estadoApi.getSelect('', 20, ESTADO_SECTIONS.FACTURA),
    });

    const monedaDefaultId = getSelectItemId(monedas, [MONEDA_CODES.PEN]);
    const estadoGeneradoId = resolveFacturaGeneradaId(facturaEstadosResponse);
    const hasFacturaLoadError = isEdit && !isLoadingFactura && (isFacturaError || !factura);

    useEffect(() => {
        if (!isEdit && monedaDefaultId && !form.getValues('monedaID')) {
            form.setValue('monedaID', monedaDefaultId);
        }
    }, [form, isEdit, monedaDefaultId]);

    useEffect(() => {
        if (!isEdit && estadoGeneradoId && !form.getValues('estadoID')) {
            form.setValue('estadoID', estadoGeneradoId, { shouldValidate: true });
        }
    }, [estadoGeneradoId, form, isEdit]);

    const handleFormSubmit: SubmitHandler<CreateFacturaSchema> = async (data) => {
        try {
            if (isEdit && !factura) {
                showToast({
                    message: 'No se pudo cargar la factura a editar. Reintente la consulta antes de guardar.',
                    severity: 'error',
                });
                return;
            }

            if (isEdit && factura) {
                await updateMutation.mutateAsync({
                    id: factura.facturaID,
                    data: buildUpdateFacturaPayload(data),
                });
                navigate(APP_PATHS.facturas);
                return;
            }

            const newId = await createMutation.mutateAsync(
                buildCreateFacturaPayload(data, estadoGeneradoId ?? data.estadoID)
            );
            navigate(buildAppDetailPath(APP_PATHS.facturas, newId));
        } catch (error) {
            const message =
                handleBackendErrors<CreateFacturaSchema>(error, form.setError)
                ?? getErrorMessage(error, 'No se pudo guardar la factura.');
            logger.error('Error al guardar la factura:', error);
            showToast({ message, severity: 'error' });
        }
    };

    const handleInvalidSubmit: SubmitErrorHandler<CreateFacturaSchema> = (formErrors) => {
        if (!isEdit && formErrors.estadoID) {
            showToast({
                message: 'No se pudo resolver el estado inicial de la factura. Recargue la pagina e intente nuevamente.',
                severity: 'error',
            });
            return;
        }

        showToast({
            message: 'Complete los campos obligatorios de la factura antes de guardar.',
            severity: 'warning',
        });
    };

    const title = viewOnly
        ? `Detalle de Factura ${factura?.serie}-${factura?.numero}`
        : isEdit
            ? `Factura ${factura?.serie}-${factura?.numero}`
            : 'Nueva Factura';
    const subtitle = viewOnly
        ? 'Consulta de comprobante electrónico'
        : 'Registro de comprobante electrónico';

    return {
        form,
        factura,
        clientes,
        monedas,
        isEdit,
        viewOnly,
        isLoadingFactura,
        hasFacturaLoadError,
        isSaving,
        estadoGeneradoId,
        facturaCurrencyLabel,
        title,
        subtitle,
        retryFacturaLoad: () => refetchFactura(),
        navigateBack: () => navigate(APP_PATHS.facturas),
        onSubmit: form.handleSubmit(handleFormSubmit, handleInvalidSubmit),
    };
}

export type FacturaCreateEditController = ReturnType<typeof useFacturaCreateEditController>;
