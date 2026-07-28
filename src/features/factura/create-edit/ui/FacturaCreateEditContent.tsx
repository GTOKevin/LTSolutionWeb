import { Alert, Box, Button, CircularProgress, Grid, Stack } from '@mui/material';
import { FacturaDetalles } from '../../detalles/ui';
import type { FacturaCreateEditController } from '../hooks/useFacturaCreateEditController';
import { FacturaBasicInfoForm } from './FacturaBasicInfoForm';
import { FacturaCreateEditHeader } from './FacturaCreateEditHeader';
import { FacturaFinancialSummaryCard } from './FacturaFinancialSummaryCard';

interface FacturaCreateEditContentProps {
    controller: FacturaCreateEditController;
}

export function FacturaCreateEditContent({ controller }: FacturaCreateEditContentProps) {
    const {
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
        navigateBack,
        retryFacturaLoad,
        onSubmit,
    } = controller;

    if (isEdit && isLoadingFactura) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (hasFacturaLoadError) {
        return (
            <Box sx={{ maxWidth: 960, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Alert
                    severity="error"
                    action={(
                        <Button color="inherit" size="small" onClick={retryFacturaLoad}>
                            Reintentar
                        </Button>
                    )}
                    sx={{ borderRadius: 3 }}
                >
                    No se pudo cargar la factura solicitada. Reintente la consulta o vuelva al listado antes de continuar.
                </Alert>
                <Stack direction="row" justifyContent="flex-end">
                    <Button variant="outlined" color="inherit" onClick={navigateBack}>
                        Volver al listado
                    </Button>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FacturaCreateEditHeader
                title={title}
                subtitle={subtitle}
                viewOnly={viewOnly}
                isSaving={isSaving}
                canSubmit={!isSaving && !hasFacturaLoadError && (isEdit || Boolean(estadoGeneradoId))}
                onBack={navigateBack}
            />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <FacturaBasicInfoForm
                            form={form}
                            clientes={clientes}
                            monedas={monedas}
                            isEdit={isEdit}
                            viewOnly={viewOnly}
                            onSubmit={onSubmit}
                        />

                        {isEdit && factura ? (
                            <Box>
                                <FacturaDetalles factura={factura} forceReadOnly={viewOnly} />
                            </Box>
                        ) : null}
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
                        <FacturaFinancialSummaryCard
                            factura={isEdit ? factura : undefined}
                            currencyLabel={facturaCurrencyLabel}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
