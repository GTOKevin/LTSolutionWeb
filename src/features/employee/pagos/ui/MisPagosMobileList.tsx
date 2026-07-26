import { Box, Button, Stack, Typography } from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    DownloadForOffline as DownloadForOfflineIcon,
    Redeem as RedeemIcon,
    Work as WorkIcon,
} from '@mui/icons-material';
import type { PagedResponse } from '@shared/model/types';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { formatDateOnly } from '@shared/utils/date-utils';
import type { MiPagoDto } from '@entities/employee/model/types';

interface MisPagosMobileListProps {
    data?: PagedResponse<MiPagoDto>;
    isLoading: boolean;
    isRefreshing?: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    canConfirmPayments: boolean;
    actionsDisabled?: boolean;
    onConfirmPayment: (item: MiPagoDto) => void;
    onExportPayment: (item: MiPagoDto) => void;
    formatMoney: (item: MiPagoDto) => string;
}

export function MisPagosMobileList({
    data,
    isLoading,
    isRefreshing = false,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    canConfirmPayments,
    actionsDisabled = false,
    onConfirmPayment,
    onExportPayment,
    formatMoney,
}: MisPagosMobileListProps) {
    if (isLoading) {
        return <Box sx={{ display: { xs: 'block', md: 'none' }, p: 4, textAlign: 'center' }}>Cargando pagos...</Box>;
    }

    return (
        <MobileListShell
            items={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            emptyMessage="No se encontraron pagos con los filtros seleccionados."
            keyExtractor={(item) => item.colaboradorPagoId}
            renderHeader={(item) => {
                const isPending = item.confirmadoPago == null;

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: isPending ? 'primary.50' : 'success.50',
                                color: isPending ? 'primary.main' : 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {item.tipoPagoNombre.includes('Bono') ? <RedeemIcon /> : <WorkIcon />}
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {item.tipoPagoNombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Pago del {formatDateOnly(item.fechaPago)}
                            </Typography>
                        </Box>
                    </Box>
                );
            }}
            renderBody={(item) => {
                const isPending = item.confirmadoPago == null;

                return (
                    <Stack spacing={1.5}>
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                            {formatMoney(item)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Periodo: {formatDateOnly(item.fechaInicio)} - {formatDateOnly(item.fechaCierre)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Estado: {item.estadoConfirmacion}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.5 }}>
                            {isPending && canConfirmPayments ? (
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<CheckCircleIcon />}
                                    disabled={actionsDisabled}
                                    onClick={() => onConfirmPayment(item)}
                                    sx={{ borderRadius: 2, boxShadow: 'none' }}
                                >
                                    Confirmar pago
                                </Button>
                            ) : null}
                            <Button
                                size="small"
                                variant={isPending && canConfirmPayments ? 'outlined' : 'contained'}
                                startIcon={<DownloadForOfflineIcon />}
                                disabled={actionsDisabled}
                                onClick={() => onExportPayment(item)}
                                sx={{ borderRadius: 2, boxShadow: 'none' }}
                            >
                                Exportar
                            </Button>
                        </Box>
                        {isRefreshing ? (
                            <Typography variant="caption" color="text.secondary">
                                Actualizando resultados...
                            </Typography>
                        ) : null}
                    </Stack>
                );
            }}
        />
    );
}
