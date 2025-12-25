import { z } from 'zod';

export const createColaboradorPagoSchema = z.object({
    tipoPagoID: z.number().min(1, 'El tipo de pago es requerido'),
    fechaInico: z.string().min(1, 'La fecha de inicio es requerida'),
    fechaCierre: z.string().min(1, 'La fecha de cierre es requerida'),
    monedaID: z.number().min(1, 'La moneda es requerida'),
    monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    observaciones: z.string().optional()
}).refine((data) => {
    const inicio = new Date(data.fechaInico);
    const fin = new Date(data.fechaCierre);
    return fin >= inicio;
}, {
    message: "La fecha de cierre debe ser posterior o igual a la fecha de inicio",
    path: ["fechaCierre"]
});

export type CreateColaboradorPagoSchema = z.infer<typeof createColaboradorPagoSchema>;
