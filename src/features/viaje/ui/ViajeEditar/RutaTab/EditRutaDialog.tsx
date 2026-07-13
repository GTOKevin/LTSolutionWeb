import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Box, MenuItem, FormControlLabel, Switch, CircularProgress
} from '@mui/material';
import { useUpdateViajeRuta } from '@features/viaje/hooks/useViajeRutas';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@/shared/api/maestro.api';
import { SECCION_MAESTRO } from '@/shared/constants/maestro';
import type { ViajeRutaDto, UpdateViajeRutaDto } from '@/entities/viaje/model/types';
import dayjs from 'dayjs';

interface EditRutaDialogProps {
    open: boolean;
    onClose: () => void;
    viajeId: number;
    ruta: ViajeRutaDto | null;
}

export function EditRutaDialog({ open, onClose, viajeId, ruta }: EditRutaDialogProps) {
    const updateMutation = useUpdateViajeRuta();
    
    // Obtener los tipos de punto desde el backend
    const { data: tiposPunto, isLoading: isLoadingTipos } = useQuery({
        queryKey: ['maestro', SECCION_MAESTRO.PUNTO_RUTA],
        queryFn: () => maestroApi.getSelect('', SECCION_MAESTRO.PUNTO_RUTA, 50),
        enabled: open,
    });
    
    const [formData, setFormData] = useState({
        tipoPuntoId: 0,
        nombreLugar: '',
        esOpcionPrincipal: false,
        fechaEstimadaLlegada: '',
    });

    useEffect(() => {
        if (open && ruta) {
            const resetUiTimer = window.setTimeout(() => {
                setFormData({
                    tipoPuntoId: ruta.tipoPuntoId,
                    nombreLugar: ruta.nombreLugar || '',
                    esOpcionPrincipal: ruta.esOpcionPrincipal,
                    // Format to datetime-local expected format (YYYY-MM-DDThh:mm)
                    fechaEstimadaLlegada: ruta.fechaEstimadaLlegada
                        ? dayjs(ruta.fechaEstimadaLlegada).format('YYYY-MM-DDTHH:mm')
                        : '',
                });
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, ruta]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ruta) return;

        const payload: UpdateViajeRutaDto = {
            tipoPuntoId: formData.tipoPuntoId,
            esOpcionPrincipal: formData.esOpcionPrincipal,
            nombreLugar: formData.nombreLugar,
            fechaEstimadaLlegada: formData.fechaEstimadaLlegada ? dayjs(formData.fechaEstimadaLlegada).format('YYYY-MM-DDTHH:mm:ss') : null,
            radioGeocercaMetros: ruta.radioGeocercaMetros,
            latitud: ruta.latitud,
            longitud: ruta.longitud,
            ubicacionReferencia: ruta.ubicacionReferencia
        };

        updateMutation.mutate({ viajeId, id: ruta.viajeControlRutaId, data: payload }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle fontWeight="bold">Editar Parada</DialogTitle>
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
                                tiposPunto?.data?.map(t => (
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
                        
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={updateMutation.isPending}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
