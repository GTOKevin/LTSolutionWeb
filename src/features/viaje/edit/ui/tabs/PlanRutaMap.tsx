import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useViajeRutas } from '@features/viaje/hooks/useViajeRutas';
import { LocationSearch } from './LocationSearch';
import { AddRutaDialog } from './AddRutaDialog';

type LeafletDefaultIconPrototype = typeof L.Icon.Default.prototype & {
    _getIconUrl?: string;
};

delete (L.Icon.Default.prototype as LeafletDefaultIconPrototype)._getIconUrl;
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
        click(event) {
            onMapClick(event.latlng.lat, event.latlng.lng);
        },
    });
    return null;
}

function RoutingMachine({ waypoints }: { waypoints: L.LatLng[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        const routingControl = L.Routing.control({
            waypoints,
            routeWhileDragging: false,
            addWaypoints: false,
            show: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#005da8', weight: 6, opacity: 0.8, dashArray: '12 8' }],
                extendToWaypoints: true,
                missingRouteTolerance: 10,
            },
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

    const mainRoutes = (rutas || [])
        .filter((ruta) => ruta.esOpcionPrincipal && ruta.latitud && ruta.longitud)
        .sort((a, b) => a.etapaOrden - b.etapaOrden);

    const waypoints = mainRoutes.map((ruta) => L.latLng(ruta.latitud!, ruta.longitud!));

    const secondaryRoutes = (rutas || [])
        .filter((ruta) => !ruta.esOpcionPrincipal && ruta.latitud && ruta.longitud);

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
            <MapContainer center={[-12.0464, -77.0428]} zoom={6} style={{ width: '100%', height: '100%', zIndex: 0 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationSearch onSelectLocation={handleSearchSelect} />
                <MapEventsHandler onMapClick={handleMapClick} />
                <RoutingMachine waypoints={waypoints} />

                {secondaryRoutes.map((ruta) => (
                    <Marker key={ruta.viajeControlRutaId} position={[ruta.latitud!, ruta.longitud!]}>
                        <Popup>
                            <div style={{ fontWeight: 'bold' }}>{ruta.nombreLugar || 'Sin nombre'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{ruta.tipoPunto.nombre} (Alternativa)</div>
                            {ruta.fechaEstimadaLlegada && (
                                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                    ETA: {new Date(ruta.fechaEstimadaLlegada).toLocaleString()}
                                </div>
                            )}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <AddRutaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} viajeId={viajeId} initialData={selectedLocation} />
        </>
    );
}
