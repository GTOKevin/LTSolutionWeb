import { Box, Typography, Grid, Paper, IconButton, CircularProgress, alpha, useTheme } from '@mui/material';
import { Delete as DeleteIcon, CorporateFare as CorporateFareIcon } from '@mui/icons-material';
import { useViajeEscoltas, useDeleteViajeEscolta } from '@/features/viaje/hooks/useViajeEscoltas';
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

interface EscoltasListProps {
    viajeId: number;
    isViewOnly?: boolean;
}

export function EscoltasList({ viajeId, isViewOnly }: EscoltasListProps) {
    const theme = useTheme();
    const { data: pagedData, isLoading } = useViajeEscoltas(viajeId, 1, 50);
    const deleteMutation = useDeleteViajeEscolta();

    const escoltas = pagedData?.items || [];

    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleConfirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ viajeId, id: deleteId }, {
                onSuccess: () => setDeleteId(null)
            });
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Escoltas en Viaje
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {escoltas.map((item) => (
                        <Grid size={{xs:12,lg:6}} key={item.viajeEscoltaID}>
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 2.5, 
                                    borderRadius: 3,
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                    borderColor: 'transparent',
                                    bgcolor: 'background.paper',
                                    '&:hover': { 
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                        boxShadow: 2,
                                        '& .delete-btn': { opacity: 1 }
                                    }
                                }}
                            >
                                {!isViewOnly && (
                                    <IconButton 
                                        className="delete-btn"
                                        size="small" 
                                        onClick={() => setDeleteId(item.viajeEscoltaID)} 
                                        sx={{ 
                                            position: 'absolute', 
                                            top: 8, 
                                            right: 8, 
                                            opacity: 0, 
                                            transition: 'opacity 0.2s',
                                            color: 'error.main',
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            '&:hover': { bgcolor: 'error.main', color: 'white' }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                )}

                                <Box display="flex" gap={2}>
                                    <Box 
                                        sx={{ 
                                            width: 64, 
                                            height: 64, 
                                            borderRadius: 2,
                                            bgcolor: 'action.hover',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <CorporateFareIcon sx={{ fontSize: 32, color: !item.tercero ? 'primary.main' : 'secondary.main' }} />
                                    </Box>

                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: !item.tercero ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.secondary.main, 0.1), 
                                                    color: !item.tercero ? 'primary.main' : 'secondary.main', 
                                                    px: 1, 
                                                    py: 0.25, 
                                                    borderRadius: 1,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: -0.5
                                                }}
                                            >
                                                {!item.tercero ? 'Propio' : 'Tercero'}
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                                {!item.tercero ? item.flota?.placa : item.empresa}
                                            </Typography>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            {!item.tercero ? 'VEHÍCULO FLOTA' : 'EMPRESA EXTERNA'}
                                        </Typography>

                                        <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box 
                                                    sx={{ 
                                                        width: 24, 
                                                        height: 24, 
                                                        borderRadius: '50%', 
                                                        bgcolor: 'action.hover',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 'bold',
                                                        color: 'text.secondary'
                                                    }}
                                                >
                                                    {!item.tercero ? (
                                                        item.colaborador?.nombres?.substring(0, 2).toUpperCase()
                                                    ) : (
                                                        item.nombreConductor?.substring(0, 2).toUpperCase()
                                                    )}
                                                </Box>
                                                <Typography variant="caption" color="text.primary" fontWeight={500}>
                                                    {!item.tercero ? `${item.colaborador?.nombres} ${item.colaborador?.primerApellido} ${item.colaborador?.segundoApellido}` : item.nombreConductor}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box 
                                                    sx={{ 
                                                        width: 8, 
                                                        height: 8, 
                                                        borderRadius: '50%', 
                                                        bgcolor: !item.tercero ? 'success.main' : 'warning.main',
                                                        boxShadow: `0 0 8px ${!item.tercero ? alpha(theme.palette.success.main, 0.5) : alpha(theme.palette.warning.main, 0.5)}`
                                                    }} 
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                    {escoltas.length === 0 && (
                        <Grid size={{xs:12,lg:6}}>
                            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 3, bgcolor: 'background.default' }}>
                                <Typography color="text.secondary">No hay escoltas asignados a este viaje.</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <ConfirmDialog
                open={!!deleteId}
                title="Eliminar Escolta"
                content="¿Estás seguro de que deseas remover esta asignación de escolta?"
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                severity="error"
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
