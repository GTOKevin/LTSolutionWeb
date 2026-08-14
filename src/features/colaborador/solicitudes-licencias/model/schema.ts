import { z } from 'zod';

export const reviewLicenciaSchema = z.object({
    comentarioRevision: z.string().max(500, 'El comentario no puede exceder 500 caracteres.').optional(),
});

export type ReviewLicenciaForm = z.infer<typeof reviewLicenciaSchema>;
export type ReviewLicenciaFormInput = z.input<typeof reviewLicenciaSchema>;

export function getReviewLicenciaDefaultValues(): ReviewLicenciaFormInput {
    return {
        comentarioRevision: '',
    };
}
