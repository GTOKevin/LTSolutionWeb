import { z } from 'zod';
import { TELEFONO_PERU_REGEX } from '@/shared/constants/constantes';

export const createClienteSchema = z.object({
    ruc: z.string().min(11, 'RUC debe tener 11 dígitos').max(11, 'RUC debe tener 11 dígitos'),
    razonSocial: z.string().min(1, 'Razón Social es requerida'),
    direccionLegal: z.string().optional(),
    direccionFiscal: z.string().optional(),
    contactoPrincipal: z.string().min(1, 'Contacto Principal es requerido'),
    telefono: z.string().regex(TELEFONO_PERU_REGEX, 'Debe ser un celular válido (9 dígitos)').optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    activo: z.boolean(),
});

export type CreateClienteSchema = z.infer<typeof createClienteSchema>;

export const createContactoSchema = z.object({
    nombreCompleto: z.string().min(1, 'Nombre es requerido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefonoPrincipal: z.string().min(1, 'Teléfono Principal es requerido'),
    telefonoSecundario: z.string().optional(),
    rol: z.string().optional(),
    activo: z.boolean(),
});

export type CreateContactoSchema = z.infer<typeof createContactoSchema>;
