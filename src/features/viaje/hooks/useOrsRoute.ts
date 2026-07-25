import { useQuery } from '@tanstack/react-query';
import { orsApi } from '@shared/api/ors.api';
import { env } from '@shared/config/env';
import { logger } from '@shared/utils/logger';

export interface RouteData {
    path: [number, number][];
    distance: string;
    duration: number;
    drivingTimeHours: number;
    estimatedDays: number;
    geographyFactor: number;
}

const SIERRA_SELVA_DEPARTMENTS = [
    'AMAZONAS', 'CAJAMARCA', 'HUANUCO', 'PASCO', 'JUNIN', 'HUANCAVELICA',
    'AYACUCHO', 'APURIMAC', 'CUSCO', 'PUNO', 'SAN MARTIN', 'LORETO',
    'UCAYALI', 'MADRE DE DIOS'
];

export const ORS_CONFIG_ERROR_MESSAGE = 'VITE_ORS_API_KEY no configurada.';

export function isOrsConfigurationError(error: unknown) {
    return error instanceof Error && error.message === ORS_CONFIG_ERROR_MESSAGE;
}

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

            if (!env.orsApiKey) {
                logger.error('VITE_ORS_API_KEY no está configurada en las variables de entorno. Deshabilitando cálculo de ruta ORS.');
                throw new Error(ORS_CONFIG_ERROR_MESSAGE);
            }

            const data = await orsApi.getDrivingHgvRoute(origenCoords, destinoCoords);

            if (!data.features || data.features.length === 0) {
                throw new Error('No route found');
            }

            const geometry = data.features[0].geometry.coordinates;
            const summary = data.features[0].properties.summary;
            const latLngs = geometry.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
            const rawDurationHours = summary.duration / 3600;
            const originIsSierraSelva = origenDepartamento && SIERRA_SELVA_DEPARTMENTS.includes(origenDepartamento.toUpperCase());
            const destinationIsSierraSelva = destinoDepartamento && SIERRA_SELVA_DEPARTMENTS.includes(destinoDepartamento.toUpperCase());
            const peruvianFactor = (originIsSierraSelva || destinationIsSierraSelva) ? 1.8 : 1.4;
            const realDrivingTimeHours = rawDurationHours * peruvianFactor;
            const OPERATIONAL_HOURS_PER_DAY = 12;
            const MEAL_BREAK_HOURS = 2;
            const EFFECTIVE_DRIVING_HOURS_PER_DAY = OPERATIONAL_HOURS_PER_DAY - MEAL_BREAK_HOURS;
            const estimatedDays = Math.ceil(realDrivingTimeHours / EFFECTIVE_DRIVING_HOURS_PER_DAY);

            return {
                path: latLngs,
                distance: (summary.distance / 1000).toFixed(1),
                duration: Math.round(summary.duration / 60),
                drivingTimeHours: Number(realDrivingTimeHours.toFixed(1)),
                estimatedDays,
                geographyFactor: peruvianFactor
            };
        },
        enabled: !!origenCoords && !!destinoCoords,
        staleTime: 1000 * 60 * 15,
        retry: (failureCount, error) => {
            if (isOrsConfigurationError(error)) {
                return false;
            }

            return failureCount < 1;
        }
    });
}
