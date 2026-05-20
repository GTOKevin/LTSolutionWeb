import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useViajeRutas } from '@features/viaje/hooks/useViajeRutas';
import { LocationSearch } from './LocationSearch';
import { AddRutaDialog } from './AddRutaDialog';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PlanRutaMapProps {
    viajeId: number;
}

function MapEventsHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RoutingMachine({ waypoints }: { waypoints: L.LatLng[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        const routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            addWaypoints: false,
            show: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#005da8', weight: 6, opacity: 0.8, dashArray: '12 8' }],
                extendToWaypoints: true,
                missingRouteTolerance: 10
            }
        }).addTo(map);

        return () => {
            map.removeControl(routingControl);
        };
    }, [map, waypoints]);

    return null;
}

export function PlanRutaMap({ viajeId }: PlanRutaMapProps) {
    const { data: rutas } = useViajeRutas(viajeId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; nombreLugar: string } | null>(null);

    // Filter main options to trace the route
    const mainRoutes = (rutas || [])
        .filter(r => r.esOpcionPrincipal && r.latitud && r.longitud)
        .sort((a, b) => a.etapaOrden - b.etapaOrden);

    const waypoints = mainRoutes.map(r => L.latLng(r.latitud!, r.longitud!));

    // Secondary options for markers only
    const secondaryRoutes = (rutas || [])
        .filter(r => !r.esOpcionPrincipal && r.latitud && r.longitud);

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng, nombreLugar: '' });
        setDialogOpen(true);
    };

    const handleSearchSelect = (lat: number, lng: number, name: string) => {
        setSelectedLocation({ lat, lng, nombreLugar: name });
        setDialogOpen(true);
    };

    return (
        <>
            <MapContainer 
                center={[-12.0464, -77.0428]} // Default center (Lima, Peru)
                zoom={6} 
                style={{ width: '100%', height: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <LocationSearch onSelectLocation={handleSearchSelect} />
                <MapEventsHandler onMapClick={handleMapClick} />
                <RoutingMachine waypoints={waypoints} />

                {/* Render markers for secondary options */}
                {secondaryRoutes.map(ruta => (
                    <Marker key={ruta.viajeControlRutaId} position={[ruta.latitud!, ruta.longitud!]}>
                        <Popup>
                            <div style={{ fontWeight: 'bold' }}>{ruta.nombreLugar || 'Sin nombre'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{ruta.tipoPunto.nombre} (Alternativa)</div>
                            {ruta.fechaEstimadaLlegada && (
                                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>ETA: {new Date(ruta.fechaEstimadaLlegada).toLocaleString()}</div>
                            )}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <AddRutaDialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)} 
                viajeId={viajeId} 
                initialData={selectedLocation} 
            />
        </>
    );
}