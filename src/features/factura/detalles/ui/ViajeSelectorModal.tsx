import { useMemo, useState } from 'react';
import {
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Box,
    Typography,
    CircularProgress,
    IconButton,
    TableContainer,
    Paper,
    TextField,
    InputAdornment,
    Tooltip,
    alpha
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Search as SearchIcon,
    TouchApp,
    LocalShipping as LocalShippingIcon,
    Inventory as InventoryIcon,
    LocationOn as LocationOnIcon,
    Flag as FlagIcon,
    RvHookup as RvHookupIcon
} from '@mui/icons-material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { FacturaDetalleViajeOption } from '@/entities/factura/model/types';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';
import { getErrorMessage } from '@/shared/utils/api-errors';

interface ViajeSelectorModalProps {
    open: boolean;
    onClose: () => void;
    clienteId: number;
    onSelect: (viaje: FacturaDetalleViajeOption) => void;
}

export function ViajeSelectorModal({ open, onClose, clienteId, onSelect }: ViajeSelectorModalProps) {
    const [isSelecting, setIsSelecting] = useState(false);
    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText.trim(), 300);

    const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['factura', 'detalle-viajes', clienteId, debouncedSearch],
        queryFn: () => facturaApi.getDetalleViajes({
            clienteId,
            search: debouncedSearch || undefined,
            limit: 100
        }),
        enabled: open && !!clienteId,
        placeholderData: keepPreviousData,
    });

    const viajesDisponibles = useMemo(() => {
        return data ?? [];
    }, [data]);

    const handleClose = () => {
        setSearchText('');
        onClose();
    };

    const handleSelect = async (viaje: FacturaDetalleViajeOption) => {
        setIsSelecting(true);
        onSelect(viaje);
        handleClose();
        setIsSelecting(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="span">Seleccionar Viaje</Typography>
                <IconButton onClick={handleClose} size="small" disabled={isSelecting}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.background.default, 0.4) }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por código, placa o mercadería..."
                    value={searchText}
                    onChange={(event) => setSearchText(handleSanitizeSearchInput(event.target.value))}
                    inputProps={{ 'aria-label': 'Buscar viajes' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: isFetching ? (
                            <InputAdornment position="end">
                                <CircularProgress size={16} thickness={5} color="primary" />
                            </InputAdornment>
                        ) : undefined,
                        sx: { borderRadius: 2, bgcolor: 'background.paper' },
                    }}
                    sx={{ mb: 2 }}
                />
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert
                        severity="error"
                        action={(
                            <Button color="inherit" size="small" onClick={() => void refetch()} disabled={isFetching}>
                                Reintentar
                            </Button>
                        )}
                        sx={{ borderRadius: 2 }}
                    >
                        {getErrorMessage(error, 'No se pudieron cargar los viajes disponibles para facturar.')}
                    </Alert>
                ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Viaje</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Vehículo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Ruta</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Mercadería</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Acción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {viajesDisponibles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                {debouncedSearch
                                                    ? 'No se encontraron viajes que coincidan con la búsqueda.'
                                                    : 'No hay viajes completados y sin facturar disponibles para este cliente.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    viajesDisponibles.map((viaje: FacturaDetalleViajeOption) => (
                                        <TableRow 
                                            key={viaje.viajeID}
                                            hover
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold" color="primary">
                                                    {viaje.codigo}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LocalShippingIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">{viaje.tractoPlaca}</Typography>
                                                    </Box>
                                                    {viaje.carretaPlaca && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <RvHookupIcon fontSize="small" color="action" />
                                                            <Typography variant="body2" color="text.secondary">{viaje.carretaPlaca}</Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <LocationOnIcon sx={{ fontSize: 14 }} color="error" />
                                                        <Typography variant="caption" noWrap title={viaje.origenDescripcion}>
                                                            {viaje.origenDescripcion}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <FlagIcon sx={{ fontSize: 14 }} color="success" />
                                                        <Typography variant="caption" noWrap title={viaje.destinoDescripcion}>
                                                            {viaje.destinoDescripcion}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <InventoryIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }} title={viaje.mercaderiaDescripcion || '-'}>
                                                        {viaje.mercaderiaDescripcion || '-'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Elegir Viaje" arrow placement="left">
                                                    <span>
                                                        <IconButton 
                                                            color="primary" 
                                                            onClick={() => handleSelect(viaje)}
                                                            disabled={isSelecting}
                                                            sx={{ 
                                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                                '&:hover': {
                                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                                                }
                                                            }}
                                                        >
                                                            <TouchApp />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
                <Button onClick={handleClose} disabled={isSelecting}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    );
}
