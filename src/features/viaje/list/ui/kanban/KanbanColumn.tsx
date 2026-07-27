import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge, Box, Paper, Typography } from '@mui/material';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    viajes: ViajeListItem[];
    draggable?: boolean;
    onCardClick: (viaje: ViajeListItem) => void;
    onEditCard?: (viaje: ViajeListItem) => void;
    onViewCard?: (viaje: ViajeListItem) => void;
    onDeleteCard?: (viaje: ViajeListItem) => void;
    color: string;
    bgColor: string;
}

export function KanbanColumn({
    id,
    title,
    viajes,
    draggable = true,
    onCardClick,
    onEditCard,
    onViewCard,
    onDeleteCard,
    color,
    bgColor,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            type: 'Column',
            columnId: id,
        },
    });

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                mr: 2,
                '&:last-of-type': {
                    mr: 0,
                },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    bgcolor: isOver ? 'action.hover' : bgColor,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    borderTop: 4,
                    borderColor: color,
                }}
            >
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                        {title}
                    </Typography>
                    <Badge
                        badgeContent={viajes.length}
                        color="primary"
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: color,
                                color: '#fff',
                                fontWeight: 'bold',
                            },
                        }}
                    />
                </Box>
                <Box
                    ref={setNodeRef}
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        p: 1,
                        m: -1,
                    }}
                >
                    <SortableContext
                        items={viajes.map((viaje) => viaje.viajeID)}
                        strategy={verticalListSortingStrategy}
                    >
                        {viajes.map((viaje) => {
                            const isEditable = draggable && !viaje.cerrado;

                            return (
                                <KanbanCard
                                    key={viaje.viajeID}
                                    viaje={viaje}
                                    draggable={isEditable}
                                    onClick={onCardClick}
                                    onEdit={isEditable ? onEditCard : undefined}
                                    onView={onViewCard}
                                    onDelete={isEditable ? onDeleteCard : undefined}
                                />
                            );
                        })}
                    </SortableContext>
                </Box>
            </Paper>
        </Box>
    );
}
