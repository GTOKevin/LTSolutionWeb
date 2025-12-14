import { z } from 'zod';

export const createClienteSchema = z.object({
    ruc: z.string().min(11, 'RUC debe tener 11 dígitos').max(11, 'RUC debe tener 11 dígitos'),
    razonSocial: z.string().min(1, 'Razón Social es requerida'),
    direccionLegal: z.string().optional(),
    direccionFiscal: z.string().optional(),
    contactoPrincipal: z.string().min(1, 'Contacto Principal es requerido'),
    telefono: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    activo: z.boolean().default(true),
});

export type CreateClienteSchema = z.infer<typeof createClienteSchema>;

export const createContactoSchema = z.object({
    nombreCompleto: z.string().min(1, 'Nombre es requerido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefonoPrincipal: z.string().min(1, 'Teléfono Principal es requerido'),
    telefonoSecundario: z.string().optional(),
    rol: z.string().optional(),
    activo: z.boolean().default(true),
});

export type CreateContactoSchema = z.infer<typeof createContactoSchema>;
