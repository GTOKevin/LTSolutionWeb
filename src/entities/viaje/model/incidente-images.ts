import type { CreateViajeIncidenteDto } from './types';

/**
 * Fuente de imágenes legible de un incidente.
 *
 * Contrato de lectura resistente a datos legacy: si el backend devuelve un
 * registro previo que solo trae `rutaFoto` (sin la clave `rutasFoto`), se hace
 * fallback a `[rutaFoto]` y se evita el `undefined.length` que rompería el
 * render de listas, PDF y detalle.
 */
export interface IncidenteImagenSource {
    rutaFoto?: string | null;
    rutasFoto?: string[] | null;
}

export function getIncidenteImageRoutes(incidente: IncidenteImagenSource | null | undefined): string[] {
    const rutas = incidente?.rutasFoto;
    if (Array.isArray(rutas) && rutas.length > 0) {
        return rutas;
    }
    return incidente?.rutaFoto ? [incidente.rutaFoto] : [];
}

/**
 * Payload de fotografías normalizado para create/update de incidentes.
 *
 * El backend acepta tanto `rutaFoto?` (principal) como `rutasFoto?` (todas).
 * Unifica la forma del contrato entre el flujo de edición de viaje y el portal
 * empleado para evitar divergencias: se deriva `rutaFoto` de la primera imagen
 * y `rutasFoto` del arreglo filtrado (sin entradas vacías en base64).
 */
export function buildIncidenteImagesPayload(
    rutasFoto: string[] = [],
): Pick<CreateViajeIncidenteDto, 'rutaFoto' | 'rutasFoto'> {
    const fotos = rutasFoto
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0);

    return {
        rutaFoto: fotos[0],
        rutasFoto: fotos,
    };
}