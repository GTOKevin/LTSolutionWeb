export const TIPO_MAESTRO = {
    TIPO_FLOTA: 'VEHICULO',
    TIPO_PESO: 'PESO',
    TIPO_MEDIDA: 'MEDIDA',
    TIPO_DOCUMENTO_FLOTA:'DOCUMENTO_FLOTA',
    TIPO_SEXO: 'SEXO',
    TIPO_LICENCIA: 'LICENCIA',
    TIPO_PAGO: 'PAGO',
    TIPO_PRODUCTO: 'PRODUCTO',
    TIPO_SERVICIO: 'MANTENIMIENTO',
    TIPO_GUIA: 'GUIA',
    TIPO_INCIDENTE: 'INCIDENTE'
}as const;

export const ESTADO_SECCIONES = {
    USUARIO: 'USUARIO',
    MANTENIMIENTO:'MANTENIMIENTO',
    VIAJE:'VIAJE'
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

export const ESTADO_VIAJE_COD = {
    Agendado: "AGE",
    Transito: "TRA",
    Cancelado: "CAN",
    Completado: "COMP"
} as const;

export const ESTADO_VIAJE_ID = {
    AGENDADO: 201,
    TRANSITO: 202,
    CANCELADO: 203,
    COMPLETADO: 204
} as const;

export const ROL_USUARIO_ID = {
    ADMINISTRADOR: 1,
    GERENTE_GENERAL: 2,
    ASISTENTE_LOGISTICA: 3,
    RECURSOS_HUMANOS: 4,
    CONDUCTOR: 5
} as const;

export const MONEDA_ID = {
    SOLES: 1,
    DOLARES: 2,
    EURO: 3
} as const;

export const TIPO_FLOTA={
    CAMIONES:"N3",
    CARRETAS:"O4",
    LIVIANOS:"N1",
    TODOS:""
}as const;

export const INPUT_VAL={
    PLACA_PERU_REGEX : /^[A-Z0-9]{3}-[0-9]{3,4}$/,
    TEXTO_SEGURO_REGEX : /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\-_.,\s]+$/,
    ALPHA_NUMERICO_ESPECIAL : /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-_\/()[\]]*$/,
    ALPHA_NUMERICO_ESPACIOS : /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/,
    LETRAS_ESPACIO: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
    DECIMAL_10_2_REGEX : /^\d{1,8}(\.\d{1,2})?$/,
    TELEFONO_PERU_REGEX : /^9\d{8}$/
}
export const ERROR_MESSAGES = {
    PLACA_INVALIDA: 'Debe ser una placa válida (XXX-1234 o XXX-123)',
    TEXTO_SEGURO: 'Caracteres inválidos (Solo letras, números y ,._- )',
    ALPHA_NUMERICO_ESPECIAL: 'Caracteres inválidos (Solo letras, números y ,._-/()[] )',
    ALPHA_NUMERICO_ESPACIOS: 'Caracteres inválidos (Solo letras, números y espacios)',
    LETRAS_ESPACIO: 'Caracteres inválidos (Solo letras y espacios)',
    DECIMAL_10_2: 'Debe ser un número decimal con máximo 10 dígitos y 2 decimales',
    TELEFONO_PERU: 'Debe ser un celular válido (9 dígitos)'
}

export const ALPHA_ESPECIAL_ERROR_MSG = 'Caracteres inválidos (Solo letras, números y ,._-/()[] )';


export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const ROWS_DOC_PER_PAGE_OPTIONS = [5, 10, 25, 50];