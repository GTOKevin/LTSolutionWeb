import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, FormControlLabel, Switch, CircularProgress, Typography,
} from '@mui/material';
import { useCreateViajeRuta, useViajeRutas } from '@features/viaje/hooks/useViajeRutas';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { FormSelect } from '@shared/components/ui/FormSelect';
import type { CreateViajeRutaDto } from '@/entities/viaje/model/types';
import dayjs from 'dayjs';

interface AddRutaDialogProps {
    open: boolean;
    onClose: () => void;
    viajeId: number;
    initialData: { lat: number; lng: number; nombreLugar: string } | null;
    isViewOnly?: boolean;
}

export function AddRutaDialog({ open, onClose, viajeId, initialData, isViewOnly }: AddRutaDialogProps) {
    const createMutation = useCreateViajeRuta();
    const { data: rutas } = useViajeRutas(viajeId);

    const { data: tiposPunto, isLoading: isLoadingTipos, isError: hasTiposPuntoError } = useQuery({
        queryKey: ['maestro', SECCION_MAESTRO.PUNTO_RUTA],
        queryFn: () => maestroApi.getSelect('', SECCION_MAESTRO.PUNTO_RUTA, undefined, 50),
        enabled: open,
    });

    const [formData, setFormData] = useState({
        tipoPuntoId: 0,
        nombreLugar: '',
        esOpcionPrincipal: true,
        fechaEstimadaLlegada: '',
    });
    const [tipoPuntoError, setTipoPuntoError] = useState('');

    useEffect(() => {
        if (open) {
            const resetUiTimer = window.setTimeout(() => {
                setFormData({
                    tipoPuntoId: 0,
                    nombreLugar: initialData?.nombreLugar || '',
                    esOpcionPrincipal: true,
                    fechaEstimadaLlegada: '',
                });
                setTipoPuntoError('');
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, initialData]);

    const handleTipoPuntoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const tipoPuntoId = Number(event.target.value);
        setFormData((current) => ({ ...current, tipoPuntoId }));

        if (tipoPuntoId > 0) {
            setTipoPuntoError('');
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isViewOnly) return;

        if (formData.tipoPuntoId <= 0) {
            setTipoPuntoError('Seleccione un tipo de parada para guardar la nueva etapa.');
            return;
        }

        const maxOrden = rutas?.reduce((max, ruta) => Math.max(max, ruta.etapaOrden), 0) || 0;
        const nuevaEtapaOrden = maxOrden + 1;

        const payload: CreateViajeRutaDto = {
            viajeId,
            tipoPuntoId: formData.tipoPuntoId,
            etapaOrden: nuevaEtapaOrden,
            esOpcionPrincipal: formData.esOpcionPrincipal,
            nombreLugar: formData.nombreLugar,
            fechaEstimadaLlegada: formData.fechaEstimadaLlegada ? dayjs(formData.fechaEstimadaLlegada).format('YYYY-MM-DDTHH:mm:ss') : null,
            radioGeocercaMetros: 50,
            latitud: initialData?.lat || null,
            longitud: initialData?.lng || null,
            ubicacionReferencia: null,
        };

        createMutation.mutate({ viajeId, data: payload }, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle fontWeight="bold">Agregar Parada</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={3} pt={1}>
                        <FormSelect
                            label="Tipo de Parada"
                            options={tiposPunto ?? []}
                            value={formData.tipoPuntoId}
                            onChange={handleTipoPuntoChange}
                            required
                            disabled={isLoadingTipos}
                            error={Boolean(tipoPuntoError) || hasTiposPuntoError}
                            helperText={hasTiposPuntoError
                                ? 'No se pudieron cargar los tipos de parada.'
                                : isLoadingTipos
                                    ? 'Cargando tipos de parada...'
                                    : tipoPuntoError}
                        />

                        <TextField
                            label="Nombre del Lugar"
                            value={formData.nombreLugar}
                            onChange={(event) => setFormData({ ...formData, nombreLugar: event.target.value })}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Fecha/Hora Estimada de Llegada (ETA)"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={formData.fechaEstimadaLlegada}
                            onChange={(event) => setFormData({ ...formData, fechaEstimadaLlegada: event.target.value })}
                            fullWidth
                        />

                        <FormControlLabel
                            control={<Switch checked color="primary" disabled />}
                            label="Se registrará como opción principal de la nueva etapa"
                        />

                        {initialData && (
                            <Box bgcolor="grey.100" p={2} borderRadius={1}>
                                <Typography variant="caption" color="text.secondary">
                                    Coordenadas capturadas:
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {initialData.lat.toFixed(6)}, {initialData.lng.toFixed(6)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={createMutation.isPending}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={createMutation.isPending || isViewOnly}>
                        {createMutation.isPending ? <CircularProgress size={24} /> : 'Guardar Parada'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
