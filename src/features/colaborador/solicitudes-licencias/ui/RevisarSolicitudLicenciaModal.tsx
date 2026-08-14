import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    CancelOutlined,
    CheckCircleOutline,
    EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type UseFormSetError } from 'react-hook-form';
import { formatDateOnly, formatDateTime } from '@shared/utils/date-utils';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { buildInternalFileUrl } from '@/shared/config/env';
import { EvidenceGallery } from '@shared/components/ui/EvidenceGallery';
import {
    getReviewLicenciaDefaultValues,
    reviewLicenciaSchema,
    type ReviewLicenciaForm,
    type ReviewLicenciaFormInput,
} from '../model/schema';
import type { LicenciaReviewTarget } from '../hooks/useSolicitudesLicenciasPageController';

interface RevisarSolicitudLicenciaModalProps {
    target: LicenciaReviewTarget | null;
    isProcessing: boolean;
    onClose: () => void;
    onSubmit: (values: ReviewLicenciaForm, setError: UseFormSetError<ReviewLicenciaForm>) => void;
}

function ReviewValue({ label, value }: { label: string; value: string }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary">
                {value}
            </Typography>
        </Box>
    );
}

export function RevisarSolicitudLicenciaModal({ target, isProcessing, onClose, onSubmit }: RevisarSolicitudLicenciaModalProps) {
    const form = useForm<ReviewLicenciaFormInput, unknown, ReviewLicenciaForm>({
        resolver: zodResolver(reviewLicenciaSchema),
        defaultValues: getReviewLicenciaDefaultValues(),
    });

    const [preview, setPreview] = useState<{
        previewUrl: string | null;
        previewUrls: string[];
        currentIndex: number;
    }>({
        previewUrl: null,
        previewUrls: [],
        currentIndex: 0,
    });

    useEffect(() => {
        if (target) {
            form.reset(getReviewLicenciaDefaultValues());
        }
    }, [target, form]);

    if (!target) {
        return null;
    }

    const { solicitud, accion } = target;
    const isView = accion === 'view';
    const isApprove = accion === 'approve';

    const rutasFoto = solicitud.rutasFoto ?? [];
    const previewUrls = rutasFoto
        .map((ruta) => buildInternalFileUrl(ruta))
        .filter((url): url is string => Boolean(url));

    const handleConfirm = () => {
        void form.handleSubmit((values) => {
            if (!isApprove && !values.comentarioRevision?.trim()) {
                form.setError('comentarioRevision', {
                    type: 'required',
                    message: 'El motivo de rechazo es obligatorio.',
                });
                return;
            }
            onSubmit(values, form.setError);
        })();
    };

    return (
        <>
            <Dialog
                open={Boolean(target)}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: isView ? 'info.50' : isApprove ? 'success.50' : 'error.50',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isView ? 'info.main' : isApprove ? 'success.main' : 'error.main',
                            }}
                        >
                            <EventNoteIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                                {isView ? 'Detalle de Solicitud' : isApprove ? 'Aprobar Licencia' : 'Rechazar Licencia'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isView
                                    ? 'Solicitud resuelta. Revisa la información y los adjuntos.'
                                    : 'Revise los datos de la solicitud antes de confirmar.'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            <ReviewValue label="Colaborador" value={solicitud.colaboradorNombre} />
                            <ReviewValue label="Tipo de Licencia" value={solicitud.tipoLicenciaNombre} />
                            <ReviewValue label="Fecha Inicial" value={formatDateOnly(solicitud.fechaInicial)} />
                            <ReviewValue label="Fecha Final" value={solicitud.fechaFinal ? formatDateOnly(solicitud.fechaFinal) : '—'} />
                            <ReviewValue label="Fecha de Solicitud" value={formatDateTime(solicitud.fechaRegistro)} />
                            {isView ? (
                                <ReviewValue
                                    label="Estado"
                                    value={solicitud.estadoRevision.charAt(0).toUpperCase() + solicitud.estadoRevision.slice(1)}
                                />
                            ) : null}
                        </Box>

                        <Box
                            sx={{
                                bgcolor: 'action.hover',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                px: 1.75,
                                py: 1.5,
                            }}
                        >
                            <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Descripción / Motivo
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {solicitud.descripcion || 'Sin descripción'}
                            </Typography>
                        </Box>

                        {previewUrls.length > 0 ? (
                            <EvidenceGallery
                                items={previewUrls.map((url, index) => ({
                                    url,
                                    alt: `Adjunto ${index + 1}`,
                                }))}
                                onPreview={(index) => {
                                    setPreview({
                                        previewUrl: previewUrls[index] ?? previewUrls[0] ?? null,
                                        previewUrls,
                                        currentIndex: index,
                                    });
                                }}
                            />
                        ) : null}

                                                {isView ? (
                            <Box
                                sx={{
                                    bgcolor: 'action.hover',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    px: 1.75,
                                    py: 1.5,
                                }}
                            >
                                <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Resolución
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {solicitud.fechaAceptacion
                                        ? `Resuelta el ${formatDateTime(solicitud.fechaAceptacion)}`
                                        : 'Sin fecha de resolución'}
                                </Typography>
                                {solicitud.comentarioRevision ? (
                                    <>
                                        <Typography
                                            variant="caption"
                                            fontWeight={600}
                                            color="text.primary"
                                            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mt: 1.5 }}
                                        >
                                            Comentario del revisor
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {solicitud.comentarioRevision}
                                        </Typography>
                                    </>
                                ) : null}
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                    {isApprove ? 'COMENTARIO (OPCIONAL)' : 'MOTIVO DE RECHAZO *'}
                                </Typography>
                                <Controller
                                    control={form.control}
                                    name="comentarioRevision"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            placeholder={isApprove ? 'Comentario opcional para la aprobación...' : 'Indique el motivo del rechazo...'}
                                            error={Boolean(fieldState.error)}
                                            helperText={fieldState.error?.message ?? (isApprove ? 'Opcional.' : 'Obligatorio para registrar el rechazo.')}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                        />
                                    )}
                                />
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 4, py: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
                    {isView ? (
                        <Button
                            variant="contained"
                            onClick={onClose}
                            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
                        >
                            Cerrar
                        </Button>
                    ) : (
                        <>
                            <Button onClick={onClose} disabled={isProcessing} sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { bgcolor: 'action.selected' } }}>
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                color={isApprove ? 'success' : 'error'}
                                disabled={isProcessing}
                                onClick={handleConfirm}
                                endIcon={isApprove ? <CheckCircleOutline /> : <CancelOutlined />}
                                sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
                            >
                                {isProcessing ? 'Procesando...' : isApprove ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <DocumentPreviewDialog
                open={!!preview.previewUrl}
                onClose={() => setPreview({ previewUrl: null, previewUrls: [], currentIndex: 0 })}
                previewUrl={preview.previewUrl}
                previewUrls={preview.previewUrls}
                initialIndex={preview.currentIndex}
                title="Adjuntos de la solicitud"
            />
        </>
    );
}
