import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ViajeRutaDto } from '@/entities/viaje/model/types';
import { useUpdateViajeRuta, useDeleteViajeRuta } from '../../hooks/useViajeRutas';
import { Box, Typography, Card, CardContent, IconButton, CircularProgress, TextField, Chip, Stack, InputAdornment } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { EditRutaDialog } from './EditRutaDialog';

interface EtapaCardProps {
    viajeId: number;
    etapa: {
        id: string;
        orden: number;
        items: ViajeRutaDto[];
    };
}

export function EtapaCard({ etapa, viajeId }: EtapaCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: etapa.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const updateMutation = useUpdateViajeRuta();
    const deleteMutation = useDeleteViajeRuta();

    const [editingRuta, setEditingRuta] = useState<ViajeRutaDto | null>(null);
    const [deletingRuta, setDeletingRuta] = useState<ViajeRutaDto | null>(null);

    // La opción principal
    const principal = etapa.items.find(i => i.esOpcionPrincipal) || etapa.items[0];
    const alternativas = etapa.items.filter(i => i.viajeControlRutaId !== principal?.viajeControlRutaId);

    if (!principal) return null;

    const handleSetPrincipal = (ruta: ViajeRutaDto) => {
        updateMutation.mutate({
            viajeId,
            id: ruta.viajeControlRutaId,
            data: {
                tipoPuntoId: ruta.tipoPuntoId,
                esOpcionPrincipal: true,
                nombreLugar: ruta.nombreLugar,
                fechaEstimadaLlegada: ruta.fechaEstimadaLlegada,
                radioGeocercaMetros: ruta.radioGeocercaMetros,
                latitud: ruta.latitud,
                longitud: ruta.longitud,
                ubicacionReferencia: ruta.ubicacionReferencia
            }
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingRuta) return;
        deleteMutation.mutate({ viajeId, id: deletingRuta.viajeControlRutaId }, {
            onSuccess: () => setDeletingRuta(null)
        });
    };

    return (
        <>
            <Card 
                ref={setNodeRef} 
                style={style} 
                variant="outlined"
            sx={{ 
                mb: 2, 
                position: 'relative', 
                borderRadius: 2,
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: 'primary.main' }
            }}
        >
            {/* Drag Handle */}
            <Box 
                {...attributes} 
                {...listeners}
                sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    cursor: 'grab', 
                    color: 'text.disabled',
                    '&:hover': { color: 'text.secondary' }
                }}
            >
                <DragIndicatorIcon />
            </Box>

            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2} pr={4}>
                    <Box 
                        sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: 1.5, 
                            bgcolor: 'primary.light', 
                            color: 'primary.contrastText',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}
                    >
                        <LocationOnIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {principal.tipoPunto.nombre}
                    </Typography>
                    
                    {principal.fechaEstimadaLlegada && (
                        <Chip 
                            label={new Date(principal.fechaEstimadaLlegada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 'auto', fontWeight: 'bold', fontSize: '0.65rem' }}
                        />
                    )}
                </Box>

                <Stack spacing={2}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5, lineHeight: 1 }}>
                            Lugar Principal
                        </Typography>
                        <TextField 
                            fullWidth 
                            size="small" 
                            value={principal.nombreLugar || 'Sin nombre'} 
                            InputProps={{ 
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setEditingRuta(principal)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => setDeletingRuta(principal)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'grey.50', pr: 0.5 } }}
                        />
                    </Box>

                    {alternativas.map(alt => (
                        <Box key={alt.viajeControlRutaId}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
                                    Alternativa
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    color="primary" 
                                    fontWeight="bold"
                                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                    onClick={() => handleSetPrincipal(alt)}
                                >
                                    Hacer Principal
                                </Typography>
                            </Box>
                            <TextField 
                                fullWidth 
                                size="small" 
                                value={alt.nombreLugar || 'Sin nombre'} 
                                InputProps={{ 
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setEditingRuta(alt)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => setDeletingRuta(alt)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { bgcolor: 'grey.50', pr: 0.5 },
                                    '& .MuiInputBase-input': { fontStyle: 'italic', color: 'text.secondary' }
                                }}
                            />
                        </Box>
                    ))}
                </Stack>
            </CardContent>
            
            {updateMutation.isPending && (
                <Box 
                    sx={{ 
                        position: 'absolute', 
                        inset: 0, 
                        bgcolor: 'rgba(255,255,255,0.7)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 1
                    }}
                >
                    <CircularProgress size={24} />
                </Box>
            )}
        </Card>

            <EditRutaDialog 
                open={!!editingRuta} 
                onClose={() => setEditingRuta(null)} 
                viajeId={viajeId} 
                ruta={editingRuta} 
            />

            <ConfirmDialog
                open={!!deletingRuta}
                title="Eliminar Parada"
                content={<>¿Estás seguro que deseas eliminar la parada <strong>{deletingRuta?.nombreLugar}</strong>? Esta acción no se puede deshacer.</>}
                onClose={() => setDeletingRuta(null)}
                onConfirm={handleDeleteConfirm}
                severity="error"
                confirmText="Eliminar"
                isLoading={deleteMutation.isPending}
            />
        </>
    );
}