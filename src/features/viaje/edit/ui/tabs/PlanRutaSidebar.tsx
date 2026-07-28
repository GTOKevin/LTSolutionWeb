import { useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useViajeRutas, useReorderViajeRutas } from '@features/viaje/hooks/useViajeRutas';
import { EtapaCard } from './EtapaCard';
import { SugerenciasRutaPanel } from './SugerenciasRutaPanel';
import type { ViajeRutaDto } from '@/entities/viaje/model/types';
import { Alert, Box, Typography, Button, CircularProgress, Divider } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface PlanRutaSidebarProps {
    viajeId: number;
    onClose?: () => void;
    isViewOnly?: boolean;
}

export function PlanRutaSidebar({ viajeId, onClose, isViewOnly }: PlanRutaSidebarProps) {
    const { data: rutas, isLoading, isError, refetch, isRefetching } = useViajeRutas(viajeId);
    const reorderMutation = useReorderViajeRutas();
    const hasBlockingError = isError && !rutas;

    const etapas = useMemo(() => {
        if (!rutas) return [];

        const map = new Map<number, ViajeRutaDto[]>();
        rutas.forEach((ruta) => {
            if (!map.has(ruta.etapaOrden)) map.set(ruta.etapaOrden, []);
            map.get(ruta.etapaOrden)!.push(ruta);
        });

        return Array.from(map.entries())
            .map(([orden, items]) => ({
                id: `etapa-${orden}`,
                orden,
                items,
            }))
            .sort((a, b) => a.orden - b.orden);
    }, [rutas]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = etapas.findIndex((etapa) => etapa.id === active.id);
        const newIndex = etapas.findIndex((etapa) => etapa.id === over.id);

        const newEtapas = [...etapas];
        const [moved] = newEtapas.splice(oldIndex, 1);
        newEtapas.splice(newIndex, 0, moved);

        const payloadEtapas = newEtapas.map((etapa, index) => ({
            etapaOrden: index + 1,
            viajeControlRutaIds: etapa.items.map((item) => item.viajeControlRutaId),
        }));

        reorderMutation.mutate({
            viajeId,
            data: {
                viajeId,
                etapas: payloadEtapas,
            },
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
                ) : hasBlockingError ? (
                    <Alert
                        severity="error"
                        action={(
                            <Button color="inherit" size="small" onClick={() => refetch()} disabled={isRefetching}>
                                Reintentar
                            </Button>
                        )}
                    >
                        No se pudo cargar la planificación de ruta del viaje. Reintente la consulta antes de continuar.
                    </Alert>
                ) : (
                    <>
                        {etapas.length === 0 && !isViewOnly && <SugerenciasRutaPanel viajeId={viajeId} />}

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={isViewOnly ? undefined : handleDragEnd}
                        >
                            <SortableContext items={etapas.map((etapa) => etapa.id)} strategy={verticalListSortingStrategy}>
                                {etapas.map((etapa) => (
                                    <EtapaCard key={etapa.id} etapa={etapa} viajeId={viajeId} isViewOnly={isViewOnly} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </>
                )}
            </Box>

            {!isViewOnly && !hasBlockingError && (
                <>
                    <Divider />
                    <Box p={3} bgcolor="grey.50">
                        <Button variant="contained" color="primary" fullWidth size="large" startIcon={<SaveIcon />} onClick={onClose} sx={{ py: 1.5, borderRadius: 2 }}>
                            Confirmar Ruta
                        </Button>
                    </Box>
                </>
            )}
        </>
    );
}
