import { z } from 'zod';

export const viajeSchema = z.object({
    clienteID: z.number().min(1, 'El cliente es requerido'),
    tractoID: z.number().min(1, 'El tracto es requerido'),
    colaboradorID: z.number().min(1, 'El conductor es requerido'),
    origenID: z.number().min(1, 'El origen es requerido'),
    destinoID: z.number().min(1, 'El destino es requerido'),
    fechaCarga: z.string().min(1, 'La fecha de carga es requerida'),
    tipoMedidaID: z.number().min(1, 'El tipo de medida es requerido'),
    tipoPesoID: z.number().min(1, 'El tipo de peso es requerido'),
    
    // Optional fields need to be handled if they are part of the form but not required
    cotizacionID: z.number().optional(),
    carretaID: z.number().optional(),
    direccionOrigen: z.string().optional(),
    direccionDestino: z.string().optional(),
    fechaPartida: z.string().optional(),
    fechaLlegada: z.string().optional(),
    fechaDescarga: z.string().optional(),
    fechaLlegadaBase: z.string().optional(),
    kmInicio: z.number().optional(),
    kmLlegada: z.number().optional(),
    kmLlegadaBase: z.number().optional(),
    estadoID: z.number().default(1),
    requiereEscolta: z.boolean().optional().default(false),
    requierePermiso: z.boolean().optional().default(false),
    largo: z.number().optional(),
    alto: z.number().optional(),
    ancho: z.number().optional(),
    peso: z.number().optional(),

    // Arrays
    viajeMercaderia: z.array(z.any()).optional().default([]),
    viajeGastos: z.array(z.any()).optional().default([]),
    viajeGuia: z.array(z.any()).optional().default([]),
    viajeIncidentes: z.array(z.any()).optional().default([]),
    viajePermisos: z.array(z.any()).optional().default([]),
    viajeEscolta: z.array(z.any()).optional().default([])
});

export type ViajeFormData = z.infer<typeof viajeSchema>;
