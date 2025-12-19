import { z } from 'zod';
import { TELEFONO_PERU_REGEX } from '@/shared/constants/constantes';

export const createColaboradorSchema = z.object({
    rolColaboradorID: z.number().min(1, 'El rol es requerido'),
    tipoGeneroID: z.number().min(1, 'El género es requerido'),
    nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    primerApellido: z.string().min(2, 'El primer apellido es requerido'),
    segundoApellido: z.string().optional(),
    direccion: z.string().optional(),
    telefono: z.string().regex(TELEFONO_PERU_REGEX, 'Debe ser un celular válido (9 dígitos)').optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    fechaNacimiento: z.string().optional(),
    fechaIngreso: z.string().optional(),
    monedaID: z.number().optional(),
    salario: z.number().min(0, 'El salario no puede ser negativo').optional(),
    activo: z.boolean().default(true)
});

export type CreateColaboradorSchema = z.infer<typeof createColaboradorSchema>;
