import { Box, CircularProgress, Grid } from '@mui/material';
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
        isSaving,
        estadoGeneradoId,
        facturaCurrencyLabel,
        title,
        subtitle,
        navigateBack,
        onSubmit,
    } = controller;

    if (isEdit && isLoadingFactura) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
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
                canSubmit={!isSaving && (isEdit || Boolean(estadoGeneradoId))}
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
