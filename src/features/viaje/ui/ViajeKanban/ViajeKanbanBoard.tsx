import { useState, useEffect } from 'react';
import { 
    DndContext, 
    DragOverlay, 
    closestCorners, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, CircularProgress, Alert } from '@mui/material';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { ESTADO_VIAJE_COD, ESTADO_VIAJE_ID } from '@/shared/constants/constantes';
import { alpha } from '@mui/material/styles';
import { useToast } from '@/shared/components/ui/Toast';
import { useUpdateEstadoViaje } from '../../hooks/useUpdateEstadoViaje';


interface KanbanBoardProps {
    viajes: ViajeListItem[];
    isLoading: boolean;
    canManage?: boolean;
    onViajeClick: (viaje: ViajeListItem) => void;
    onEditViaje?: (viaje: ViajeListItem) => void;
    onViewViaje?: (viaje: ViajeListItem) => void;
    onDeleteViaje?: (viaje: ViajeListItem) => void;
}

export function ViajeKanbanBoard({
    viajes,
    isLoading,
    canManage = false,
    onViajeClick,
    onEditViaje,
    onViewViaje,
    onDeleteViaje
}: KanbanBoardProps) {
    const { showToast } = useToast();

    // Local state for optimistic updates during drag
    const [localViajes, setLocalViajes] = useState<ViajeListItem[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);

    useEffect(() => {
        setLocalViajes(viajes);
    }, [viajes]);

    const updateEstadoMutation = useUpdateEstadoViaje(() => {
        setLocalViajes(viajes);
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns = [
        { id: ESTADO_VIAJE_COD.Agendado, title: 'Programado', color: "#94a3b8", bgColor: alpha("#94a3b8", 0.05), estadoId: ESTADO_VIAJE_ID.AGENDADO },
        { id: ESTADO_VIAJE_COD.Transito, title: 'En Ruta', color: '#2563eb', bgColor: alpha('#2563eb', 0.05), estadoId: ESTADO_VIAJE_ID.TRANSITO },
        { id: ESTADO_VIAJE_COD.Descargando, title: 'En Descarga', color: '#f59e0b', bgColor: alpha('#f59e0b', 0.05), estadoId: ESTADO_VIAJE_ID.DESCARGANDO },
        { id: ESTADO_VIAJE_COD.Completado, title: 'Completado', color: '#388e3c', bgColor: alpha('#388e3c', 0.05), estadoId: ESTADO_VIAJE_ID.COMPLETADO },
    ];

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!localViajes || localViajes.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                No hay viajes disponibles para mostrar en el tablero.
            </Alert>
        );
    }

    const getColumnViajes = (estadoCodigo: string): ViajeListItem[] => {
        return localViajes.filter(v => v.estadoCodigo === estadoCodigo);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeViajeId = active.id as number;
        // Check if dropped on a column or another card
        const overId = over.id;
        
        const activeViaje = localViajes.find(v => v.viajeID === activeViajeId);
        if (!activeViaje) return;

        // Determine target column
        let targetColumnId = '';
        const isOverColumn = columns.some(c => c.id === overId);
        
        if (isOverColumn) {
            targetColumnId = overId as string;
        } else {
            const overViaje = localViajes.find(v => v.viajeID === overId);
            if (overViaje) {
                targetColumnId = overViaje.estadoCodigo || ESTADO_VIAJE_COD.Agendado;
            }
        }

        if (!canManage) {
            return;
        }

        if (targetColumnId && activeViaje.estadoCodigo !== targetColumnId) {
            // Regla: No se puede cambiar a Agendado si ya no está en Agendado
            if (targetColumnId === ESTADO_VIAJE_COD.Agendado && activeViaje.estadoCodigo !== ESTADO_VIAJE_COD.Agendado) {
                showToast({ message: 'Un viaje que ya inició no puede regresar a estado Programado', severity: 'warning' });
                return;
            }

            const targetColumnDef = columns.find(c => c.id === targetColumnId);
            if (!targetColumnDef) return;

            // Optimistic update
            setLocalViajes(prev => 
                prev.map(v => 
                    v.viajeID === activeViajeId 
                        ? { ...v, estadoCodigo: targetColumnId, estadoNombre: targetColumnDef.title, estadoID: targetColumnDef.estadoId } 
                        : v
                )
            );

            updateEstadoMutation.mutate({ id: activeViajeId, estadoId: targetColumnDef.estadoId });
        }
    };

    const activeViaje = activeId ? localViajes.find(v => v.viajeID === activeId) : null;

    return (
        <Box sx={{ height: 'calc(100vh - 200px)', overflowX: 'auto', pb: 2 }}>
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <Box sx={{ display: 'flex', height: '100%', minWidth: 'min-content' }}>
                    {columns.map((col) => (
                        <KanbanColumn 
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            color={col.color}
                            bgColor={col.bgColor}
                            viajes={getColumnViajes(col.id)}
                            draggable={canManage}
                            onCardClick={onViajeClick}
                            onEditCard={canManage ? onEditViaje : undefined}
                            onViewCard={canManage ? onViewViaje : undefined}
                            onDeleteCard={canManage ? onDeleteViaje : undefined}
                        />
                    ))}
                </Box>

                <DragOverlay>
                    {activeViaje ? (
                        <KanbanCard viaje={activeViaje} onClick={() => {}} draggable={canManage} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </Box>
    );
}
