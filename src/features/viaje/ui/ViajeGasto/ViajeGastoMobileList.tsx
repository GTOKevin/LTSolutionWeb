import { 
    Box, 
    Typography, 
    useTheme, 
    alpha,
    Grid
} from '@mui/material';
import { 
    CalendarToday as CalendarIcon,
    LocalGasStation as GasIcon,
    AttachMoney as MoneyIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import type { ViajeGasto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { MobileListShell } from '../MobileListShell';

interface Props {
    items: ViajeGasto[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposGasto: SelectItem[];
    monedas: SelectItem[];
    getExpenseVisualMeta: (text: string) => { color: string; backgroundColor: string };
    onEdit?: (item: ViajeGasto) => void;
    onDelete?: (id: number) => void;
}

export function ViajeGastoMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposGasto,
    monedas,
    getExpenseVisualMeta,
    onEdit, 
    onDelete 
}: Props) {
    const theme = useTheme();

    return (
        <MobileListShell
            items={items}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            viewOnly={viewOnly}
            emptyMessage="No hay gastos registrados"
            keyExtractor={(item) => item.viajeGastoID}
            onEdit={onEdit}
            onDelete={onDelete ? (item) => onDelete(item.viajeGastoID) : undefined}
            getCardStyle={(item) => {
                const tipo = tiposGasto.find(t => t.id === item.gastoID);
                const tipoText = tipo?.text || item.gasto?.descripcion || 'Otro';
                const expenseVisualMeta = getExpenseVisualMeta(tipoText);
                return { borderLeft: `4px solid ${expenseVisualMeta.color}` };
            }}
            renderHeader={(item) => {
                const tipo = tiposGasto.find(t => t.id === item.gastoID);
                const tipoText = tipo?.text || item.gasto?.descripcion || 'Otro';
                const expenseVisualMeta = getExpenseVisualMeta(tipoText);
                
                return (
                    <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: expenseVisualMeta.backgroundColor,
                        color: expenseVisualMeta.color,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                    }}>
                        {tipoText}
                    </Box>
                );
            }}
            renderBody={(item) => {
                const moneda = monedas.find(m => m.id === item.monedaID);
                const monedaSymbol = moneda?.extra || 'PEN';
                
                return (
                    <Grid container spacing={2}>
                        <Grid size={{xs:6}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                <CalendarIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">Fecha</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                                {formatDateShort(item.fechaGasto)}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:6}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                <MoneyIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">Monto</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                                {monedaSymbol} {Number(item.monto).toFixed(2)}
                            </Typography>
                        </Grid>

                        {(item.numeroComprobante || item.comprobante) && (
                            <Grid size={{xs:12}}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                    <TicketIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="caption">Comprobante</Typography>
                                </Box>
                                <Typography variant="body2" fontFamily="monospace">
                                    {item.numeroComprobante || 'Sin número'}
                                </Typography>
                            </Grid>
                        )}

                        {item.combustible && (
                            <Grid size={{xs:12}}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1, 
                                    bgcolor: alpha(theme.palette.info.main, 0.05),
                                    p: 1,
                                    borderRadius: 1
                                }}>
                                    <GasIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Galones:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {Number(item.galones).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                );
            }}
        />
    );
}
