import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';

const mantenimientoSchemaBase = z.object({
    flotaID: z.coerce.number().min(1, 'Vehículo es requerido'),
    tipoServicioID: z.coerce.number().min(1, 'Tipo de Servicio es requerido'),
    fechaIngreso: z.string().min(1, 'Fecha de Ingreso es requerida'),
    fechaSalida: z.string().optional().nullable(),
    motivoIngreso: z.string()
        .min(1, 'Motivo de Ingreso es requerido')
        .max(500, 'Máximo 500 caracteres')
        .refine(val => INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
            message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
        }),
    diagnosticoMecanico: z.string().optional().nullable().refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    }),
    solucion: z.string().optional().nullable().refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    }),
    kmIngreso: z.coerce.number().min(0, 'Kilometraje inválido'),
    kmSalida: z.coerce.number().optional().nullable(),
    estadoID: z.coerce.number().min(1, 'Estado es requerido')
});

export const createMantenimientoSchema = (completedEstadoId?: number | null) => mantenimientoSchemaBase.superRefine((data, ctx) => {
    if (!completedEstadoId || data.estadoID !== completedEstadoId) {
        return;
    }

    if (!data.fechaSalida) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['fechaSalida'],
            message: 'Fecha de Salida es requerida para finalizar',
        });
    }

    if (!data.kmSalida || data.kmSalida <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['kmSalida'],
            message: 'Km Salida es requerido para finalizar',
        });
    }

    if (!data.diagnosticoMecanico?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['diagnosticoMecanico'],
            message: 'Diagnóstico es requerido para finalizar',
        });
    }

    if (!data.solucion?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['solucion'],
            message: 'Solución es requerida para finalizar',
        });
    }
});

export type CreateMantenimientoSchema = z.infer<typeof mantenimientoSchemaBase>;
export type CreateMantenimientoFormInput = z.input<typeof mantenimientoSchemaBase>;

export const createMantenimientoDetalleSchema = z.object({
    tipoProductoID: z.coerce.number().min(1, 'Tipo de Producto es requerido'),
    descripcion: z.string().optional().nullable().refine(val => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
        message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL
    }),
    cantidad: z.coerce.number().min(1, 'Cantidad debe ser mayor a 0'),
    monedaID: z.coerce.number().min(1, 'Moneda es requerida'),
    costo: z.coerce.number().min(0, 'Costo no puede ser negativo'),
    igv: z.boolean().default(true),
    subTotal: z.coerce.number(),
    montoIGV: z.coerce.number(),
    total: z.coerce.number()
});

export type CreateMantenimientoDetalleSchema = z.infer<typeof createMantenimientoDetalleSchema>;
export type CreateMantenimientoDetalleFormInput = z.input<typeof createMantenimientoDetalleSchema>;
