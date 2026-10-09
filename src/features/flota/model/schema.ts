import { z } from 'zod';
import { INPUT_VAL, ERROR_MESSAGES } from '@/shared/constants/constantes';
import type { Flota, FlotaDocumento } from '@entities/flota/model/types';
import { CONFIG_EJES_APLICA } from '@entities/flota/model/constants';

const currentYear = new Date().getFullYear();

const optionalSafeText = (maxLength: number) =>
    z
        .string()
        .max(maxLength, `Máximo ${maxLength} caracteres`)
        .optional()
        .refine((val) => !val || INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(val), {
            message: ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL,
        });

const optionalDecimal = () =>
    z.coerce.number().optional().refine((val) => !val || INPUT_VAL.DECIMAL_10_2_REGEX.test(val.toString()), {
        message: ERROR_MESSAGES.DECIMAL_10_2,
    });

export const createFlotaSchema = z
    .object({
        tipoFlota: z.coerce.number().min(1, 'Tipo de Flota es requerido'),
        vin: optionalSafeText(25),
        homologacionMtc: optionalSafeText(50),
        // Solo aplica a los tipos con configuración de ejes (ver `CONFIG_EJES_APLICA`).
        configuracionEjesID: z.preprocess(
            (val) => (val === '' || val === null || val === undefined || val === 0 ? null : Number(val)),
            z.number().nullable(),
        ),
        marca: optionalSafeText(100),
        modelo: optionalSafeText(100),
        placa: z
            .string()
            .min(1, 'Placa es requerida')
            .transform((val) => val.toUpperCase())
            .refine((val) => INPUT_VAL.PLACA_PERU_REGEX.test(val), {
                message: ERROR_MESSAGES.PLACA_INVALIDA,
            }),
        anio: z.coerce.number().min(1900, 'Año inválido').max(currentYear + 1, 'Año inválido'),
        color: optionalSafeText(50),
        ejes: z.coerce.number().min(0, 'Ejes no puede ser negativo'),
        tipoPesoID: z.coerce.number().min(1, 'Tipo de Peso es requerido'),
        pesoBruto: optionalDecimal(),
        pesoNeto: optionalDecimal(),
        cargaUtil: optionalDecimal(),
        tipoMedidaID: z.coerce.number().min(1, 'Tipo de Medida es requerido'),
        largo: optionalDecimal(),
        alto: optionalDecimal(),
        ancho: optionalDecimal(),
        camaUtil: optionalDecimal(),
        tipoCombustibleID: z.coerce.number().min(1, 'Tipo de Combustible es requerido'),
        activo: z.boolean().default(true),
    })
    .superRefine((data, ctx) => {
        // Configuración de ejes obligatoria solo para los tipos que la aplican.
        if (CONFIG_EJES_APLICA.includes(data.tipoFlota) && !data.configuracionEjesID) {
            ctx.addIssue({
                code: 'custom',
                path: ['configuracionEjesID'],
                message: 'La configuración de ejes es requerida para Tracto',
            });
        }
    });

export type CreateFlotaSchema = z.infer<typeof createFlotaSchema>;
export type CreateFlotaInput = z.input<typeof createFlotaSchema>;

export const createFlotaDocumentoSchema = z.object({
    tipoDocumentoID: z.coerce.number().min(1, 'Tipo de Documento es requerido'),
    numeroDocumento: z.string().min(1, 'Número de Documento es requerido'),
    entidadEmisora: optionalSafeText(100),
    rutaArchivo: z.string().optional(),
    fechaEmision: z.string().min(1, 'Fecha de Emisión es requerida'),
    fechaVencimiento: z.string().min(1, 'Fecha de Vencimiento es requerida'),
    activo: z.boolean().default(true),
});

export type CreateFlotaDocumentoSchema = z.infer<typeof createFlotaDocumentoSchema>;

/** Valores por defecto del formulario de flota (fuera del componente UI). */
export const FLOTA_FORM_DEFAULTS: CreateFlotaInput = {
    tipoFlota: 0,
    vin: '',
    homologacionMtc: '',
    configuracionEjesID: null,
    marca: '',
    modelo: '',
    placa: '',
    anio: currentYear,
    color: '',
    ejes: 0,
    tipoPesoID: 0,
    pesoBruto: 0,
    pesoNeto: 0,
    cargaUtil: 0,
    tipoMedidaID: 0,
    largo: 0,
    alto: 0,
    ancho: 0,
    camaUtil: 0,
    tipoCombustibleID: 0,
    activo: true,
};

export const FLOTA_DOCUMENTO_FORM_DEFAULTS: CreateFlotaDocumentoSchema = {
    tipoDocumentoID: 0,
    numeroDocumento: '',
    entidadEmisora: '',
    rutaArchivo: '',
    fechaEmision: '',
    fechaVencimiento: '',
    activo: true,
};

/** Mapea una flota del backend a los valores del formulario. */
export function mapFlotaToFormValues(flota: Flota): CreateFlotaInput {
    return {
        tipoFlota: flota.tipoFlota,
        vin: flota.vin ?? '',
        homologacionMtc: flota.homologacionMtc ?? '',
        configuracionEjesID: flota.configuracionEjesID ?? null,
        marca: flota.marca ?? '',
        modelo: flota.modelo ?? '',
        placa: flota.placa,
        anio: flota.anio,
        color: flota.color ?? '',
        ejes: flota.ejes,
        tipoPesoID: flota.tipoPesoID,
        pesoBruto: flota.pesoBruto ?? 0,
        pesoNeto: flota.pesoNeto ?? 0,
        cargaUtil: flota.cargaUtil ?? 0,
        tipoMedidaID: flota.tipoMedidaID,
        largo: flota.largo ?? 0,
        alto: flota.alto ?? 0,
        ancho: flota.ancho ?? 0,
        camaUtil: flota.camaUtil ?? 0,
        tipoCombustibleID: flota.tipoCombustibleID,
        activo: flota.estado,
    };
}

/** Mapea un documento de flota del backend a los valores del formulario. */
export function mapFlotaDocumentoToFormValues(doc: FlotaDocumento): CreateFlotaDocumentoSchema {
    return {
        tipoDocumentoID: doc.tipoDocumentoID,
        numeroDocumento: doc.numeroDocumento,
        entidadEmisora: doc.entidadEmisora ?? '',
        rutaArchivo: doc.rutaArchivo ?? '',
        fechaEmision: doc.fechaEmision,
        fechaVencimiento: doc.fechaVencimiento,
        activo: doc.estado,
    };
}
