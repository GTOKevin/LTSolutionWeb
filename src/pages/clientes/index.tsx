import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Chip,
    IconButton,
    Paper,
    useTheme,
    alpha,
    Collapse
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Add as AddIcon,
    Reorder as ReorderIcon,
    ViewAgenda as ViewAgendaIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { useState, useEffect } from 'react';
import { CreateEditClienteModal } from '../../features/cliente/create-edit/ui/CreateEditClienteModal';
import type { Cliente } from '@entities/cliente/model/types';

export function ClientesPage() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(' ');
    const [showFilters, setShowFilters] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['clientes', page, debouncedSearch],
        queryFn: () => clienteApi.getAll({ page, size: 10, search: debouncedSearch })
    });

    const handleCreate = () => {
        setClienteToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (cliente: Cliente) => {
        setClienteToEdit(cliente);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setClienteToEdit(null);
    };

    const handleSuccess = (id: number) => {
        refetch();
    };

    return (
        <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
            p: 3,
            position: 'relative'
        }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                
                {/* Toolbar */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Cartera de Clientes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestione la información, documentación y contactos de sus clientes.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Density Toggle (Hidden on mobile) */}
                        <Box sx={{ 
                            display: { xs: 'none', sm: 'flex' }, 
                            bgcolor: 'background.paper', 
                            border: `1px solid ${theme.palette.divider}`, 
                            borderRadius: 2, 
                            p: 0.5 
                        }}>
                            <IconButton size="small" sx={{ borderRadius: 1 }}>
                                <ReorderIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ borderRadius: 1, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                <ViewAgendaIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Filters */}
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{ 
                                bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
                                color: showFilters ? 'primary.main' : 'text.primary',
                                borderColor: showFilters ? 'primary.main' : theme.palette.divider,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                        >
                            Filtros
                        </Button>

                        {/* Primary Action */}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{ boxShadow: 2 }}
                            onClick={handleCreate}
                        >
                            Nuevo Cliente
                        </Button>
                    </Box>
                </Box>

                {/* Main Table Card */}
                <Paper sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: 0, 
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    boxShadow: theme.shadows[1]
                }}>
                    {/* Table Toolbar */}
                    <Collapse in={showFilters}>
                        <Box sx={{ 
                            p: 2, 
                            borderBottom: `1px solid ${theme.palette.divider}`, 
                            display: 'flex', 
                            gap: 2, 
                            bgcolor: alpha(theme.palette.background.default, 0.5) 
                        }}>
                            <TextField
                                placeholder="Buscar por Razón Social o ID Fiscal..."
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ flex: 1, maxWidth: 400 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { bgcolor: 'background.paper' }
                                }}
                            />
                            <Select
                                size="small"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{ minWidth: 180, bgcolor: 'background.paper' }}
                            >
                                <MenuItem value=" ">Todos los Estados</MenuItem>
                                <MenuItem value="1">Activo</MenuItem>
                                <MenuItem value="0">Inactivo</MenuItem>
                            </Select>
                        </Box>
                    </Collapse>

                    {/* Table Container */}
                    <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox color="primary" />
                                    </TableCell>
                                    <TableCell>Razón Social</TableCell>
                                    <TableCell>RUC</TableCell>
                                    <TableCell>Contacto Principal</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Teléfono</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                            Cargando clientes...
                                        </TableCell>
                                    </TableRow>
                                ) : data?.data?.items.map((cliente: Cliente) => (
                                    <TableRow 
                                        key={cliente.clienteID}
                                        hover
                                        sx={{ 
                                            '&:hover .actions-group': { opacity: 1 },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox color="primary" />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {cliente.razonSocial}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {cliente.email || 'Sin correo'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                                                {cliente.ruc}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{cliente.contactoPrincipal}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={cliente.activo ? 'Habilitado' : 'Inactivo'} 
                                                size="small"
                                                sx={{ 
                                                    height: 24,
                                                    bgcolor: cliente.activo 
                                                        ? alpha(theme.palette.success.main, 0.1) 
                                                        : alpha(theme.palette.error.main, 0.1),
                                                    color: cliente.activo 
                                                        ? theme.palette.success.dark 
                                                        : theme.palette.error.dark,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{cliente.telefono || '-'}</TableCell>
                                        <TableCell align="right">
                                            <Box className="actions-group" sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'flex-end', 
                                                gap: 1,
                                                opacity: { xs: 1, md: 0 },
                                                transition: 'opacity 0.2s'
                                            }}>
                                                <IconButton size="small">
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(cliente);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data?.data?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                            No se encontraron clientes
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <CreateEditClienteModal 
                open={modalOpen}
                onClose={handleCloseModal}
                clienteToEdit={clienteToEdit}
                onSuccess={handleSuccess}
            />
        </Box>
    );
}
