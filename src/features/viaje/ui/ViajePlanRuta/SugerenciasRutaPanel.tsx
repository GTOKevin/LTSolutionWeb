import { Box, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useViajeRutasSugeridas, useCloneViajeRuta } from '../../hooks/useViajeRutas';

interface SugerenciasRutaPanelProps {
    viajeId: number;
}

export function SugerenciasRutaPanel({ viajeId }: SugerenciasRutaPanelProps) {
    const { data: sugerencias, isLoading } = useViajeRutasSugeridas(viajeId);
    const cloneMutation = useCloneViajeRuta();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={20} />
            </Box>
        );
    }

    if (!sugerencias || sugerencias.length === 0) {
        return (
            <Box p={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    No se encontraron rutas sugeridas para este origen y destino.
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={2} bgcolor="primary.50" borderRadius={2} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                Rutas Sugeridas
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Hemos encontrado {sugerencias.length} viaje(s) reciente(s) con la misma ruta.
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
                {sugerencias.map((sugerencia) => (
                    <Card key={sugerencia.viajeId} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Viaje {sugerencia.codigo}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {sugerencia.totalParadas} parada(s) planificada(s)
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<ContentCopyIcon />}
                                    onClick={() => cloneMutation.mutate({ viajeId, viajeIdReferencia: sugerencia.viajeId })}
                                    disabled={cloneMutation.isPending}
                                >
                                    Usar esta ruta
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}
