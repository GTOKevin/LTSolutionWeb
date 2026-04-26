import { z } from 'zod';
import { ALPHA_ESPECIAL_ERROR_MSG, ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';
import { addDaysToDateISO, addMonthsToDateISO } from '@/shared/utils/date-utils';

const positiveRequiredNumber = (field: string) =>
    z.number()
        .refine((value) => Number.isFinite(value), `${field} es requerido`)
        .refine((value) => value > 0, `${field} debe ser mayor a 0`);

const optionalRegexText = (pattern: RegExp, message: string) =>
    z.string()
        .refine((value) => value === '' || pattern.test(value), message)
        .optional();

const optionalNumber = (defaultValue = 0) =>
    z.preprocess(
        (val) => {
            if (val === undefined || val === null || val === '') return defaultValue;
            const parsed = Number(val);
            return isNaN(parsed) ? defaultValue : parsed;
        },
        z.number()
    );

export const viajeEscoltaSchema = z.object({
    tercero: z.boolean().optional(),
    flotaID: z.number().optional(),
    colaboradorID: z.number().optional(),
    nombreConductor: z.string().regex(INPUT_VAL.LETRAS_ESPACIO, ERROR_MESSAGES.LETRAS_ESPACIO).optional(),
    empresa: z.string().regex(INPUT_VAL.ALPHA_NUMERICO_ESPACIOS, ERROR_MESSAGES.ALPHA_NUMERICO_ESPACIOS).optional()
}).superRefine((data, ctx) => {
    if (data.tercero) {
        if (!data.nombreConductor?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El nombre del conductor es requerido",
                path: ["nombreConductor"]
            });
        }
        if (!data.empresa?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La empresa es requerida",
                path: ["empresa"]
            });
        }
    } else {
        if (!data.flotaID || data.flotaID === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El vehículo escolta es requerido",
                path: ["flotaID"]
            });
        }
        if (!data.colaboradorID || data.colaboradorID === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El personal de seguridad es requerido",
                path: ["colaboradorID"]
            });
        }
    }
});

export const viajeGastoSchema = z.object({
    gastoID: z.number().min(1, 'El tipo de gasto es requerido'),
    fechaGasto: z.string().min(1, 'La fecha es requerida'),
    monedaID: z.number().min(1, 'La moneda es requerida'),
    monto: z.number().min(0.5, 'El monto mínimo es 0.50'),
    comprobante: z.boolean(),
    numeroComprobante: z.string().optional(),
    descripcion: z.string().regex(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL).optional(),
    combustible: z.boolean().optional(),
    galones: z.number().optional()
}).superRefine((data, ctx) => {
    if (data.combustible) {
        if (!data.galones || data.galones < 0.50) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El campo de Galones debe tener como minimo un valor de 0.50",
                path: ["galones"]
            });
        }
    }
});

export const viajeGuiaSchema = z.object({
    tipoGuiaID: z.number().min(1, 'El tipo de guía es requerido'),
    serie: z.string().min(1, 'Requerido').regex(/^[0-9]{1,20}$/, 'Solo números, máx 20 caracteres'),
    numero: z.string().min(1, 'Requerido').regex(/^[0-9]{1,20}$/, 'Solo números, máx 20 caracteres'),
    rutaArchivo: z.string().optional()
});

export const viajeIncidenteSchema = z.object({
    fechaHora: z.string().min(1, 'Fecha y hora requeridas'),
    tipoIncidenteID: z.number().min(1, 'El tipo de incidente es requerido'),
    descripcion: z.string().min(1, 'Requerido').regex(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL),
    ubigeoID: z.number().min(1, 'La ubicación es requerida'),
    lugar: z.string().min(1, 'Requerido').regex(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL),
    rutaFoto: z.string().min(1, 'La foto es requerida')
});

export const viajeMercaderiaSchema = z.object({
    mercaderiaID: z.number().min(1, 'La mercaderia es requerida'),
    descripcion: optionalRegexText(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ALPHA_ESPECIAL_ERROR_MSG),
    tipoMedidaID: z.number().min(1, 'El tipo de medida es requerido'),
    alto: positiveRequiredNumber('El alto'),
    largo: positiveRequiredNumber('El largo'),
    ancho: positiveRequiredNumber('El ancho'),
    tipoPesoID: z.number().min(1, 'El tipo de peso es requerido'),
    peso: positiveRequiredNumber('El peso')
});

export const viajePermisoSchema = z.object({
    fechaVigencia: z.string().min(1, 'La fecha de vigencia es requerida'),
    fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
    rutaArchivo: z.string().min(1, 'El archivo es requerido')
}).refine((data) => {
    const vigencia = new Date(data.fechaVigencia);
    const vencimiento = new Date(data.fechaVencimiento);
    return vencimiento >= vigencia;
}, {
    message: "La fecha de vencimiento debe ser igual o mayor a la fecha de vigencia",
    path: ["fechaVencimiento"]
});

export const viajeSchema = z.object({
    clienteID: z.number().min(1, 'El cliente es requerido'),
    tractoID: z.number().min(1, 'El tracto es requerido'),
    colaboradorID: z.number().min(1, 'El conductor es requerido'),
    origenID: z.number().min(1, 'El origen es requerido'),
    destinoID: z.number().min(1, 'El destino es requerido'),
    fechaCarga: z.string().min(1, 'La fecha de carga es requerida'),
    tipoMedidaID: z.number().min(1, 'El tipo de medida es requerido'),
    tipoPesoID: z.number().min(1, 'El tipo de peso es requerido'),
    estadoID: z.number().min(1, 'El estado es requerido'),
    carretaID: z.number().min(1, 'La carreta es requerida'),

    // Optional fields
    cotizacionID: optionalNumber(0),
    direccionOrigen: optionalRegexText(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ALPHA_ESPECIAL_ERROR_MSG),
    direccionDestino: optionalRegexText(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ALPHA_ESPECIAL_ERROR_MSG),
    fechaPartida: z.string().optional(),
    fechaLlegada: z.string().optional(),
    fechaDescarga: z.string().optional(),
    fechaLlegadaBase: z.string().optional(),
    kmInicio: optionalNumber(0),
    kmLlegada: optionalNumber(0),
    kmLlegadaBase: optionalNumber(0),
    requiereEscolta: z.boolean().optional().default(false),
    requierePermiso: z.boolean().optional().default(false),
    largo: optionalNumber(0),
    alto: optionalNumber(0),
    ancho: optionalNumber(0),
    peso: optionalNumber(0),
    ejesTracto: optionalNumber(0),
    ejesCarreta: optionalNumber(0)
}).superRefine((data, ctx) => {
    const fechaMinima = addDaysToDateISO(7);
    const fechaMaxima = addMonthsToDateISO(2);

    if (data.fechaCarga < fechaMinima) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La fecha de carga debe ser desde ${fechaMinima}.`,
            path: ['fechaCarga']
        });
    }

    if (data.fechaCarga > fechaMaxima) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La fecha de carga no puede superar ${fechaMaxima}.`,
            path: ['fechaCarga']
        });
    }
});

export type ViajeFormData = z.infer<typeof viajeSchema>;
export type ViajeEscoltaFormData = z.infer<typeof viajeEscoltaSchema>;
export type ViajeGastoFormData = z.infer<typeof viajeGastoSchema>;
export type ViajeGuiaFormData = z.infer<typeof viajeGuiaSchema>;
export type ViajeIncidenteFormData = z.infer<typeof viajeIncidenteSchema>;
export type ViajeMercaderiaFormData = z.infer<typeof viajeMercaderiaSchema>;
export type ViajePermisoFormData = z.infer<typeof viajePermisoSchema>;
