import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';

export const createFacturaSchema = z.object({
    clienteID: z.number().min(1, 'Cliente es requerido'),
    serie: z.string()
        .min(1, 'Serie es requerida')
        .max(4, 'Máximo 4 caracteres')
        .toUpperCase()
        .refine(val => INPUT_VAL.FACTURA_SERIE_PERU.test(val), {
            message: ERROR_MESSAGES.FACTURA_SERIE_INVALIDA
        }),
    numero: z.string()
        .min(1, 'Número es requerido')
        .max(8, 'Máximo 8 caracteres')
        .refine(val => INPUT_VAL.FACTURA_NUMERO_PERU.test(val), {
            message: ERROR_MESSAGES.FACTURA_NUMERO_INVALIDO
        }),
    fechaEmision: z.string().min(1, 'Fecha de Emisión es requerida'),
    fechaVencimiento: z.string().min(1, 'Fecha de Vencimiento es requerida'),
    fechaCompromisoPago: z.string().optional().nullable(),
    diasCredito: z.number().optional().nullable(),
    monedaID: z.number().min(1, 'Moneda es requerida'),
    estadoID: z.number().min(1, 'Estado es requerido')
});

export type CreateFacturaSchema = z.infer<typeof createFacturaSchema>;

export const createFacturaDetalleSchema = z.object({
    viajeID: z.number().min(1, 'Viaje es requerido'),
    descripcion: z.string().optional().nullable().refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    }),
    monedaID: z.number().min(1, 'Moneda es requerida'),
    subTotal: z.number().min(0, 'Debe ser mayor o igual a 0'),
    igv: z.boolean()
});

export type CreateFacturaDetalleSchema = z.infer<typeof createFacturaDetalleSchema>;

export const createFacturaPagoSchema = z.object({
    fechaPago: z.string().min(1, 'Fecha de Pago es requerida'),
    fechaAcreditacion: z.string().optional().nullable(),
    tipoPagoID: z.number().min(1, 'Tipo de Pago es requerido'),
    estadoID: z.number().min(1, 'Estado es requerido'),
    monedaID: z.number().min(1, 'Moneda es requerida'),
    montoAbonado: z.number().min(0.01, 'Monto debe ser mayor a 0'),
    numeroOperacion: z.string().optional().nullable().refine(val => !val || INPUT_VAL.NUMERO_OPERACION_PERU.test(val), {
        message: ERROR_MESSAGES.NUMERO_OPERACION_INVALIDO
    }),
    observacion: z.string().optional().nullable().refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    })
});

export type CreateFacturaPagoSchema = z.infer<typeof createFacturaPagoSchema>;
