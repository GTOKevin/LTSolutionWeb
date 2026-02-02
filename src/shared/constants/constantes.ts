export const TIPO_MAESTRO = {
    TIPO_FLOTA: 'VEHICULO',
    TIPO_PESO: 'PESO',
    TIPO_MEDIDA: 'MEDIDA',
    TIPO_DOCUMENTO_FLOTA:'DOCUMENTO_FLOTA',
    TIPO_SEXO: 'SEXO',
    TIPO_LICENCIA: 'LICENCIA',
    TIPO_PAGO: 'PAGO',
    TIPO_PRODUCTO: 'PRODUCTO',
    TIPO_SERVICIO: 'MANTENIMIENTO'
}

export const ESTADO_SECCIONES = {
    USUARIO: 'Usuario',
    MANTENIMIENTO:'MANTENIMIENTO'
} as const;

export const TIPOS_COMBUSTIBLE = [
    { value: 'DIESEL', label: 'DIESEL' },
    { value: 'GASOLINA', label: 'GASOLINA' },
    { value: 'GASOLINA/GNV', label: 'GASOLINA/GNV' },
    { value: 'GASOLINA/GLP', label: 'GASOLINA/GLP' },
];

export const ESTADO_MANTENIMIENTO_ID = {
    COMPLETADO: 102
};

export const ESTADO_MANTENIMIENTO_NAMES = {
    PENDIENTE: ['pendiente', 'agendado'],
    PROCESO: ['proceso', 'taller'],
    COMPLETADO: ['finalizado', 'completado'],
    CANCELADO: ['cancelado']
};

export const PLACA_PERU_REGEX = /^[A-Z0-9]{3}-[0-9]{3,4}$/;

export const TEXTO_SEGURO_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\-_.,\s]+$/;
export const DECIMAL_10_2_REGEX = /^\d{1,8}(\.\d{1,2})?$/;
export const TELEFONO_PERU_REGEX = /^9\d{8}$/;

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const ROWS_DOC_PER_PAGE_OPTIONS = [5, 10, 25, 50];