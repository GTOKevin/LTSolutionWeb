import { 
    Box, 
    Typography, 
    useTheme, 
    alpha,
    Grid,
    Button
} from '@mui/material';
import { 
    CalendarToday as CalendarIcon,
    EventBusy as ExpiryIcon,
    Visibility as VisibilityIcon,
    VerifiedUser as PermitIcon
} from '@mui/icons-material';
import type { ViajePermiso } from '@/entities/viaje/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface Props {
    items: ViajePermiso[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    onEdit?: (item: ViajePermiso) => void;
    onDelete?: (id: number) => void;
    onPreview?: (path: string) => void;
}

export function ViajePermisoMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    onEdit, 
    onDelete,
    onPreview
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
            emptyMessage="No hay permisos registrados"
            keyExtractor={(item) => item.viajePermisoID}
            onEdit={onEdit}
            onDelete={onDelete ? (item) => onDelete(item.viajePermisoID) : undefined}
            onPreview={onPreview ? (item) => item.rutaArchivo && onPreview(item.rutaArchivo) : undefined}
            renderHeader={() => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        p: 0.5, 
                        borderRadius: 1, 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <PermitIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        Permiso de Viaje
                    </Typography>
                </Box>
            )}
            renderBody={(item) => (
                <Grid container spacing={2}>
                    <Grid size={{xs:6}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">Vigencia</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                            {formatDateShort(item.fechaVigencia)}
                        </Typography>
                    </Grid>
                    <Grid size={{xs:6}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                            <ExpiryIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">Vencimiento</Typography>
                        </Box>
                        <Typography variant="body2" color={item.fechaVencimiento ? 'text.primary' : 'text.disabled'}>
                            {item.fechaVencimiento ? formatDateShort(item.fechaVencimiento) : '-'}
                        </Typography>
                    </Grid>

                    {item.rutaArchivo && (
                        <Grid size={{xs:12}}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => onPreview?.(item.rutaArchivo!)}
                                fullWidth
                                sx={{ 
                                    mt: 1, 
                                    borderColor: theme.palette.divider,
                                    color: 'text.secondary',
                                    justifyContent: 'flex-start'
                                }}
                            >
                                Ver Documento
                            </Button>
                        </Grid>
                    )}
                </Grid>
            )}
        />
    );
}
