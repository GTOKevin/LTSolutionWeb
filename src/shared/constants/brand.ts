/**
 * Constantes de marca de Euro Transport.
 *
 * Centraliza la identidad institucional (razón social, claim, textos de marca)
 * y el contenido estático de marketing para evitar duplicación entre pantallas
 * (login, recuperación de acceso y sidebar).
 *
 * IMPORTANTE: las métricas y certificaciones de `BRAND_METRICS` son CONTENIDO
 * ESTÁTICO institucional (claims de marca), NO telemetría en vivo ni datos
 * dinámicos obtenidos de una API. No deben presentarse como datos operativos
 * reales sin sustento confirmado por negocio.
 */

export const BRAND_CONSTANTS = {
    /** Nombre comercial principal. */
    name: 'EURO TRANSPORT',
    /** Línea superior del bloque tipográfico. */
    taglineTop: 'SERVICIOS GENERALES',
    /** Claim / eslogan inferior del bloque tipográfico. */
    claim: 'TRANSPORTE DE CARGA Y MAQUINARIA PESADA',
    /** Razón social formal. */
    legalName: 'S.G. Euro Transport S.A.C.',
    /** Nombre regional usado en los paneles de marketing. */
    regionName: 'EURO TRANSPORT',
    /** Descripción de servicios usada en el footer de los paneles. */
    services: 'Maquinaria Pesada • Cama Bajas • Furgones',
    /** Sufijo de cumplimiento usado en el copyright. */
    complianceSuffix: 'Cumplimiento Normativo Garantizado',
} as const;

/**
 * Métricas/certificaciones de marca (contenido estático, no telemetría viva).
 */
export const BRAND_METRICS = {
    fleetLabel: 'Flota en Ruta Activa',
    fleetValue: '10+ Unidades Pesadas',
    fleetSub: '100% Monitoreo GPS 24/7',
    controlDocLabel: 'Control Documentario',
    controlDocValue: 'Guías & Manifiestos',
    controlDocSub: 'Despacho Digital Inmediato',
    uptimeValue: '99.9%',
    uptimeLabel: 'Uptime Operativo',
    isoValue: 'ISO',
    isoLabel: 'Certificación 9001:2015',
    hazmatLabel: 'Certificación HAZMAT Clase 1-9',
} as const;

/**
 * Copyright institucional con año dinámico.
 */
export function getBrandCopyright(): string {
    return `© ${new Date().getFullYear()} ${BRAND_CONSTANTS.legalName}. ${BRAND_CONSTANTS.complianceSuffix}.`;
}
