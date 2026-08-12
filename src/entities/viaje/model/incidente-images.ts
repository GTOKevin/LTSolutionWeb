import type { CreateViajeIncidenteDto } from './types';

/**
 * Fuente de imágenes legible de un incidente.
 *
 * `rutasFoto` es la única fuente de imágenes: el contrato ya no expone el
 * campo singular legacy y no hay datos pendientes de migrar.
 */
export interface IncidenteImagenSource {
    rutasFoto?: string[] | null;
}

export function getIncidenteImageRoutes(incidente: IncidenteImagenSource | null | undefined): string[] {
    const rutas = incidente?.rutasFoto;
    return Array.isArray(rutas) ? rutas : [];
}

/**
 * Payload de fotografías normalizado para create/update de incidentes.
 *
 * El backend solo acepta `rutasFoto` (todas las imágenes): se devuelve el
 * arreglo filtrado sin entradas vacías en base64.
 */
export function buildIncidenteImagesPayload(
    rutasFoto: string[] = [],
): Pick<CreateViajeIncidenteDto, 'rutasFoto'> {
    const fotos = rutasFoto
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0);

    return {
        rutasFoto: fotos,
    };
}
