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
    Factory as FactoryIcon,
    Email as EmailIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import type { Cliente } from '@entities/cliente/model/types';
import type { PagedResponse } from '@shared/api/types';
import { getStatusStyles } from '../../utils/ui-helpers';

interface ClientesMobileListProps {
    data?: PagedResponse<Cliente>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onView: (cliente: Cliente) => void;
    onEdit: (cliente: Cliente) => void;
    onDelete: (cliente: Cliente) => void;
}

export function ClientesMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onView,
    onEdit,
    onDelete
}: ClientesMobileListProps) {
    const theme = useTheme();

    const MobileClientCard = ({ cliente }: { cliente: Cliente }) => {
        const statusStyle = getStatusStyles(theme, cliente.activo);
        
        return (
            <Card 
                elevation={0} 
                sx={{ 
                    border: `1px solid ${cliente.activo ? statusStyle.border : theme.palette.divider}`,
                    borderRadius: 3,
                    mb: 2,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <CardContent sx={{ p: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                                {cliente.razonSocial}
                            </Typography>
                            <Typography variant="caption" fontFamily="monospace" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {cliente.ruc}
                            </Typography>
                        </Box>
                        <Chip 
                            label={cliente.activo ? 'Habilitado' : 'Inactivo'} 
                            size="small"
                            sx={{ 
                                height: 20,
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                bgcolor: statusStyle.bg,
                                color: statusStyle.text,
                                border: `1px solid ${statusStyle.border}`
                            }}
                        />
                    </Box>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FactoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.primary">
                                {cliente.contactoPrincipal || 'Sin contacto'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {cliente.email || 'Sin correo'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                Tel: {cliente.telefono || '-'}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(cliente);
                        }}
                    >
                        Ver
                    </Button>
                    <Button 
                        size="small" 
                        sx={{ py: 1.5, borderRadius: 0 }}
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(cliente);
                        }}
                    >
                        Editar
                    </Button>
                    <Button 
                        size="small" 
                        color="error" 
                        sx={{ py: 1.5, borderRadius: 0 }}
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(cliente);
                        }}
                    >
                        Eliminar
                    </Button>
                </Box>
            </Card>
        );
    };

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography color="text.secondary">Cargando...</Typography>
                </Box>
            ) : (
                <Box>
                    {data?.items.map((cliente: Cliente) => (
                        <MobileClientCard key={cliente.clienteID} cliente={cliente} />
                    ))}
                    {data?.items.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No se encontraron clientes
                        </Box>
                    )}
                    
                    {/* Mobile Pagination (Simple) */}
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
            )}
        </Box>
    );
}
