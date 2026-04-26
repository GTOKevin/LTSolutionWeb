import { useQuery } from '@tanstack/react-query';
import { logger } from '../utils/logger';

// Ideally, this should come from process.env.VITE_ORS_API_KEY
// Fallback removed due to security policies. Use environment variable strictly.
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export interface RouteData {
    path: [number, number][];
    distance: string;
    duration: number; // in minutes (raw ORS duration)
    drivingTimeHours: number; // calculated hours considering Peruvian geography
    estimatedDays: number; // 12h driving limit (6am-6pm)
    geographyFactor: number; // applied factor (1.4 or 1.7)
}

const SIERRA_SELVA_DEPARTMENTS = [
    'AMAZONAS', 'CAJAMARCA', 'HUANUCO', 'PASCO', 'JUNIN', 'HUANCAVELICA', 
    'AYACUCHO', 'APURIMAC', 'CUSCO', 'PUNO', 'SAN MARTIN', 'LORETO', 
    'UCAYALI', 'MADRE DE DIOS'
];

export function useOrsRoute(
    origenCoords: [number, number] | null, 
    destinoCoords: [number, number] | null,
    origenDepartamento?: string,
    destinoDepartamento?: string
) {
    return useQuery({
        queryKey: ['ors-route', origenCoords, destinoCoords, origenDepartamento, destinoDepartamento],
        queryFn: async (): Promise<RouteData | null> => {
            if (!origenCoords || !destinoCoords) return null;
            
            if (!ORS_API_KEY) {
                logger.error('VITE_ORS_API_KEY no está configurada en las variables de entorno. Deshabilitando cálculo de ruta ORS.');
                throw new Error('VITE_ORS_API_KEY no configurada.');
            }
            
            // ORS expects [longitude, latitude]
            const start = `${origenCoords[1]},${origenCoords[0]}`;
            const end = `${destinoCoords[1]},${destinoCoords[0]}`;
            
            // using driving-hgv for heavy goods vehicles
            const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-hgv?api_key=${ORS_API_KEY}&start=${start}&end=${end}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch route');
            }
            
            const data = await response.json();
            
            if (!data.features || data.features.length === 0) {
                throw new Error('No route found');
            }

            const geometry = data.features[0].geometry.coordinates;
            const summary = data.features[0].properties.summary;

            // Convert [lon, lat] to [lat, lon] for Leaflet
            const latLngs = geometry.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
            
            const rawDurationHours = summary.duration / 3600; // convert seconds to hours
            
            // Factor de corrección para Perú (geografía, tráfico de carga, etc.)
            // Detectar si el origen o destino pertenecen a la Sierra o Selva
            const originIsSierraSelva = origenDepartamento && SIERRA_SELVA_DEPARTMENTS.includes(origenDepartamento.toUpperCase());
            const destinationIsSierraSelva = destinoDepartamento && SIERRA_SELVA_DEPARTMENTS.includes(destinoDepartamento.toUpperCase());
            
            // Si el viaje involucra la sierra o selva, aplicamos 1.7. Si es pura costa, 1.4.
            const peruvianFactor = (originIsSierraSelva || destinationIsSierraSelva) ? 1.8 : 1.4;
            const realDrivingTimeHours = rawDurationHours * peruvianFactor;
            

            const OPERATIONAL_HOURS_PER_DAY = 12;
            const MEAL_BREAK_HOURS = 2;
            const EFFECTIVE_DRIVING_HOURS_PER_DAY = OPERATIONAL_HOURS_PER_DAY - MEAL_BREAK_HOURS; // 10 horas reales de manejo por día
            
            const estimatedDays = Math.ceil(realDrivingTimeHours / EFFECTIVE_DRIVING_HOURS_PER_DAY);

            return {
                path: latLngs,
                distance: (summary.distance / 1000).toFixed(1), // in km
                duration: Math.round(summary.duration / 60), // raw ORS in minutes
                drivingTimeHours: Number(realDrivingTimeHours.toFixed(1)),
                estimatedDays: estimatedDays,
                geographyFactor: peruvianFactor
            };
        },
        enabled: !!origenCoords && !!destinoCoords && !!ORS_API_KEY,
        staleTime: 1000 * 60 * 15, // Cache route for 15 minutes to avoid hitting rate limits
        retry: 1
    });
}
