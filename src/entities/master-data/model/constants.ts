export const ESTADO_SECTIONS = {
    USUARIO: 'USUARIO',
    MANTENIMIENTO: 'MANTENIMIENTO',
    VIAJE: 'VIAJE',
    FACTURA: 'FACTURA',
    FACTURA_PAGO: 'FACTURA_PAGO',
} as const;

export const TIPO_MAESTRO_SECTIONS = {
    FLOTA: 'VEHICULO',
    PESO: 'PESO',
    MEDIDA: 'MEDIDA',
    DOCUMENTO_FLOTA: 'DOCUMENTO_FLOTA',
    SEXO: 'SEXO',
    LICENCIA: 'LICENCIA',
    PAGO: 'PAGO',
    PRODUCTO: 'PRODUCTO',
    SERVICIO: 'MANTENIMIENTO',
    GUIA: 'GUIA',
    INCIDENTE: 'INCIDENTE',
    ESTADO_FACTURA: 'ESTADO_FACTURA',
    MEDIO_PAGO: 'MEDIO_PAGO',
    PUNTO_RUTA: 'PUNTO_RUTA',
    COMBUSTIBLE: 'COMBUSTIBLE',
} as const;

/**
 * Códigos del catálogo maestro de licencias (seccion `LICENCIA`).
 *
 * El catálogo de `TipoMaestro` filtra por `codigo` (columna del maestro, no es el `id`):
 * - `EMPLEADOS = '1'` identifica los tipos de licencia que el Usuario/Colaborador puede
 *   auto-solicitar desde el portal empleado. Es un contrato intencional con el catálogo
 *   backend/DB (los demás códigos quedan reservados a la gestión admin de licencias).
 *
 * Si en el futuro el backend expone este conjunto por contrato/query, reemplazar aquí.
 */
export const LICENCIA_CODIGO = {
    EMPLEADOS: '1'
} as const;

export const MONEDA_CODES = {
    PEN: 'PEN',
    USD: 'USD',
    EUR: 'EUR',
} as const;

export const TIPO_MAESTRO_CODES = {
    MEDIDA_METRO: 'M',
    PESO_KILOGRAMO: 'Kg',
} as const;

export const ESTADO_SECCIONES = ESTADO_SECTIONS;
export const SECCION_MAESTRO = TIPO_MAESTRO_SECTIONS;
