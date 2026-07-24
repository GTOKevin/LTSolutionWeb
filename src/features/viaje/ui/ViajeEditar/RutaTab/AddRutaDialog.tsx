import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Box, MenuItem, FormControlLabel, Switch, CircularProgress
} from '@mui/material';
import { useCreateViajeRuta, useViajeRutas } from '@features/viaje/hooks/useViajeRutas';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import type { CreateViajeRutaDto } from '@/entities/viaje/model/types';
import dayjs from 'dayjs';

interface AddRutaDialogProps {
    open: boolean;
    onClose: () => void;
    viajeId: number;
    initialData: { lat: number; lng: number; nombreLugar: string } | null;
}

export function AddRutaDialog({ open, onClose, viajeId, initialData }: AddRutaDialogProps) {
    const createMutation = useCreateViajeRuta();
    const { data: rutas } = useViajeRutas(viajeId);
    
    // Obtener los tipos de punto desde el backend
    const { data: tiposPunto, isLoading: isLoadingTipos } = useQuery({
        queryKey: ['maestro', SECCION_MAESTRO.PUNTO_RUTA],
        queryFn: () => maestroApi.getSelect('', SECCION_MAESTRO.PUNTO_RUTA, 20),
        enabled: open,
    });
    
    const [formData, setFormData] = useState({
        tipoPuntoId: 0,
        nombreLugar: '',
        esOpcionPrincipal: true,
        fechaEstimadaLlegada: '',
    });

    useEffect(() => {
        if (open && initialData) {
            const resetUiTimer = window.setTimeout(() => {
                setFormData(prev => ({
                    ...prev,
                    nombreLugar: initialData.nombreLugar || '',
                    esOpcionPrincipal: true,
                }));
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, initialData]);

    // Establecer un valor por defecto cuando cargan los tipos
    useEffect(() => {
        if (tiposPunto && tiposPunto.length > 0 && formData.tipoPuntoId === 0) {
            // Buscamos un valor razonable como 'Almuerzo' (1104) o el primero de la lista
            const defaultValue = tiposPunto.find(t => t.text.includes('Almuerzo')) || tiposPunto[0];
            const resetUiTimer = window.setTimeout(() => {
                setFormData(prev => ({ ...prev, tipoPuntoId: defaultValue.id }));
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [tiposPunto, formData.tipoPuntoId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Determinar etapaOrden: si es principal, lo ponemos al final (o podríamos tener un selector)
        // Para simplificar, si es principal, max(orden)+1. Si es alternativa, necesita pertenecer a una etapa (pero simplificaremos haciendolo max+1 y luego se puede reordenar)
        const maxOrden = rutas?.reduce((max, r) => Math.max(max, r.etapaOrden), 0) || 0;
        const nuevaEtapaOrden = maxOrden + 1;

        const payload: CreateViajeRutaDto = {
            viajeId,
            tipoPuntoId: formData.tipoPuntoId,
            etapaOrden: nuevaEtapaOrden,
            esOpcionPrincipal: formData.esOpcionPrincipal,
            nombreLugar: formData.nombreLugar,
            fechaEstimadaLlegada: formData.fechaEstimadaLlegada ? dayjs(formData.fechaEstimadaLlegada).format('YYYY-MM-DDTHH:mm:ss') : null,
            radioGeocercaMetros: 50, // Default 50m
            latitud: initialData?.lat || null,
            longitud: initialData?.lng || null,
            ubicacionReferencia: null
        };

        createMutation.mutate({ viajeId, data: payload }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle fontWeight="bold">Agregar Parada</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={3} pt={1}>
                        <TextField
                            select
                            label="Tipo de Parada"
                            value={formData.tipoPuntoId || ''}
                            onChange={e => setFormData({ ...formData, tipoPuntoId: Number(e.target.value) })}
                            fullWidth
                            required
                            disabled={isLoadingTipos}
                        >
                            {isLoadingTipos ? (
                                <MenuItem disabled value="">Cargando...</MenuItem>
                            ) : (
                                tiposPunto?.map(t => (
                                    <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>
                                ))
                            )}
                        </TextField>

                        <TextField
                            label="Nombre del Lugar"
                            value={formData.nombreLugar}
                            onChange={e => setFormData({ ...formData, nombreLugar: e.target.value })}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Fecha/Hora Estimada de Llegada (ETA)"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={formData.fechaEstimadaLlegada}
                            onChange={e => setFormData({ ...formData, fechaEstimadaLlegada: e.target.value })}
                            fullWidth
                        />

                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={formData.esOpcionPrincipal} 
                                    onChange={e => setFormData({ ...formData, esOpcionPrincipal: e.target.checked })} 
                                    color="primary"
                                />
                            }
                            label="Es opción principal (Se trazará en la ruta)"
                        />
                        
                        {initialData && (
                            <Box bgcolor="grey.100" p={2} borderRadius={1}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Coordenadas capturadas:</div>
                                <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                    {initialData.lat.toFixed(6)}, {initialData.lng.toFixed(6)}
                                </div>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={createMutation.isPending}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <CircularProgress size={24} /> : 'Guardar Parada'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
