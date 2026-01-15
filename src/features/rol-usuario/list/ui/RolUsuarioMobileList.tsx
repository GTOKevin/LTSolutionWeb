import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    useTheme,
    TablePagination,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import type { RolUsuario } from '@entities/rol-usuario/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { StatusChip } from '@/shared/components/ui/StatusChip';

interface RolUsuarioMobileListProps {
    data?: PagedResponse<RolUsuario>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (rol: RolUsuario) => void;
}

export function RolUsuarioMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit
}: RolUsuarioMobileListProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRol, setSelectedRol] = useState<RolUsuario | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rol: RolUsuario) => {
        setAnchorEl(event.currentTarget);
        setSelectedRol(rol);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRol(null);
    };

    const handleAction = (action: 'edit') => {
        if (selectedRol) {
            if (action === 'edit') onEdit(selectedRol);
        }
        handleMenuClose();
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando roles...</Box>;
    }

    if (!data?.items.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron roles</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((rol) => (
                    <Card 
                        key={rol.rolUsuarioID}
                        elevation={0}
                        sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 3,
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ 
                                        p: 1, 
                                        borderRadius: 2, 
                                        bgcolor: theme.palette.primary.light,
                                        color: theme.palette.primary.main,
                                        display: 'flex'
                                    }}>
                                        <SecurityIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {rol.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                            ID: {rol.rolUsuarioID}
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, rol)}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>

                            {rol.descripcion && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {rol.descripcion}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                <StatusChip active={rol.estado} />
                            </Box>
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
                <MenuItem onClick={() => handleAction('edit')}>
                    <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Editar
                </MenuItem>
            </Menu>
        </Box>
    );
}
