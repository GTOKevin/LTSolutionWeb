import { z } from 'zod';
import { TEXTO_SEGURO_REGEX } from '@/shared/constants/constantes';

export const createMantenimientoSchema = z.object({
    flotaID: z.coerce.number().min(1, 'Vehículo es requerido'),
    tipoServicioID: z.coerce.number().min(1, 'Tipo de Servicio es requerido'),
    fechaIngreso: z.string().min(1, 'Fecha de Ingreso es requerida'),
    fechaSalida: z.string().optional().nullable(),
    motivoIngreso: z.string()
        .min(1, 'Motivo de Ingreso es requerido')
        .max(500, 'Máximo 500 caracteres')
        .refine(val => TEXTO_SEGURO_REGEX.test(val), {
            message: 'Caracteres no permitidos'
        }),
    diagnosticoMecanico: z.string().optional().nullable().refine(val => !val || TEXTO_SEGURO_REGEX.test(val), {
        message: 'Caracteres no permitidos'
    }),
    solucion: z.string().optional().nullable().refine(val => !val || TEXTO_SEGURO_REGEX.test(val), {
        message: 'Caracteres no permitidos'
    }),
    kmIngreso: z.coerce.number().min(0, 'Kilometraje inválido'),
    kmSalida: z.coerce.number().optional().nullable(),
    estadoID: z.coerce.number().min(1, 'Estado es requerido')
}).superRefine((data, ctx) => {
    if (data.estadoID === 102) { // Completado/Finalizado
        if (!data.fechaSalida) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Fecha de Salida es requerida para finalizar",
                path: ["fechaSalida"]
            });
        }
        if (!data.kmSalida || data.kmSalida <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Km Salida es requerido para finalizar",
                path: ["kmSalida"]
            });
        }
        if (!data.diagnosticoMecanico) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Diagnóstico es requerido para finalizar",
                path: ["diagnosticoMecanico"]
            });
        }
        if (!data.solucion) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Solución es requerida para finalizar",
                path: ["solucion"]
            });
        }
    }
});

export type CreateMantenimientoSchema = z.infer<typeof createMantenimientoSchema>;

export const createMantenimientoDetalleSchema = z.object({
    tipoProductoID: z.coerce.number().min(1, 'Tipo de Producto es requerido'),
    descripcion: z.string().optional().nullable().refine(val => !val || TEXTO_SEGURO_REGEX.test(val), {
        message: 'Caracteres no permitidos'
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
