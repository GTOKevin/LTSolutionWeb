import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';
import { IGV_RATE } from '@entities/factura/model/constants';
import type { CreateFacturaDto, Factura, UpdateFacturaDto } from '@entities/factura/model/types';
import { addMonthsToDateISO, getCurrentDateISO, parseDateOnly, toInputDate } from '@shared/utils/date-utils';

const FACTURA_VENCIMIENTO_DEFAULT_MONTHS = 1;

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
    fechaVencimiento: z.string().optional().nullable(),
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
        fechaEmision: getCurrentDateISO(),
        fechaVencimiento: getFacturaDefaultFechaVencimiento(),
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
        fechaVencimiento: factura.fechaVencimiento ? factura.fechaVencimiento.split('T')[0] : '',
        fechaCompromisoPago: factura.fechaCompromisoPago ? factura.fechaCompromisoPago.split('T')[0] : '',
        diasCredito: factura.diasCredito || null,
        monedaID: factura.monedaID,
        estadoID: factura.estadoID,
    };
}

export function getFacturaDefaultFechaVencimiento(baseDate?: string | null) {
    const parsedBaseDate = baseDate ? parseDateOnly(baseDate) : null;
    return addMonthsToDateISO(FACTURA_VENCIMIENTO_DEFAULT_MONTHS, parsedBaseDate ?? new Date());
}

export function resolveFacturaFechaVencimiento(value?: string | null) {
    const defaultFechaVencimiento = getFacturaDefaultFechaVencimiento();
    const inputDate = value ? parseDateOnly(value) : null;
    const defaultDate = parseDateOnly(defaultFechaVencimiento);

    if (!inputDate || !defaultDate || inputDate < defaultDate) {
        return defaultFechaVencimiento;
    }

    return toInputDate(inputDate);
}

export function buildCreateFacturaPayload(
    values: CreateFacturaSchema,
    estadoID: number
): CreateFacturaDto {
    return {
        ...values,
        fechaVencimiento: resolveFacturaFechaVencimiento(values.fechaVencimiento),
        fechaCompromisoPago: null,
        estadoID,
        detalles: [],
        pagos: [],
    };
}

export function buildUpdateFacturaPayload(values: CreateFacturaSchema): UpdateFacturaDto {
    return {
        fechaEmision: values.fechaEmision,
        fechaVencimiento: resolveFacturaFechaVencimiento(values.fechaVencimiento),
        fechaCompromisoPago: null,
        diasCredito: values.diasCredito ?? null,
        estadoID: values.estadoID,
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

export function roundFacturaDetalleAmount(value: number, precision: number = 2) {
    const factor = 10 ** precision;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateFacturaDetalleTotal(subTotal: number, applyIgv: boolean) {
    const rawTotal = applyIgv ? subTotal * (1 + IGV_RATE) : subTotal;
    return roundFacturaDetalleAmount(rawTotal);
}

export function calculateFacturaDetalleIgv(subTotal: number, applyIgv: boolean) {
    return roundFacturaDetalleAmount(calculateFacturaDetalleTotal(subTotal, applyIgv) - subTotal);
}

export function calculateFacturaDetalleSubtotalFromTotal(total: number, applyIgv: boolean) {
    if (!Number.isFinite(total) || total <= 0) {
        return 0;
    }

    const rawSubtotal = applyIgv ? total / (1 + IGV_RATE) : total;
    return roundFacturaDetalleAmount(rawSubtotal, 6);
}

const createFacturaDetalleSchemaBase = z.object({
    viajeID: z.number().min(1, 'Viaje es requerido'),
    descripcion: optionalStringField.refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    }),
    monedaID: z.number().min(1, 'Moneda es requerida'),
    subTotal: decimalAmountField(0, 'Debe ser mayor o igual a 0'),
    igv: z.literal(true),
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
