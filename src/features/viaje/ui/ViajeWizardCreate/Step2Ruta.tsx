import { Box, Typography, Paper, TextField, useTheme } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { LocationOn, SportsScore, Map as MapIcon, Flag, South } from '@mui/icons-material';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { handleAddressKeyDown } from '@/shared/utils/input-validators';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEffect, useState } from 'react';
import { useUbigeoDetails } from '@/shared/hooks/useUbigeoDetails';
import { useOrsRoute } from '@/shared/hooks/useOrsRoute';

// Fix for default markers in leaflet with Webpack/Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const CustomMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const DestinationMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle auto-zooming bounds when route is loaded
function MapAutoZoom({ routePath, fallbackPoints }: { routePath?: [number, number][], fallbackPoints?: [number, number][] }) {
    const map = useMap();
    
    useEffect(() => {
        if (routePath && routePath.length > 0) {
            const bounds = L.latLngBounds(routePath);
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        } else if (fallbackPoints && fallbackPoints.length > 0) {
            const bounds = L.latLngBounds(fallbackPoints);
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [map, routePath, fallbackPoints]);

    return null;
}

export function Step2Ruta() {
    const theme = useTheme();
    const { register, control, watch, formState: { errors } } = useFormContext();
    
    const origenID = watch('origenID');
    const destinoID = watch('destinoID');
    
    // Fetch details of selected Ubigeos to get coordinates
    const { data: origenDetails } = useUbigeoDetails(origenID);
    const { data: destinoDetails } = useUbigeoDetails(destinoID);

    const [origenCoords, setOrigenCoords] = useState<[number, number] | null>(null);
    const [destinoCoords, setDestinoCoords] = useState<[number, number] | null>(null);
    
    useEffect(() => {
        if (origenDetails?.latitud && origenDetails?.longitud) {
            setOrigenCoords([origenDetails.latitud, origenDetails.longitud]); 
        } else {
            setOrigenCoords(null);
        }
        
        if (destinoDetails?.latitud && destinoDetails?.longitud) {
            setDestinoCoords([destinoDetails.latitud, destinoDetails.longitud]);
        } else {
            setDestinoCoords(null);
        }
    }, [origenDetails, destinoDetails]);

    // Query to calculate route via OpenRouteService
    const { data: routeData, isLoading: isRouteLoading, isError: isRouteError } = useOrsRoute(
        origenCoords, 
        destinoCoords, 
        origenDetails?.departamento, 
        destinoDetails?.departamento
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Origin & Destination Stack */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                
                {/* Origin Section */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: (theme) => `${theme.palette.primary.main}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                            <LocationOn />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>Origen</Typography>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Punto de Partida</Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                Ubigeo o Sucursal de Origen <Typography component="span" color="error">*</Typography>
                            </Typography>
                            <Controller
                                name="origenID"
                                control={control}
                                render={({ field }) => (
                                    <UbigeoSelect 
                                        label=""
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!errors.origenID}
                                        helperText={errors.origenID?.message as string}
                                        direction="column"
                                    />
                                )}
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                Dirección Exacta de Origen <Typography component="span" color="text.disabled" sx={{ textTransform: 'none', fontWeight: 400 }}>(Opcional)</Typography>
                            </Typography>
                            <TextField 
                                fullWidth 
                                placeholder="Ej: Av. Los Próceres 456, Edificio B, Planta 2"
                                multiline
                                rows={2}
                                InputProps={{
                                    startAdornment: <MapIcon color="disabled" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.default' } }}
                                {...register('direccionOrigen')}
                                onKeyDown={handleAddressKeyDown}
                            />
                        </Box>
                    </Box>
                </Paper>

                {/* Vertical Visual Connector */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', py: 0.5 }}>
                    <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', bgcolor: 'divider', zIndex: 0, transform: 'translateX(-50%)' }} />
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', zIndex: 1, boxShadow: theme.shadows[2] }}>
                        <South fontSize="small" />
                    </Box>
                </Box>

                {/* Destination Section */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'success.light', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.dark' }}>
                            <SportsScore />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>Destino</Typography>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Punto de Llegada</Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                Ubigeo o Sucursal de Destino <Typography component="span" color="error">*</Typography>
                            </Typography>
                            <Controller
                                name="destinoID"
                                control={control}
                                render={({ field }) => (
                                    <UbigeoSelect 
                                        label=""
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!errors.destinoID}
                                        helperText={errors.destinoID?.message as string}
                                        direction="column"
                                    />
                                )}
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                Dirección Exacta de Destino <Typography component="span" color="text.disabled" sx={{ textTransform: 'none', fontWeight: 400 }}>(Opcional)</Typography>
                            </Typography>
                            <TextField 
                                fullWidth 
                                placeholder="Ej: Km 12.5 Panamericana Sur, Entrada Principal"
                                multiline
                                rows={2}
                                InputProps={{
                                    startAdornment: <Flag color="disabled" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.default' } }}
                                {...register('direccionDestino')}
                                onKeyDown={handleAddressKeyDown}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Contextual Map Card */}
            <Box sx={{ height: 300, borderRadius: 4, overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', border: '1px solid', borderColor: 'divider' }}>
                <MapContainer 
                    center={origenCoords || [-12.0464, -77.0428]} 
                    zoom={origenCoords && destinoCoords ? 5 : 12} 
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="map-tiles-grayscale" // We can style this via CSS to make it grayscale like the design
                    />
                    
                    {/* Component to automatically handle zoom/bounds based on the route */}
                    <MapAutoZoom 
                        routePath={routeData?.path} 
                        fallbackPoints={origenCoords && destinoCoords ? [origenCoords, destinoCoords] : undefined} 
                    />
                    
                    {origenCoords && (
                        <Marker position={origenCoords} icon={CustomMarkerIcon}>
                            <Popup>Origen del Viaje</Popup>
                        </Marker>
                    )}
                    
                    {destinoCoords && (
                        <Marker position={destinoCoords} icon={DestinationMarkerIcon}>
                            <Popup>Destino del Viaje</Popup>
                        </Marker>
                    )}

                    {origenCoords && destinoCoords && routeData && !isRouteError && (
                        <Polyline 
                            positions={routeData.path} 
                            color={theme.palette.primary.main} 
                            weight={4}
                            opacity={0.8}
                        />
                    )}

                    {origenCoords && destinoCoords && isRouteError && (
                        <Polyline 
                            positions={[origenCoords, destinoCoords]} 
                            color={theme.palette.primary.main} 
                            weight={4}
                            dashArray="10, 10"
                            opacity={0.7}
                        />
                    )}
                </MapContainer>

                {/* Overlay UI */}
                <Box sx={{ position: 'absolute', bottom: 24, left: 24, zIndex: 1000, pointerEvents: 'none' }}>
                    <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isRouteError ? 'warning.main' : 'primary.main', animation: isRouteError ? 'none' : 'pulse 2s infinite' }} />
                        <Typography variant="body2" fontWeight={600}>
                            {!origenCoords || !destinoCoords 
                                ? 'Seleccione origen y destino para calcular ruta'
                                : isRouteLoading
                                    ? 'Calculando ruta para vehículo pesado...'
                                    : isRouteError
                                        ? 'Ruta directa (Servidor de vías ocupado)'
                                        : `Ruta óptima: ${routeData?.distance} km (Aprox. ${routeData?.estimatedDays} días operativos / ${routeData?.drivingTimeHours} hrs viaje)`}
                        </Typography>
                    </Paper>
                </Box>
                <style>{`
                    .map-tiles-grayscale {
                        filter: grayscale(100%) opacity(0.7);
                    }
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.5); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </Box>
        </Box>
    );
}