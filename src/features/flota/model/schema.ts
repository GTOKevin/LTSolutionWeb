import { z } from 'zod';
import { TIPOS_COMBUSTIBLE, PLACA_PERU_REGEX, TEXTO_SEGURO_REGEX, DECIMAL_10_2_REGEX } from '@/shared/constants/constantes';

export const createFlotaSchema = z.object({
    tipoFlota: z.coerce.number().min(1, 'Tipo de Flota es requerido'),
    marca: z.string().optional(),
    modelo: z.string().optional().refine(val => !val || TEXTO_SEGURO_REGEX.test(val), {
        message: 'Caracteres no permitidos (solo letras, números, - _ . ,)'
    }),
    placa: z.string()
        .min(1, 'Placa es requerida')
        .transform(val => val.toUpperCase())
        .refine(val => PLACA_PERU_REGEX.test(val), {
            message: 'Formato inválido (Ej: ABC-123)'
        }),
    anio: z.coerce.number().min(1900, 'Año inválido').max(new Date().getFullYear() + 1, 'Año inválido'),
    color: z.string().optional().refine(val => !val || TEXTO_SEGURO_REGEX.test(val), {
        message: 'Caracteres no permitidos (solo letras, números, - _ . ,)'
    }),
    ejes: z.coerce.number().min(0, 'Ejes no puede ser negativo'),
    tipoPesoID: z.coerce.number().min(1, 'Tipo de Peso es requerido'),
    pesoBruto: z.coerce.number().optional().refine(val => !val || DECIMAL_10_2_REGEX.test(val.toString()), {
        message: 'Formato inválido (Máx 2 decimales)'
    }),
    pesoNeto: z.coerce.number().optional().refine(val => !val || DECIMAL_10_2_REGEX.test(val.toString()), {
        message: 'Formato inválido (Máx 2 decimales)'
    }),
    cargaUtil: z.coerce.number().optional().refine(val => !val || DECIMAL_10_2_REGEX.test(val.toString()), {
        message: 'Formato inválido (Máx 2 decimales)'
    }),
    tipoMedidaID: z.coerce.number().min(1, 'Tipo de Medida es requerido'),
    largo: z.coerce.number().optional().refine(val => !val || DECIMAL_10_2_REGEX.test(val.toString()), {
        message: 'Formato inválido (Máx 2 decimales)'
    }),
    alto: z.coerce.number().optional().refine(val => !val || DECIMAL_10_2_REGEX.test(val.toString()), {
        message: 'Formato inválido (Máx 2 decimales)'
    }),
    ancho: z.coerce.number().optional().refine(val => !val || DECIMAL_10_2_REGEX.test(val.toString()), {
        message: 'Formato inválido (Máx 2 decimales)'
    }),
    tipoCombustible: z.string()
        .min(1, 'Tipo de Combustible es requerido')
        .refine(val => TIPOS_COMBUSTIBLE.some(c => c.value === val), {
            message: 'Seleccione un tipo de combustible válido'
        }),
    activo: z.boolean().default(true),
});

export type CreateFlotaSchema = z.infer<typeof createFlotaSchema>;

export const createFlotaDocumentoSchema = z.object({
    tipoDocumentoID: z.coerce.number().min(1, 'Tipo de Documento es requerido'),
    numeroDocumento: z.string().min(1, 'Número de Documento es requerido'),
    rutaArchivo: z.string().optional(),
    fechaEmision: z.string().min(1, 'Fecha de Emisión es requerida'),
    fechaVencimiento: z.string().min(1, 'Fecha de Vencimiento es requerida'),
    activo: z.boolean().default(true),
});

export type CreateFlotaDocumentoSchema = z.infer<typeof createFlotaDocumentoSchema>;
