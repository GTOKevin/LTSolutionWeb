export const IGV_RATE = 0.18;


export const TIPO_DETALLE_CODES = {
    FLETE: 'FLETE',
    SOBRESTADIA: 'SOBRESTADIA',
} as const;

export type TipoDetalleCodigo = (typeof TIPO_DETALLE_CODES)[keyof typeof TIPO_DETALLE_CODES];

export const FACTURA_DETALLE_CONCEPTOS = [
    TIPO_DETALLE_CODES.FLETE,
    TIPO_DETALLE_CODES.SOBRESTADIA,
] as const;

export const TIPO_DETALLE_LABELS: Record<TipoDetalleCodigo, string> = {
    [TIPO_DETALLE_CODES.FLETE]: 'Flete por viaje',
    [TIPO_DETALLE_CODES.SOBRESTADIA]: 'Sobrestadía',
};
