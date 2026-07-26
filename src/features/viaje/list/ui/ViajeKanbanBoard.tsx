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
import { useQuery } from '@tanstack/react-query';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import {
    resolveViajeAgendadoId,
    resolveViajeCompletadoId,
    resolveViajeDescargandoId,
    resolveViajeTransitoId,
    VIAJE_STATUS_CODE,
} from '@entities/viaje/model/status';
import { alpha } from '@mui/material/styles';
import { useToast } from '@/shared/components/ui/Toast';
import { useUpdateEstadoViaje } from '../../hooks/useUpdateEstadoViaje';
import { estadoApi } from '@entities/estado/api/estado.api';
import { ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';
import { LegacyKanbanCard, LegacyKanbanColumn } from './legacy-kanban-components';

interface KanbanBoardProps {
    viajes: ViajeListItem[];
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
    const { data: viajeEstados = [] } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.estados(),
        queryFn: async () => (await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE)) ?? [],
    });

    const [localViajes, setLocalViajes] = useState<ViajeListItem[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);

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

    const firstViajePerCode: Record<string, number | undefined> = {};
    for (const viaje of viajes) {
        if (!viaje.estadoCodigo || firstViajePerCode[viaje.estadoCodigo] !== undefined) {
            continue;
        }
        firstViajePerCode[viaje.estadoCodigo] = viaje.estadoID;
    }

    const columns = [
        { id: VIAJE_STATUS_CODE.AGENDADO, title: 'Programado', color: '#94a3b8', bgColor: alpha('#94a3b8', 0.05), estadoId: firstViajePerCode[VIAJE_STATUS_CODE.AGENDADO] ?? resolveViajeAgendadoId(viajeEstados) },
        { id: VIAJE_STATUS_CODE.TRANSITO, title: 'En Ruta', color: '#2563eb', bgColor: alpha('#2563eb', 0.05), estadoId: firstViajePerCode[VIAJE_STATUS_CODE.TRANSITO] ?? resolveViajeTransitoId(viajeEstados) },
        { id: VIAJE_STATUS_CODE.DESCARGANDO, title: 'En Descarga', color: '#f59e0b', bgColor: alpha('#f59e0b', 0.05), estadoId: firstViajePerCode[VIAJE_STATUS_CODE.DESCARGANDO] ?? resolveViajeDescargandoId(viajeEstados) },
        { id: VIAJE_STATUS_CODE.COMPLETADO, title: 'Completado', color: '#388e3c', bgColor: alpha('#388e3c', 0.05), estadoId: firstViajePerCode[VIAJE_STATUS_CODE.COMPLETADO] ?? resolveViajeCompletadoId(viajeEstados) },
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

    const applyStatusChange = (change: PendingStatusChange) => {
        setLocalViajes((prev) =>
            prev.map((viaje) =>
                viaje.viajeID === change.viajeId
                    ? {
                        ...viaje,
                        estadoCodigo: change.targetColumnId,
                        estadoNombre: change.targetColumnTitle,
                        estadoID: change.targetEstadoId,
                    }
                    : viaje
            )
        );

        updateEstadoMutation.mutate({ id: change.viajeId, estadoId: change.targetEstadoId });
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
            if (targetColumnId === VIAJE_STATUS_CODE.AGENDADO && activeViaje.estadoCodigo !== VIAJE_STATUS_CODE.AGENDADO) {
                showToast({ message: 'Un viaje que ya inició no puede regresar a estado Programado', severity: 'warning' });
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
                        <LegacyKanbanColumn
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
                        />
                    ))}
                </Box>

                <DragOverlay>
                    {activeViaje ? (
                        <LegacyKanbanCard viaje={activeViaje} onClick={() => {}} draggable={canManage && !activeViaje.cerrado} />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <ConfirmDialog
                open={Boolean(pendingStatusChange)}
                title="Confirmar viaje completado"
                content="Una vez el viaje se encuentre completado no podra realizar modificaciones al viaje."
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
        </Box>
    );
}
