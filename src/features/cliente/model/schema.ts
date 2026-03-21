import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';

export const createClienteSchema = z.object({
    ruc: z.string().min(11, 'RUC debe tener 11 dígitos').max(11, 'RUC debe tener 11 dígitos'),
    razonSocial: z.string().regex(INPUT_VAL.TEXTO_SEGURO_REGEX, ERROR_MESSAGES.TEXTO_SEGURO).min(1, 'Razón Social es requerida'),
    direccionLegal: z.string().regex(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL).optional(),
    direccionFiscal: z.string().regex(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL).optional(),
    contactoPrincipal: z.string().regex(INPUT_VAL.LETRAS_ESPACIO, ERROR_MESSAGES.LETRAS_ESPACIO).min(1, 'Contacto Principal es requerido'),
    telefono: z.string().regex(INPUT_VAL.TELEFONO_PERU_REGEX, 'Debe ser un celular válido (9 dígitos)').optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    activo: z.boolean(),
});

export type CreateClienteSchema = z.infer<typeof createClienteSchema>;

export const createContactoSchema = z.object({
    nombreCompleto: z.string().regex(INPUT_VAL.LETRAS_ESPACIO, ERROR_MESSAGES.LETRAS_ESPACIO).min(1, 'Nombre es requerido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefonoPrincipal: z.string().regex(INPUT_VAL.TELEFONO_PERU_REGEX, ERROR_MESSAGES.TELEFONO_PERU).min(1, 'Teléfono Principal es requerido'),
    telefonoSecundario: z.string().regex(INPUT_VAL.TELEFONO_PERU_REGEX, ERROR_MESSAGES.TELEFONO_PERU).optional().or(z.literal('')),
    rol: z.string().regex(INPUT_VAL.LETRAS_ESPACIO, ERROR_MESSAGES.LETRAS_ESPACIO).optional().or(z.literal('')),
    activo: z.boolean(),
});

export type CreateContactoSchema = z.infer<typeof createContactoSchema>;
