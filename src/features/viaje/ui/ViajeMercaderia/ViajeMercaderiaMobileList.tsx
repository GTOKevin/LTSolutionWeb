import { 
    Box, 
    Typography, 
    useTheme, 
    alpha,
    Grid
} from '@mui/material';
import { 
    Inventory2 as InventoryIcon,
    Straighten as RulerIcon,
    Scale as ScaleIcon
} from '@mui/icons-material';
import type { ViajeMercaderia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { MobileListShell } from '../MobileListShell';

interface Props {
    items: ViajeMercaderia[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposMedida: SelectItem[];
    tiposPeso: SelectItem[];
    mercaderias: SelectItem[];
    onEdit?: (item: ViajeMercaderia) => void;
    onDelete?: (id: number) => void;
}

export function ViajeMercaderiaMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposMedida,
    tiposPeso,
    mercaderias,
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
            emptyMessage="No hay mercaderías registradas"
            keyExtractor={(item) => item.viajeMercaderiaID}
            onEdit={onEdit}
            onDelete={onDelete ? (item) => onDelete(item.viajeMercaderiaID) : undefined}
            renderHeader={(item) => {
                const mercaderiaNombre = mercaderias.find(m => m.id === item.mercaderiaID)?.text;
                const displayName = item.descripcion || mercaderiaNombre || 'Sin descripción';
                const secondaryName = (mercaderiaNombre && item.descripcion && item.descripcion !== mercaderiaNombre) ? mercaderiaNombre : null;
                
                return (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <InventoryIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                {displayName}
                            </Typography>
                            {secondaryName && (
                                <Typography variant="caption" color="text.secondary">
                                    {secondaryName}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            }}
            renderBody={(item) => {
                const medida = tiposMedida.find(t => t.id === item.tipoMedidaID)?.text || '';
                const pesoUnit = tiposPeso.find(t => t.id === item.tipoPesoID)?.text || '';
                
                return (
                    <Grid container spacing={2}>
                        <Grid size={{xs:6}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                <RulerIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">Dimensiones</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                                {Number(item.largo).toFixed(2)} x {Number(item.ancho).toFixed(2)} x {Number(item.alto).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {medida}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:6}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                <ScaleIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">Peso</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                                {Number(item.peso).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ 
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                bgcolor: alpha(theme.palette.action.active, 0.05),
                                px: 0.5,
                                borderRadius: 0.5
                            }}>
                                {pesoUnit}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            }}
        />
    );
}
