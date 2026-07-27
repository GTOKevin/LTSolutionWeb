import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';
import { IGV_RATE } from '@entities/factura/model/constants';
import type { Factura } from '@entities/factura/model/types';

export const createFacturaSchema = z.object({
    clienteID: z.number().min(1, 'Cliente es requerido'),
    serie: z.string()
        .min(1, 'Serie es requerida')
        .max(10, 'Máximo 10 caracteres')
        .toUpperCase()
        .refine(val => INPUT_VAL.FACTURA_SERIE_PERU.test(val), {
            message: ERROR_MESSAGES.FACTURA_SERIE_INVALIDA
        }),
    numero: z.string()
        .min(1, 'Número es requerido')
        .max(20, 'Máximo 20 caracteres')
        .refine(val => INPUT_VAL.FACTURA_NUMERO_PERU.test(val), {
            message: ERROR_MESSAGES.FACTURA_NUMERO_INVALIDO
        }),
    fechaEmision: z.string().min(1, 'Fecha de Emisión es requerida'),
    fechaCompromisoPago: z.string().optional().nullable(),
    diasCredito: z.coerce.number().optional().nullable(),
    monedaID: z.number().min(1, 'Moneda es requerida'),
    estadoID: z.number().min(1, 'Estado es requerido')
});

export type CreateFacturaSchema = z.infer<typeof createFacturaSchema>;

export function getCreateFacturaDefaultValues(): CreateFacturaSchema {
    return {
        clienteID: 0,
        serie: '',
        numero: '',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaCompromisoPago: '',
        diasCredito: null,
        monedaID: 0,
        estadoID: 0,
    };
}

export function mapFacturaToFormValues(factura: Factura): CreateFacturaSchema {
    return {
        clienteID: factura.clienteID,
        serie: factura.serie,
        numero: factura.numero,
        fechaEmision: factura.fechaEmision.split('T')[0],
        fechaCompromisoPago: factura.fechaCompromisoPago ? factura.fechaCompromisoPago.split('T')[0] : '',
        diasCredito: factura.diasCredito || null,
        monedaID: factura.monedaID,
        estadoID: factura.estadoID,
    };
}

const optionalStringField = z.string().optional().nullable();

const decimalAmountField = (minimum: number, message: string) => z.preprocess(
    (value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }

        const parsed = Number(value);
        return Number.isNaN(parsed) ? value : parsed;
    },
    z.number().min(minimum, message)
);

export function calculateFacturaDetalleTotal(subTotal: number, applyIgv: boolean) {
    const rawTotal = applyIgv ? subTotal * (1 + IGV_RATE) : subTotal;
    return Math.round(rawTotal * 100) / 100;
}

export function calculateFacturaDetalleIgv(subTotal: number, applyIgv: boolean) {
    return Math.round((calculateFacturaDetalleTotal(subTotal, applyIgv) - subTotal) * 100) / 100;
}

const createFacturaDetalleSchemaBase = z.object({
    viajeID: z.number().min(1, 'Viaje es requerido'),
    descripcion: optionalStringField.refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    }),
    monedaID: z.number().min(1, 'Moneda es requerida'),
    subTotal: decimalAmountField(0, 'Debe ser mayor o igual a 0'),
    igv: z.boolean(),
}).superRefine((data, ctx) => {
    const total = calculateFacturaDetalleTotal(data.subTotal, data.igv);

    if (total < 10) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['subTotal'],
            message: 'El total calculado debe ser mayor o igual a 10',
        });
    }
});

export const createFacturaDetalleSchema = createFacturaDetalleSchemaBase.transform((data) => ({
    ...data,
    total: calculateFacturaDetalleTotal(data.subTotal, data.igv),
}));

export type CreateFacturaDetalleForm = z.infer<typeof createFacturaDetalleSchema>;
export type CreateFacturaDetalleFormInput = z.input<typeof createFacturaDetalleSchema>;

export function buildFacturaDetalleDefaultValues(monedaId: number): CreateFacturaDetalleFormInput {
    return {
        viajeID: 0,
        descripcion: '',
        monedaID: monedaId,
        subTotal: 0,
        igv: true,
    };
}

const createFacturaPagoSchemaBase = z.object({
    fechaPago: z.string().min(1, 'Fecha de Pago es requerida'),
    fechaAcreditacion: z.string().optional().nullable(),
    tipoPagoID: z.number().min(1, 'Tipo de Pago es requerido'),
    estadoID: z.number().min(1, 'Estado es requerido'),
    monedaID: z.number().min(1, 'Moneda es requerida'),
    montoAbonado: z.coerce.number().min(0.01, 'Monto debe ser mayor a 0'),
    numeroOperacion: z.string().optional().nullable().refine(val => !val || INPUT_VAL.NUMERO_OPERACION_PERU.test(val), {
        message: ERROR_MESSAGES.NUMERO_OPERACION_INVALIDO
    }),
    observacion: z.string().optional().nullable().refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    })
});

export const createFacturaPagoSchema = (maxAmount: number) => createFacturaPagoSchemaBase.superRefine((data, ctx) => {
    if (data.montoAbonado > maxAmount) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['montoAbonado'],
            message: `El monto no puede exceder el saldo pendiente (${maxAmount.toFixed(2)}).`,
        });
    }
});

export const buildFacturaPagoDefaultValues = (monedaId: number, maxAmount: number) => ({
    fechaPago: new Date().toISOString().split('T')[0],
    fechaAcreditacion: '',
    tipoPagoID: 0,
    estadoID: 0,
    monedaID: monedaId,
    montoAbonado: maxAmount,
    numeroOperacion: '',
    observacion: '',
});

export type CreateFacturaPagoSchema = z.infer<typeof createFacturaPagoSchemaBase>;
