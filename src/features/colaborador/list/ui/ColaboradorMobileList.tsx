import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Stack,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import type { Colaborador } from '@entities/colaborador/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';

interface ColaboradorMobileListProps {
    data?: PagedResponse<Colaborador>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onView: (colaborador: Colaborador) => void;
    onEdit: (colaborador: Colaborador) => void;
    onDelete: (colaborador: Colaborador) => void;
}

export function ColaboradorMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onView,
    onEdit,
    onDelete
}: ColaboradorMobileListProps) {
    const theme = useTheme();

    if (isLoading) {
        return <Box p={3} textAlign="center">Cargando colaboradores...</Box>;
    }

    if (data?.items.length === 0) {
        return (
            <Box p={5} textAlign="center" color="text.secondary">
                <Typography variant="body1">No hay colaboradores.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {data?.items.map((row) => (
                <Card 
                    key={row.colaboradorID}
                    elevation={0}
                    sx={{ 
                        borderRadius: 3,
                        mb: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: 'hidden'
                    }}
                >
                    <CardContent sx={{ p: 2, pb: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Box sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: '50%', 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'primary.main'
                                }}>
                                    <PersonIcon />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {row.nombres} {row.primerApellido}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.segundoApellido}
                                    </Typography>
                                </Box>
                            </Box>
                            <StatusChip active={row.activo} />
                        </Box>

                        <Stack spacing={1} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Chip 
                                    label={row.rolColaborador?.nombre || 'Sin Rol'} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ height: 20, fontSize: 10 }}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {row.telefono || '-'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {row.email || '-'}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>

                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.background.default, 0.5)
                    }}>
                        <Button 
                            size="small" 
                            color="inherit" 
                            sx={{ py: 1.5, borderRadius: 0, color: 'text.secondary' }}
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => onView(row)}
                        >
                            Ver
                        </Button>
                        <Button 
                            size="small" 
                            sx={{ 
                                py: 1.5, 
                                borderRadius: 0,
                                borderLeft: `1px solid ${theme.palette.divider}`,
                                borderRight: `1px solid ${theme.palette.divider}`
                            }}
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => onEdit(row)}
                        >
                            Editar
                        </Button>
                        <Button 
                            size="small" 
                            color="error"
                            sx={{ py: 1.5, borderRadius: 0 }}
                            startIcon={<DeleteIcon fontSize="small" />}
                            onClick={() => onDelete(row)}
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Card>
            ))}

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <Button 
                    variant="outlined" 
                    size="small" 
                    disabled={page === 0}
                    onClick={() => onPageChange(page - 1)}
                >
                    Anterior
                </Button>
                <Button 
                    variant="outlined" 
                    size="small" 
                    disabled={(page + 1) * rowsPerPage >= (data?.total || 0)}
                    onClick={() => onPageChange(page + 1)}
                >
                    Siguiente
                </Button>
            </Box>
        </Box>
    );
}
