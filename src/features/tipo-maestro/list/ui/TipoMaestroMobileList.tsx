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
    MenuItem,
    Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    MoreVert as MoreVertIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { StatusChip } from '@/shared/components/ui/StatusChip';

interface TipoMaestroMobileListProps {
    data?: PagedResponse<TipoMaestro>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (maestro: TipoMaestro) => void;
}

export function TipoMaestroMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit
}: TipoMaestroMobileListProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedMaestro, setSelectedMaestro] = useState<TipoMaestro | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, maestro: TipoMaestro) => {
        setAnchorEl(event.currentTarget);
        setSelectedMaestro(maestro);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMaestro(null);
    };

    const handleAction = (action: 'edit') => {
        if (selectedMaestro) {
            if (action === 'edit') onEdit(selectedMaestro);
        }
        handleMenuClose();
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando registros...</Box>;
    }

    if (!data?.items.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron registros</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((item) => (
                    <Card 
                        key={item.tipoMaestroID}
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
                                        <CategoryIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {item.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                            ID: {item.tipoMaestroID}
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {item.seccion && (
                                    <Chip 
                                        label={item.seccion} 
                                        size="small" 
                                        sx={{ borderRadius: 1 }} 
                                    />
                                )}
                                {item.codigo && (
                                    <Chip 
                                        label={`COD: ${item.codigo}`} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ borderRadius: 1, fontFamily: 'monospace' }} 
                                    />
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                <StatusChip active={item.activo} />
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
