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
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { VIAJE_STATUS_CODE, getViajeEstadoRank } from '@entities/viaje/model/status';
import { useToast } from '@/shared/components/ui/Toast';
import { useUpdateEstadoViaje } from '../../hooks/useUpdateEstadoViaje';
import { CerrarViajeDialog } from '@features/viaje/ui/CerrarViajeDialog';
import type { ViajeKanbanColumnDefinition } from '../model/kanban';
import { KanbanCard } from './kanban/KanbanCard';
import { KanbanColumn } from './kanban/KanbanColumn';
import { ViajeEstadoDateDialog } from './kanban/ViajeEstadoDateDialog';

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

interface PendingStatusChange {
    viajeId: number;
    targetColumnId: string;
    targetColumnTitle: string;
    targetEstadoId: number;
    fechaTipo?: 'fechaPartida' | 'fechaDescarga';
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
    const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);
    const [pendingDateValue, setPendingDateValue] = useState('');
    const [cerrarDialogOpen, setCerrarDialogOpen] = useState(false);
    const [viajeToCerrar, setViajeToCerrar] = useState<ViajeListItem | null>(null);

    useEffect(() => {
        setLocalViajes(viajes);
    }, [viajes]);

    const updateEstadoMutation = useUpdateEstadoViaje();

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

    const applyStatusChange = (change: PendingStatusChange, fecha?: string) => {
        const isFechaPartida = change.fechaTipo === 'fechaPartida';
        const isFechaDescarga = change.fechaTipo === 'fechaDescarga';

        // El optimistic update del listado vive en `useUpdateEstadoViaje` (onMutate/onError),
        // que actualiza el cache de `VIAJE_QUERY_KEYS.lists()` y propaga el cambio a esta vista.
        updateEstadoMutation.mutate({
            id: change.viajeId,
            estadoId: change.targetEstadoId,
            ...(isFechaPartida ? { fechaPartida: fecha } : {}),
            ...(isFechaDescarga ? { fechaDescarga: fecha } : {}),
            optimistic: {
                estadoCodigo: change.targetColumnId,
                estadoNombre: change.targetColumnTitle,
            },
        });
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

        if (!canManage) {
            return;
        }

        if (targetColumnId && activeViaje.estadoCodigo !== targetColumnId) {
            // Regla de rango canónico (misma fuente de verdad que el formulario):
            // se bloquea toda degradación de estado, no solo el regreso a AGENDADO.
            const currentRank = getViajeEstadoRank(activeViaje.estadoCodigo);
            const targetRank = getViajeEstadoRank(targetColumnId);
            if (currentRank === null || targetRank === null || targetRank < currentRank) {
                showToast({ message: 'Un viaje no puede moverse a un estado anterior del flujo.', severity: 'warning' });
                return;
            }

            const targetColumnDef = columns.find(c => c.id === targetColumnId);
            if (!targetColumnDef?.estadoId) {
                showToast({ message: 'No se pudo resolver el catálogo de estados del viaje.', severity: 'warning' });
                return;
            }
            const nextStatusChange: PendingStatusChange = {
                viajeId: activeViajeId,
                targetColumnId,
                targetColumnTitle: targetColumnDef.title,
                targetEstadoId: targetColumnDef.estadoId,
            };

            if (targetColumnId === VIAJE_STATUS_CODE.TRANSITO || targetColumnId === VIAJE_STATUS_CODE.DESCARGANDO) {
                // Los estados En Ruta / En Descarga requieren registrar la fecha asociada
                // antes de aplicarse (fecha de partida / fecha de descarga).
                const fechaTipo = targetColumnId === VIAJE_STATUS_CODE.TRANSITO ? 'fechaPartida' : 'fechaDescarga';
                const fechaInicial = fechaTipo === 'fechaPartida' ? (activeViaje.fechaPartida ?? '') : (activeViaje.fechaDescarga ?? '');
                setPendingStatusChange({ ...nextStatusChange, fechaTipo });
                setPendingDateValue(fechaInicial);
                return;
            }

            if (targetColumnId === VIAJE_STATUS_CODE.COMPLETADO) {
                setPendingStatusChange(nextStatusChange);
                return;
            }

            applyStatusChange(nextStatusChange);
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

            <ConfirmDialog
                open={Boolean(pendingStatusChange) && !pendingStatusChange?.fechaTipo}
                title="Confirmar viaje completado"
                content="El viaje pasará a estado Completado. Para cerrarlo definitivamente (bloqueando modificaciones y generando los reportes) usa la acción «Cerrar viaje»."
                confirmText="Completar viaje"
                cancelText="Cancelar"
                severity="info"
                isLoading={updateEstadoMutation.isPending}
                onClose={() => setPendingStatusChange(null)}
                onConfirm={() => {
                    if (!pendingStatusChange) return;
                    applyStatusChange(pendingStatusChange);
                    setPendingStatusChange(null);
                }}
            />

            <ViajeEstadoDateDialog
                open={Boolean(pendingStatusChange?.fechaTipo)}
                title={pendingStatusChange?.fechaTipo === 'fechaPartida' ? 'Registrar fecha de partida' : 'Registrar fecha de descarga'}
                fieldLabel={pendingStatusChange?.fechaTipo === 'fechaPartida' ? 'Fecha de partida' : 'Fecha de descarga'}
                value={pendingDateValue}
                onValueChange={setPendingDateValue}
                onCancel={() => setPendingStatusChange(null)}
                onConfirm={() => {
                    if (!pendingStatusChange) return;
                    applyStatusChange(pendingStatusChange, pendingDateValue);
                    setPendingStatusChange(null);
                }}
                isLoading={updateEstadoMutation.isPending}
            />

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
