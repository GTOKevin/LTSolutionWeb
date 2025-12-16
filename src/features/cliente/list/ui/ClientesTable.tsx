import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Chip,
    IconButton,
    Collapse,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    TablePagination,
    useTheme,
    alpha
} from '@mui/material';
import React from 'react';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type { Cliente } from '@entities/cliente/model/types';
import type { PagedResponse } from '@shared/api/types';
import { getStatusStyles, ROWS_PER_PAGE_OPTIONS } from '../../utils/ui-helpers';

interface ClientesTableProps {
    data?: PagedResponse<Cliente>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    showFilters: boolean;
    searchTerm: string;
    statusFilter: string;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: string) => void;
    onView: (cliente: Cliente) => void;
    onEdit: (cliente: Cliente) => void;
    onDelete: (cliente: Cliente) => void;
}

export function ClientesTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    showFilters,
    searchTerm,
    statusFilter,
    onPageChange,
    onRowsPerPageChange,
    onSearchChange,
    onStatusFilterChange,
    onView,
    onEdit,
    onDelete
}: ClientesTableProps) {
    const theme = useTheme();

    return (
        <Paper sx={{ 
            display: { xs: 'none', md: 'flex' },
            flex: 1, 
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
                        onChange={(e) => onSearchChange(e.target.value)}
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
                        onChange={(e) => onStatusFilterChange(e.target.value)}
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
                        ) : data?.items.map((cliente: Cliente) => (
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
                                            bgcolor: getStatusStyles(theme, cliente.activo).bg,
                                            color: getStatusStyles(theme, cliente.activo).text,
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
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onView(cliente);
                                            }}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(cliente);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(cliente);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron clientes
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                component="div"
                count={data?.total || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage="Filas por página"
            />
        </Paper>
    );
}
