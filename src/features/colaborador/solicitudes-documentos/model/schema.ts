import { z } from 'zod';

export const reviewSolicitudDocumentoSchema = z.object({
    comentarioRevision: z.string().max(500, 'El comentario no puede exceder 500 caracteres.').optional(),
});

export type ReviewSolicitudDocumentoForm = z.infer<typeof reviewSolicitudDocumentoSchema>;
export type ReviewSolicitudDocumentoFormInput = z.input<typeof reviewSolicitudDocumentoSchema>;

export function getReviewSolicitudDocumentoDefaultValues(): ReviewSolicitudDocumentoFormInput {
    return {
        comentarioRevision: '',
    };
}
