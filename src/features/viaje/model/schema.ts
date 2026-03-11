import { z } from 'zod';

export const viajeEscoltaSchema = z.object({
    tercero: z.boolean().optional(),
    flotaID: z.number().optional(),
    colaboradorID: z.number().optional(),
    nombreConductor: z.string().optional(),
    empresa: z.string().optional()
}).refine((data) => {
    if (data.tercero) {
        return !!data.nombreConductor?.trim() && !!data.empresa?.trim();
    } else {
        return !!data.flotaID && !!data.colaboradorID;
    }
}, {
    message: "Complete los campos requeridos según el tipo de escolta",
    path: ["root"] 
});

export const viajeGastoSchema = z.object({
    gastoID: z.number().min(1, 'El tipo de gasto es requerido'),
    fechaGasto: z.string().min(1, 'La fecha es requerida'),
    monedaID: z.number().min(1, 'La moneda es requerida'),
    monto: z.number().min(0.5, 'El monto mínimo es 0.50'),
    comprobante: z.boolean(),
    numeroComprobante: z.string().optional(),
    descripcion: z.string().regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-_]*$/, 'Caracteres inválidos').optional()
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
    descripcion: z.string().min(1, 'Requerido').regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-_]+$/, 'Caracteres inválidos'),
    ubigeoID: z.number().min(1, 'La ubicación es requerida'),
    lugar: z.string().min(1, 'Requerido').regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-_]+$/, 'Caracteres inválidos'),
    rutaFoto: z.string().min(1, 'La foto es requerida')
});

export const viajeMercaderiaSchema = z.object({
    mercaderiaID: z.number(),
    descripcion: z.string().regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-_\/()[\]]*$/, 'Caracteres inválidos (Solo letras, números y ,._-/()[] )').optional(),
    tipoMedidaID: z.number().min(1, 'El tipo de medida es requerido'),
    alto: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
    largo: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
    ancho: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
    tipoPesoID: z.number().min(1, 'El tipo de peso es requerido'),
    peso: z.number().min(0, 'Debe ser mayor o igual a 0').optional()
}).refine((data) => {
    if (data.mercaderiaID === 0) {
        return !!data.descripcion?.trim();
    }
    return true;
}, {
    message: "Si no selecciona mercadería, la descripción es requerida",
    path: ["descripcion"]
});

export const viajePermisoSchema = z.object({
    fechaVigencia: z.string().min(1, 'La fecha de vigencia es requerida'),
    fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
    rutaArchivo: z.string().min(1, 'El archivo es requerido')
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
    
    // Optional fields need to be handled if they are part of the form but not required
    cotizacionID: z.number().optional(),
    carretaID: z.number().optional(),
    direccionOrigen: z.string().regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-_\/()[\]]*$/, 'Caracteres inválidos (Solo letras, números y ,._-/()[] )').optional(),
    direccionDestino: z.string().regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-_\/()[\]]*$/, 'Caracteres inválidos (Solo letras, números y ,._-/()[] )').optional(),
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
export type ViajeEscoltaFormData = z.infer<typeof viajeEscoltaSchema>;
export type ViajeGastoFormData = z.infer<typeof viajeGastoSchema>;
export type ViajeGuiaFormData = z.infer<typeof viajeGuiaSchema>;
export type ViajeIncidenteFormData = z.infer<typeof viajeIncidenteSchema>;
export type ViajeMercaderiaFormData = z.infer<typeof viajeMercaderiaSchema>;
export type ViajePermisoFormData = z.infer<typeof viajePermisoSchema>;
