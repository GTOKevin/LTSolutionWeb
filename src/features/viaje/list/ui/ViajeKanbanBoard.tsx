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
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { VIAJE_STATUS_CODE, resolveNextViajeEstado } from '@entities/viaje/model/status';
import { useToast } from '@/shared/components/ui/Toast';
import { CerrarViajeDialog } from '@features/viaje/ui/CerrarViajeDialog';
import type { ViajeKanbanColumnDefinition } from '../model/kanban';
import { KanbanCard } from './kanban/KanbanCard';
import { KanbanColumn } from './kanban/KanbanColumn';
import { useViajeEstadoTransition } from '../hooks/useViajeEstadoTransition';

interface KanbanBoardProps {
    viajes: ViajeListItem[];
    columns: ViajeKanbanColumnDefinition[];
    isLoading: boolean;
    canManage?: boolean;
    onViajeClick: (viaje: ViajeListItem) => void;
    onEditViaje?: (viaje: ViajeListItem) => void;
    onViewViaje?: (viaje: ViajeListItem) => void;
    onDeleteViaje?: (viaje: ViajeListItem) => void;
}

export function ViajeKanbanBoard({
    viajes,
    columns,
    isLoading,
    canManage = false,
    onViajeClick,
    onEditViaje,
    onViewViaje,
    onDeleteViaje
}: KanbanBoardProps) {
    const { showToast } = useToast();

    const [localViajes, setLocalViajes] = useState<ViajeListItem[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [cerrarDialogOpen, setCerrarDialogOpen] = useState(false);
    const [viajeToCerrar, setViajeToCerrar] = useState<ViajeListItem | null>(null);

    const { modals, handleAdvanceEstado } = useViajeEstadoTransition();

    useEffect(() => {
        setLocalViajes(viajes);
    }, [viajes]);

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
        const overId = over.id;

        const activeViaje = localViajes.find(v => v.viajeID === activeViajeId);
        if (!activeViaje) return;

        if (activeViaje.cerrado) {
            showToast({ message: 'Un viaje cerrado no permite modificaciones.', severity: 'warning' });
            return;
        }

        if (!canManage) {
            return;
        }

        let targetColumnId = '';
        const isOverColumn = columns.some(c => c.id === overId);

        if (isOverColumn) {
            targetColumnId = overId as string;
        } else {
            const overViaje = localViajes.find(v => v.viajeID === overId);
            if (overViaje) {
                targetColumnId = overViaje.estadoCodigo || VIAJE_STATUS_CODE.AGENDADO;
            }
        }

        // Acción neutra: soltar la tarjeta sobre su misma columna no debe disparar
        // warning ni consumir el flujo de transición.
        if (targetColumnId === activeViaje.estadoCodigo) {
            return;
        }

        // El kanban solo permite avanzar al siguiente estado del flujo (sin saltos).
        const nextColumnId = resolveNextViajeEstado(activeViaje.estadoCodigo);
        if (!nextColumnId || targetColumnId !== nextColumnId) {
            showToast({ message: 'El viaje solo puede moverse al siguiente estado del flujo.', severity: 'warning' });
            return;
        }

        handleAdvanceEstado(activeViaje);
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
                            onEditCard={onEditViaje}
                            onViewCard={onViewViaje}
                            onDeleteCard={onDeleteViaje}
                            onCerrarCard={(viaje) => {
                                setViajeToCerrar(viaje);
                                setCerrarDialogOpen(true);
                            }}
                        />
                    ))}
                </Box>

                <DragOverlay>
                    {activeViaje ? (
                        <KanbanCard viaje={activeViaje} onClick={() => {}} draggable={canManage && !activeViaje.cerrado} />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {modals}

            <CerrarViajeDialog
                open={cerrarDialogOpen}
                viajeID={viajeToCerrar?.viajeID ?? 0}
                viajeCodigo={viajeToCerrar?.codigo}
                onClose={() => {
                    setCerrarDialogOpen(false);
                    setViajeToCerrar(null);
                }}
            />
        </Box>
    );
}
