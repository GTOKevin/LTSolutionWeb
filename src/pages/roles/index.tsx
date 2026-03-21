import {
    Box,
    Typography,
    Button,
    useTheme,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import { useState, useEffect } from 'react';
import { CreateEditRolUsuarioModal } from '../../features/rol-usuario/create-edit/ui/CreateEditRolUsuarioModal';
import type { RolUsuario } from '@entities/rol-usuario/model/types';
import { RolUsuarioTable } from '../../features/rol-usuario/list/ui/RolUsuarioTable';
import { RolUsuarioMobileList } from '../../features/rol-usuario/list/ui/RolUsuarioMobileList';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';

export function RolesPage() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [rolToEdit, setRolToEdit] = useState<RolUsuario | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['roles-usuario', page, rowsPerPage, debouncedSearch],
        queryFn: () => rolUsuarioApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch
        })
    });

    const handleCreate = () => {
        setRolToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (rol: RolUsuario) => {
        setRolToEdit(rol);
        setModalOpen(true);
    };

    const handleSuccess = () => {
        refetch();
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Gestión de Roles
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra los roles y permisos de acceso al sistema
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    sx={{ 
                            boxShadow: 2, 
                            fontWeight: 'bold', 
                            px: 3, 
                            py: 1.2,
                            borderRadius: 2
                    }}
                >
                    Nuevo Rol
                </Button>
            </Box>

            {/* Toolbar Section */}
            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                bgcolor: theme.palette.background.paper, 
                p: 2, 
                borderRadius: 3,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`
            }}>
                <TextField
                    placeholder="Buscar por Nombre de Rol..."
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(handleSanitizeSearchInput(e.target.value))}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                />
            </Box>

            {/* Content Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: 3, 
                overflow: 'hidden'
            }}>
                {/* Desktop Table */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <RolUsuarioTable
                        data={data?.data}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        onEdit={handleEdit}
                    />
                </Box>

                {/* Mobile List */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <RolUsuarioMobileList
                        data={data?.data}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        onEdit={handleEdit}
                    />
                </Box>
            </Box>

            <CreateEditRolUsuarioModal 
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                rolToEdit={rolToEdit}
                onSuccess={handleSuccess}
            />
        </Box>
    );
}
