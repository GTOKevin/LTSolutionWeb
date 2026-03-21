import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';

export const createColaboradorSchema = z.object({
    rolColaboradorID: z.number().min(1, 'El rol es requerido'),
    tipoGeneroID: z.number().min(1, 'El género es requerido'),
    nombres: z.string().regex(INPUT_VAL.LETRAS_ESPACIO, ERROR_MESSAGES.LETRAS_ESPACIO).min(2, 'El nombre debe tener al menos 2 caracteres'),
    primerApellido: z.string().regex(INPUT_VAL.LETRAS_ESPACIO, ERROR_MESSAGES.LETRAS_ESPACIO).min(2, 'El primer apellido es requerido'),
    segundoApellido: z.string().regex(INPUT_VAL.LETRAS_ESPACIO, ERROR_MESSAGES.LETRAS_ESPACIO).optional(),
    direccion: z.string().regex(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL).optional(),
    telefono: z.string().regex(INPUT_VAL.TELEFONO_PERU_REGEX, ERROR_MESSAGES.TELEFONO_PERU).optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    fechaNacimiento: z.string().optional(),
    fechaIngreso: z.string().optional(),
    monedaID: z.number().optional(),
    salario: z.number().min(0, 'El salario no puede ser negativo').optional(),
    activo: z.boolean().default(true)
});

export type CreateColaboradorSchema = z.infer<typeof createColaboradorSchema>;
