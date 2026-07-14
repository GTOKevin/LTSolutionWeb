import { useMemo, useState, useEffect } from 'react';
import {
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
    Backdrop,
    TableContainer,
    Paper,
    Tooltip,
    alpha
} from '@mui/material';
import { 
    Close as CloseIcon, 
    TouchApp,
    LocalShipping as LocalShippingIcon,
    Inventory as InventoryIcon,
    LocationOn as LocationOnIcon,
    Flag as FlagIcon,
    RvHookup as RvHookupIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { Viaje, ViajeListItem } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { logger } from '@/shared/utils/logger';

interface ViajeSelectorModalProps {
    open: boolean;
    onClose: () => void;
    clienteId: number;
    onSelect: (viaje: Viaje) => void;
}

export function ViajeSelectorModal({ open, onClose, clienteId, onSelect }: ViajeSelectorModalProps) {
    const [isSelecting, setIsSelecting] = useState(false);
    const { showToast } = useToast();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['viajes', 'selector', clienteId],
        queryFn: () => viajeApi.getAll({ 
            page: 1, 
            size: 100, 
            clienteID: clienteId
        }),
        enabled: open && !!clienteId
    });

    useEffect(() => {
        if (open && clienteId) {
            refetch();
        }
    }, [open, clienteId, refetch]);

    const viajesDisponibles = useMemo(() => {
        if (!data?.items) return [];
        return data.items.filter(v => v.cerrado && !v.facturado);
    }, [data]);

    const handleSelect = async (viajeId: number) => {
        setIsSelecting(true);
        try {
            const fullViaje = await viajeApi.getById(viajeId);
            if (fullViaje) {
                onSelect(fullViaje);
                onClose();
            }
        } catch (error) {
            const message = getErrorMessage(error, 'No se pudo cargar el viaje seleccionado.');
            logger.error('Error cargando viaje completo:', error);
            showToast({ message, severity: 'error' });
        } finally {
            setIsSelecting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="span">Seleccionar Viaje</Typography>
                <IconButton onClick={onClose} size="small" disabled={isSelecting}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.background.default, 0.4) }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
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
                                                No hay viajes completados y sin facturar disponibles para este cliente.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    viajesDisponibles.map((viaje: ViajeListItem) => (
                                        <TableRow 
                                            key={viaje.viajeID}
                                            hover
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold" color="primary">
                                                    {viaje.codigo}
                                                </Typography>
                                                {viaje.guias && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Guías: {viaje.guias}
                                                    </Typography>
                                                )}
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
                                                            onClick={() => handleSelect(viaje.viajeID)}
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
                <Button onClick={onClose} disabled={isSelecting}>Cancelar</Button>
            </DialogActions>
            
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, display: 'flex', flexDirection: 'column', gap: 2 }}
                open={isSelecting}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6">Obteniendo detalles del viaje...</Typography>
            </Backdrop>
        </Dialog>
    );
}
