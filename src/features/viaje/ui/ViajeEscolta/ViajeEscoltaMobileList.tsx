import { 
    Box, 
    Typography, 
    useTheme, 
    alpha,
    Grid,
    Chip
} from '@mui/material';
import { 
    Person as PersonIcon,
    DirectionsCar as CarIcon,
    Security as SecurityIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import type { ViajeEscolta } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { MobileListShell } from '../MobileListShell';

interface Props {
    items: ViajeEscolta[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
    onEdit?: (item: ViajeEscolta) => void;
    onDelete?: (id: number) => void;
}

export function ViajeEscoltaMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    flotas,
    colaboradores,
    onEdit, 
    onDelete 
}: Props) {
    const theme = useTheme();

    const getEscoltaInfo = (item: ViajeEscolta) => {
        if (item.tercero) {
            return {
                tipo: 'Tercero',
                conductor: item.nombreConductor || '-',
                vehiculo: item.empresa || '-' 
            };
        }
        const flota = flotas.find(f => f.id === item.flotaID)?.text || item.flota?.placa || '-';
        const colab = colaboradores.find(c => c.id === item.colaboradorID)?.text || item.colaborador?.nombres || '-';
        return {
            tipo: 'Propio',
            conductor: colab,
            vehiculo: flota
        };
    };

    return (
        <MobileListShell
            items={items}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            viewOnly={viewOnly}
            emptyMessage="No hay escoltas registradas"
            keyExtractor={(item) => item.viajeEscoltaID}
            onEdit={onEdit}
            onDelete={onDelete ? (item) => onDelete(item.viajeEscoltaID) : undefined}
            getCardStyle={(item) => {
                const info = getEscoltaInfo(item);
                const isPropio = info.tipo === 'Propio';
                return {
                    borderLeft: `4px solid ${isPropio ? theme.palette.primary.main : theme.palette.warning.main}`
                };
            }}
            renderHeader={(item) => {
                const info = getEscoltaInfo(item);
                const isPropio = info.tipo === 'Propio';
                return (
                    <Chip 
                        label={info.tipo} 
                        size="small" 
                        icon={<SecurityIcon sx={{ fontSize: '1rem !important' }} />}
                        sx={{ 
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            bgcolor: isPropio ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                            color: isPropio ? 'primary.main' : 'warning.main',
                            border: `1px solid ${isPropio ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.warning.main, 0.2)}`
                        }} 
                    />
                );
            }}
            renderBody={(item) => {
                const info = getEscoltaInfo(item);
                const isPropio = info.tipo === 'Propio';
                return (
                    <Grid container spacing={2}>
                        <Grid size={{xs:12}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">Conductor / Personal</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                                {info.conductor}
                            </Typography>
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                {isPropio ? <CarIcon sx={{ fontSize: 16 }} /> : <BusinessIcon sx={{ fontSize: 16 }} />}
                                <Typography variant="caption">
                                    {isPropio ? 'Vehículo' : 'Empresa'}
                                </Typography>
                            </Box>
                            <Typography variant="body2">
                                {info.vehiculo}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            }}
        />
    );
}
