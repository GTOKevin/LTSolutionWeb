import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    GridOn as GridOnIcon,
    LocalAtm as LocalAtmIcon,
    LocalGasStation as LocalGasStationIcon,
    Payments as PaymentsIcon,
    PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import type { Viaje, ViajeGasto, ViajeGastoCurrencyTotal } from '@/entities/viaje/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatCurrencyAmount, formatDecimalAmount } from '@/shared/utils/format-utils';
import { toViajeCurrencyDescriptor } from '@/entities/viaje/model/currency';
import { getCombustibleGastos, getTotalGalonesConsumidos } from '../../model/gasto-derivations';
import { useViajeGastos } from '@features/viaje/hooks/useViajeGastos';
import { useViajeGastoOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { useViajeGastosReports } from '../../hooks/useViajeGastosReports';
import { SimpleDataTable, type SimpleDataTableColumn } from '@shared/components/ui/SimpleDataTable';

interface ViajeGastosSectionProps {
    viaje: Pick<Viaje, 'viajeID'>;
}

export function ViajeGastosSection({ viaje }: ViajeGastosSectionProps) {
    const theme = useTheme();
    const { data: gastosData, isLoading: isLoadingGastos } = useViajeGastos(viaje.viajeID, 1, 100);
    const { monedas } = useViajeGastoOptions(true);
    const { loadingMessage, handleExportExcel, handleExportPdf } = useViajeGastosReports();

    const gastos = gastosData?.items ?? [];
    const totalsByCurrency = gastosData?.totalsByCurrency ?? [];

    const totalGalonesConsumidos = getTotalGalonesConsumidos(gastos);
    const combustibleGastos = getCombustibleGastos(gastos);

    const resolveMonedaDescriptor = (monedaId: number) =>
        toViajeCurrencyDescriptor(monedas?.find((item) => item.id === monedaId));

    return (
        <Stack spacing={3}>
            {/* Encabezado + Export */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <PaymentsIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" fontWeight={800}>
                            Costo y Gastos de Viaje
                        </Typography>
                        <Chip
                            label={`${gastos.length} ${gastos.length === 1 ? 'gasto' : 'gastos'}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Detalle de suma general y exportación de gastos detallados.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<GridOnIcon />}
                        onClick={() => handleExportExcel(viaje.viajeID)}
                        disabled={isLoadingGastos || !!loadingMessage}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                        Excel
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleExportPdf(viaje.viajeID)}
                        disabled={isLoadingGastos || !!loadingMessage}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                        PDF
                    </Button>
                </Stack>
            </Stack>

            {loadingMessage ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                        {loadingMessage}
                    </Typography>
                </Stack>
            ) : null}

            {/* Resumen por moneda */}
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Resumen por Moneda
                </Typography>
                <GridTotals totalsByCurrency={totalsByCurrency} isLoading={isLoadingGastos} />
            </Box>

            {/* Galones consumidos */}
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Galones Consumidos
                </Typography>
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <LocalGasStationIcon color="primary" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                                Total combustible
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {combustibleGastos.length}{' '}
                                {combustibleGastos.length === 1 ? 'gasto con combustible' : 'gastos con combustible'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                        {isLoadingGastos ? '—' : `${formatDecimalAmount(totalGalonesConsumidos)} gal`}
                    </Typography>
                </Paper>
            </Box>

            {/* Tabla detallada */}
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Gastos Detallados
                </Typography>

                {isLoadingGastos ? (
                    <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                        <CircularProgress size={24} />
                    </Paper>
                ) : (
                    <GastosTable
                        gastos={gastos}
                        resolveMonedaDescriptor={resolveMonedaDescriptor}
                    />
                )}
            </Box>
        </Stack>
    );
}

function GastosTable({
    gastos,
    resolveMonedaDescriptor,
}: {
    gastos: ViajeGasto[];
    resolveMonedaDescriptor: (monedaId: number) => { codigo?: string; nombre?: string };
}) {
    const columns: SimpleDataTableColumn<ViajeGasto>[] = [
        {
            header: 'Tipo',
            render: (gasto) => (
                <Typography variant="body2" fontWeight={700}>
                    {gasto.gasto?.nombre || 'Otro'}
                </Typography>
            ),
        },
        {
            header: 'Descripción',
            render: (gasto) => (
                <Typography variant="body2" color="text.secondary">
                    {gasto.descripcion || '—'}
                </Typography>
            ),
        },
        {
            header: 'Fecha',
            render: (gasto) => (
                <Typography variant="body2">
                    {formatDateShort(gasto.fechaGasto)}
                </Typography>
            ),
        },
        {
            header: 'Comprobante',
            render: (gasto) =>
                gasto.comprobante ? (
                    <Chip
                        label={gasto.numeroComprobante || 'SÍ'}
                        size="small"
                        variant="outlined"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                ) : (
                    <Typography variant="caption" color="text.disabled">No</Typography>
                ),
        },
        {
            header: 'Monto',
            align: 'right',
            render: (gasto) => (
                <>
                    <Typography variant="body2" fontWeight={800}>
                        {formatCurrencyAmount(Number(gasto.monto), resolveMonedaDescriptor(gasto.monedaID))}
                    </Typography>
                    {gasto.combustible && gasto.galones ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {gasto.galones} Gal.
                        </Typography>
                    ) : null}
                </>
            ),
        },
    ];

    return (
        <SimpleDataTable
            columns={columns}
            rows={gastos}
            rowKey={(gasto) => gasto.viajeGastoID}
            emptyMessage="No hay gastos registrados para este viaje."
        />
    );
}

function GridTotals({ totalsByCurrency, isLoading }: { totalsByCurrency: ViajeGastoCurrencyTotal[]; isLoading: boolean }) {
    const localTheme = useTheme();

    if (isLoading) {
        return (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                <CircularProgress size={20} />
            </Paper>
        );
    }

    if (totalsByCurrency.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <LocalAtmIcon color="disabled" />
                    <Typography variant="body2" color="text.secondary">
                        Sin totales registrados
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    return (
        <Grid container spacing={2}>
            {totalsByCurrency.map((total) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={total.code}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: alpha(localTheme.palette.primary.main, 0.04),
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Total {total.code || total.symbol || 'Moneda'}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                            {total.symbol} {formatDecimalAmount(Number(total.total))}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}
