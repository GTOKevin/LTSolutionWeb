import { env } from '@shared/config/env';

interface OpenRouteServiceDirectionsResponse {
    features?: Array<{
        geometry: {
            coordinates: number[][];
        };
        properties: {
            summary: {
                distance: number;
                duration: number;
            };
        };
    }>;
}

export const orsApi = {
    getDrivingHgvRoute: async (
        originCoords: [number, number],
        destinationCoords: [number, number],
    ): Promise<OpenRouteServiceDirectionsResponse> => {
        if (!env.orsApiKey) {
            throw new Error('VITE_ORS_API_KEY no configurada.');
        }

        const start = `${originCoords[1]},${originCoords[0]}`;
        const end = `${destinationCoords[1]},${destinationCoords[0]}`;
        const url = new URL('https://api.openrouteservice.org/v2/directions/driving-hgv');
        url.searchParams.set('start', start);
        url.searchParams.set('end', end);

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: env.orsApiKey,
                Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch route');
        }

        return response.json() as Promise<OpenRouteServiceDirectionsResponse>;
    },
};
