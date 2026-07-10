import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography, Paper, Badge } from '@mui/material';
import { KanbanCard } from './KanbanCard';
import type { ViajeListItem } from '@/entities/viaje/model/types';

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

export function KanbanColumn({ id, title, viajes, draggable = true, onCardClick, onEditCard, onViewCard, onDeleteCard, color, bgColor }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            type: 'Column',
            columnId: id
        }
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
                    mr: 0
                }
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
                    borderColor: color
                }}
            >
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                        variant="subtitle1" 
                        fontWeight={700} 
                        color="text.primary"
                    >
                        {title}
                    </Typography>
                    <Badge 
                        badgeContent={viajes.length} 
                        color="primary" 
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: color,
                                color: '#fff',
                                fontWeight: 'bold'
                            }
                        }}
                    />
                </Box>
                <Box 
                    ref={setNodeRef}
                    sx={{ 
                        flexGrow: 1, 
                        overflowY: 'auto',
                        p: 1,
                        m: -1
                    }}
                >
                    <SortableContext 
                        items={viajes.map(v => v.viajeID)} 
                        strategy={verticalListSortingStrategy}
                    >
                        {viajes.map(viaje => (
                            <KanbanCard 
                                key={viaje.viajeID} 
                                viaje={viaje} 
                                draggable={draggable}
                                onClick={onCardClick} 
                                onEdit={onEditCard}
                                onView={onViewCard}
                                onDelete={onDeleteCard}
                            />
                        ))}
                    </SortableContext>
                </Box>
            </Paper>
        </Box>
    );
}
