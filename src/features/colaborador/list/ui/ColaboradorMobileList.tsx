import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Chip,
    useTheme,
    alpha,
    TablePagination,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import type { Colaborador } from '@entities/colaborador/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface ColaboradorMobileListProps {
    data?: PagedResponse<Colaborador>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: ColaboradorMobileListProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, colaborador: Colaborador) => {
        setAnchorEl(event.currentTarget);
        setSelectedColaborador(colaborador);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedColaborador(null);
    };

    const handleAction = (action: 'view' | 'edit' | 'delete') => {
        if (!selectedColaborador) return;

        switch (action) {
            case 'view':
                onView(selectedColaborador);
                break;
            case 'edit':
                onEdit(selectedColaborador);
                break;
            case 'delete':
                onDelete(selectedColaborador);
                break;
        }
        handleMenuClose();
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando colaboradores...</Box>;
    }

    if (!data?.items.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron colaboradores</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((row) => (
                    <Card 
                        key={row.colaboradorID}
                        elevation={0}
                        sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 3,
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
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
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleMenuOpen(e, row)}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Chip 
                                            label={row.rolColaborador?.nombre || 'Sin Rol'} 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ borderRadius: 1 }} 
                                        />
                                    </Box>
                                    <StatusChip active={row.activo} />
                                </Box>

                                {(row.telefono || row.email) && (
                                    <Box sx={{ 
                                        p: 1.5, 
                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}>
                                        {row.telefono && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2">{row.telefono}</Typography>
                                            </Box>
                                        )}
                                        {row.email && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{row.email}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <TablePagination
                component="div"
                count={data.total}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Filas:"
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleAction('view')}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Ver Detalle
                </MenuItem>
                <MenuItem onClick={() => handleAction('edit')}>
                    <EditIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    Editar
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                    <Typography color="error">Eliminar</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
}
