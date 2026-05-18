import { Box, Paper } from '@mui/material';
import { PlanRutaSidebar } from './PlanRutaSidebar';
import { PlanRutaMap } from './PlanRutaMap';

interface ViajePlanRutaLayoutProps {
    viajeId: number;
    onClose?: () => void;
}

export function ViajePlanRutaLayout({ viajeId, onClose }: ViajePlanRutaLayoutProps) {
    return (
        <Paper 
            elevation={4} 
            sx={{ 
                display: 'flex', 
                height: 800, 
                width: '100%', 
                borderRadius: 3, 
                overflow: 'hidden', 
                position: 'relative' 
            }}
        >
            <Box sx={{ flex: 1, position: 'relative', bgcolor: 'grey.100' }}>
                <PlanRutaMap viajeId={viajeId} />
            </Box>
            <Box 
                sx={{ 
                    width: 400, 
                    bgcolor: 'background.paper', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderLeft: 1, 
                    borderColor: 'divider',
                    boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
                    zIndex: 10
                }}
            >
                <PlanRutaSidebar viajeId={viajeId} onClose={onClose} />
            </Box>
        </Paper>
    );
}