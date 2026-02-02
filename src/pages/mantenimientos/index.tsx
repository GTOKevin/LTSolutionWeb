import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useMantenimientos } from '@features/mantenimiento/list/hooks/useMantenimientos';
import { MantenimientoFilter } from '@features/mantenimiento/list/ui/MantenimientoFilter';
import { MantenimientoTable } from '@features/mantenimiento/list/ui/MantenimientoTable';
import { MantenimientoMobileList } from '@features/mantenimiento/list/ui/MantenimientoMobileList';
import { CreateEditMantenimientoModal } from '@features/mantenimiento/create-edit/ui/CreateEditMantenimientoModal';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';

export function MantenimientosPage() {
    const theme = useTheme();
    const [showFilters, setShowFilters] = useState(true);

    const {
        // Data & State
        data,
        isLoading,
        page,
        rowsPerPage,
        initialFilters,
        
        // Modal State
        openModal,
        setOpenModal,
        selectedItem,
        viewOnly,
        openDeleteDialog,
        setOpenDeleteDialog,
        itemToDelete,
        
        // Catalogs
        listaFlotas,
        listaEstados,

        // Actions
        handleSearch,
        handleFilter,
        handleClear,
        handleChangePage,
        handleChangeRowsPerPage,
        handleCreate,
        handleEdit,
        handleView,
        handleDeleteClick,
        handleConfirmDelete,
        handleRefresh
    } = useMantenimientos();

    return (
        <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
            p: { xs: 2, md: 3 },
            position: 'relative',
            pb: { xs: 10, md: 3 }
        }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, height: '100%' }}>
                {/* Header */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', sm: 'center' }, 
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <BuildIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                Mantenimientos
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Gestión y control de servicios de flota
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Filtros">
                            <IconButton 
                                onClick={() => setShowFilters(!showFilters)}
                                color={showFilters ? 'primary' : 'default'}
                                sx={{ 
                                    bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <FilterListIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Recargar">
                            <IconButton 
                                onClick={handleRefresh}
                                sx={{ border: `1px solid ${theme.palette.divider}` }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
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
                            Nuevo Registro
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                {showFilters && (
                    <MantenimientoFilter
                        onSearch={handleSearch}
                        onFilter={handleFilter}
                        onClear={handleClear}
                        flotas={listaFlotas}
                        estados={listaEstados}
                        initialFilters={initialFilters}
                    />
                )}

                {/* Content */}
                <MantenimientoMobileList
                    data={data?.items}
                    isLoading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />

                <MantenimientoTable
                    data={data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />

                {/* Modals */}
                <CreateEditMantenimientoModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    mantenimientoToEdit={selectedItem}
                    onSuccess={handleRefresh}
                    viewOnly={viewOnly}
                />

                <ConfirmDialog
                    open={openDeleteDialog}
                    title="Eliminar Registro"
                    content={`¿Está seguro que desea eliminar el mantenimiento #MNT-${itemToDelete?.mantenimientoID}? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => setOpenDeleteDialog(false)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    severity="error"
                />
            </Box>
        </Box>
    );
}
