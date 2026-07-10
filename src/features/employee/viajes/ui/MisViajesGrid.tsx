import { Box, Button, Typography } from '@mui/material';
import {
    DirectionsTransitOutlined,
    CategoryOutlined as CategoryIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import type { MiViajeListItemDto } from '@entities/employee/model/types';

interface MisViajesGridProps {
    items: MiViajeListItemDto[];
    onNavigate: (id: number) => void;
}

export function MisViajesGrid({ items, onNavigate }: MisViajesGridProps) {
    const buildStatusColor = (item: MiViajeListItemDto) => {
        if (item.cerrado) return 'success.main';
        if (item.estadoNombre?.toLowerCase().includes('ruta')) return 'warning.main';
        return 'primary.main';
    };

    const buildStatusBg = (item: MiViajeListItemDto) => {
        if (item.cerrado) return 'success.50';
        if (item.estadoNombre?.toLowerCase().includes('ruta')) return 'warning.50';
        return 'primary.50';
    };

    return (
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
            {items.map((item) => (
                <Box key={item.viajeId}>
                    <Box
                        onClick={() => onNavigate(item.viajeId)}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                borderColor: 'primary.main',
                            }
                        }}
                    >
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', bgcolor: buildStatusColor(item) }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, pl: 1 }}>
                            <Box>
                                <Typography variant="overline" fontWeight={800} color="primary.main" sx={{ letterSpacing: '0.15em', display: 'block', mb: 0.5, lineHeight: 1 }}>
                                    {item.codigo}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="text.primary">
                                    {item.codigo.split('-')[1] || item.codigo}
                                </Typography>
                            </Box>
                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: buildStatusBg(item), color: buildStatusColor(item), borderRadius: 99, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CircleIcon sx={{ fontSize: 8 }} />
                                <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {item.estadoNombre}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4, pl: 1, flex: 1 }}>
                            <Box>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '-0.02em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>CLIENTE</Typography>
                                <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>{item.clienteRazonSocial}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '-0.02em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>RUTA</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" fontWeight={600}>{item.origenDescripcion}</Typography>
                                    <ArrowRightAltIcon color="primary" fontSize="small" />
                                    <Typography variant="body1" fontWeight={600}>{item.destinoDescripcion}</Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '-0.02em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>UNIDADES</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <DirectionsTransitOutlined fontSize="small" />
                                        <Typography variant="body2" fontWeight={600}>{item.tractoPlaca}</Typography>
                                    </Box>
                                    {item.carretaPlaca && (
                                        <>
                                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'divider' }} />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CategoryIcon fontSize="small" />
                                                <Typography variant="body2" fontWeight={600}>{item.carretaPlaca}</Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Button 
                            fullWidth 
                            variant="outlined" 
                            sx={{ 
                                ml: 1, 
                                width: 'calc(100% - 8px)', 
                                py: 1.5, 
                                borderRadius: 3, 
                                fontWeight: 800, 
                                letterSpacing: '0.1em', 
                                borderWidth: '1px !important', 
                                borderColor: 'divider',
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' }
                            }}
                        >
                            VER DETALLES
                        </Button>
                    </Box>
                </Box>
            ))}
            </Box>
        </Box>
    );
}
