import { z } from 'zod';

const nullableNumber = z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    return Number(value);
}, z.number().min(0, 'El valor no puede ser negativo').nullable());

export const updateMisViajesKmsSchema = z.object({
    kmInicio: nullableNumber,
    kmLlegada: nullableNumber,
    kmLlegadaBase: nullableNumber,
});

export type UpdateMisViajesKmsForm = z.infer<typeof updateMisViajesKmsSchema>;
export type UpdateMisViajesKmsFormInput = z.input<typeof updateMisViajesKmsSchema>;

export function getUpdateMisViajesKmsDefaultValues(
    values?: Partial<UpdateMisViajesKmsForm>,
): UpdateMisViajesKmsFormInput {
    return {
        kmInicio: values?.kmInicio ?? null,
        kmLlegada: values?.kmLlegada ?? null,
        kmLlegadaBase: values?.kmLlegadaBase ?? null,
    };
}
