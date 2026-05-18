import { useMemo } from 'react';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useViajeRutas, useReorderViajeRutas } from '../../hooks/useViajeRutas';
import { EtapaCard } from './EtapaCard';
import { SugerenciasRutaPanel } from './SugerenciasRutaPanel';
import type { ViajeRutaDto } from '@/entities/viaje/model/types';
import { Box, Typography, Button, CircularProgress, Divider } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface PlanRutaSidebarProps {
    viajeId: number;
    onClose?: () => void;
}

export function PlanRutaSidebar({ viajeId, onClose }: PlanRutaSidebarProps) {
    const { data: rutas, isLoading } = useViajeRutas(viajeId);
    const reorderMutation = useReorderViajeRutas();

    // Agrupar rutas por etapaOrden
    const etapas = useMemo(() => {
        if (!rutas) return [];
        const map = new Map<number, ViajeRutaDto[]>();
        rutas.forEach(r => {
            if (!map.has(r.etapaOrden)) map.set(r.etapaOrden, []);
            map.get(r.etapaOrden)!.push(r);
        });
        return Array.from(map.entries())
            .map(([orden, items]) => ({
                id: `etapa-${orden}`,
                orden,
                items
            }))
            .sort((a, b) => a.orden - b.orden);
    }, [rutas]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = etapas.findIndex(e => e.id === active.id);
        const newIndex = etapas.findIndex(e => e.id === over.id);

        const newEtapas = [...etapas];
        const [moved] = newEtapas.splice(oldIndex, 1);
        newEtapas.splice(newIndex, 0, moved);

        // Actualizar los órdenes y enviar al backend
        const payloadEtapas = newEtapas.map((e, idx) => ({
            etapaOrden: idx + 1,
            viajeControlRutaIds: e.items.map(i => i.viajeControlRutaId)
        }));

        reorderMutation.mutate({
            viajeId,
            data: {
                viajeId,
                etapas: payloadEtapas
            }
        });
    };

    return (
        <>
            <Box p={3}>
                <Typography variant="h6" fontWeight="bold">Puntos de Control</Typography>
                <Typography variant="body2" color="text.secondary">Gestione las paradas programadas y alternativas.</Typography>
            </Box>
            <Divider />
            
            <Box flex={1} overflow="auto" p={2}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}><CircularProgress size={24} /></Box>
                ) : (
                    <>
                        {etapas.length === 0 && <SugerenciasRutaPanel viajeId={viajeId} />}
                        
                        <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={etapas.map(e => e.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {etapas.map(etapa => (
                                    <EtapaCard key={etapa.id} etapa={etapa} viajeId={viajeId} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </>
                )}
            </Box>

            <Divider />
            <Box p={3} bgcolor="grey.50">
                <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={onClose}
                    sx={{ py: 1.5, borderRadius: 2 }}
                >
                    Confirmar Ruta
                </Button>
            </Box>
        </>
    );
}