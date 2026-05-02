

export const ESTADO_SECCIONES = {
    USUARIO: 'USUARIO',
    MANTENIMIENTO:'MANTENIMIENTO',
    VIAJE:'VIAJE',
    FACTURA:'FACTURA',
    FACTURA_PAGO:'FACTURA_PAGO'
} as const;

export const TIPOS_COMBUSTIBLE = [
    { value: 'DIESEL', label: 'DIESEL' },
    { value: 'GASOLINA', label: 'GASOLINA' },
    { value: 'GASOLINA/GNV', label: 'GASOLINA/GNV' },
    { value: 'GASOLINA/GLP', label: 'GASOLINA/GLP' },
];

export const ESTADO_MANTENIMIENTO_ID = {
    AGENDADO: 101,
    COMPLETADO: 102,
    TALLER:103
};

export const ESTADO_VIAJE_COD = {
    Agendado: "AGE",
    Transito: "TRA",
    Descargando: "DESC",
    Completado: "COMP"
} as const;

export const ESTADO_VIAJE_ID = {
    AGENDADO: 201,
    TRANSITO: 202,
    DESCARGANDO: 203,
    COMPLETADO: 204
} as const;

export const ESTADO_FACTURA_ID = {
    REGISTRADA: 301,
    EMITIDO: 302,
    ENTREGADO: 303
} as const;

export const ESTADO_FACTURA_PAGO_ID = {
    PENDIENTE: 401,
    PAGADO: 402
} as const;

export const IGV_RATE = 0.18;

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
    ALPHA_NUMERICO_ESPECIAL : /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-_\/()[\]:]*$/,
    ALPHA_NUMERICO_ESPACIOS : /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/,
    LETRAS_ESPACIO: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
    ALPHA_NUMERICO_GUION_SIN_ESPACIOS: /^[a-zA-Z0-9\-]*$/,
    DECIMAL_10_2_REGEX : /^\d{1,8}(\.\d{1,2})?$/,
    TELEFONO_PERU_REGEX : /^9\d{8}$/,
    PASSWORD_SIN_ESPACIOS: /^\S+$/,
    PASSWORD_AL_MENOS_UNA_LETRA: /[A-Za-z]/,
    PASSWORD_AL_MENOS_UN_NUMERO: /\d/,
    PASSWORD_AL_MENOS_UN_ESPECIAL: /[^A-Za-z0-9]/,
    FACTURA_SERIE_PERU: /^[FB][A-Z0-9]{3}$/,
    FACTURA_NUMERO_PERU: /^\d{1,8}$/,
    NUMERO_OPERACION_PERU: /^[0-9]{6,20}$/
}
export const ERROR_MESSAGES = {
    PLACA_INVALIDA: 'Debe ser una placa válida (XXX-1234 o XXX-123)',
    TEXTO_SEGURO: 'Caracteres inválidos (Solo letras, números y ,._- )',
    ALPHA_NUMERICO_ESPECIAL: 'Caracteres inválidos (Solo letras, números y ,._-/()[]: )',
    ALPHA_NUMERICO_ESPACIOS: 'Caracteres inválidos (Solo letras, números y espacios)',
    LETRAS_ESPACIO: 'Caracteres inválidos (Solo letras y espacios)',
    ALPHA_NUMERICO_GUION_SIN_ESPACIOS: 'Caracteres inválidos (Solo letras, números y guiones, sin espacios)',
    DECIMAL_10_2: 'Debe ser un número decimal con máximo 10 dígitos y 2 decimales',
    TELEFONO_PERU: 'Debe ser un celular válido (9 dígitos)',
    PASSWORD_SIN_ESPACIOS: 'El valor no debe contener espacios.',
    PASSWORD_AL_MENOS_UNA_LETRA: 'Debe incluir al menos una letra.',
    PASSWORD_AL_MENOS_UN_NUMERO: 'Debe incluir al menos un número.',
    PASSWORD_AL_MENOS_UN_ESPECIAL: 'Debe incluir al menos un carácter especial.',
    FACTURA_SERIE_INVALIDA: 'Formato de serie inválido (Ej: F001, B001)',
    FACTURA_NUMERO_INVALIDO: 'El número debe contener solo dígitos (máx. 8)',
    NUMERO_OPERACION_INVALIDO: 'El número de operación debe contener entre 6 y 20 dígitos numéricos'
}

export const ALPHA_ESPECIAL_ERROR_MSG = 'Caracteres inválidos (Solo letras, números y ,._-/()[]: )';


export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const ROWS_DOC_PER_PAGE_OPTIONS = [5, 10, 25, 50];