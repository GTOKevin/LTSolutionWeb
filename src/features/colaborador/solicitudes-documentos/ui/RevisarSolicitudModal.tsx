import { useEffect } from 'react';
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
    FactCheck as FactCheckIcon,
    InsertDriveFileOutlined,
} from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type UseFormSetError } from 'react-hook-form';
import type { ColaboradorDocumentoSolicitud } from '@entities/colaborador-documento/model/types';
import { formatDateLong, formatDateTime } from '@shared/utils/date-utils';
import {
    getReviewSolicitudDocumentoDefaultValues,
    reviewSolicitudDocumentoSchema,
    type ReviewSolicitudDocumentoForm,
    type ReviewSolicitudDocumentoFormInput,
} from '../model/schema';
import type { SolicitudReviewTarget } from '../hooks/useSolicitudesDocumentosPageController';

interface RevisarSolicitudModalProps {
    target: SolicitudReviewTarget | null;
    isProcessing: boolean;
    onClose: () => void;
    onSubmit: (values: ReviewSolicitudDocumentoForm, setError: UseFormSetError<ReviewSolicitudDocumentoForm>) => void;
    onPreviewFile: (solicitud: ColaboradorDocumentoSolicitud) => void;
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

export function RevisarSolicitudModal({ target, isProcessing, onClose, onSubmit, onPreviewFile }: RevisarSolicitudModalProps) {
    const form = useForm<ReviewSolicitudDocumentoFormInput, unknown, ReviewSolicitudDocumentoForm>({
        resolver: zodResolver(reviewSolicitudDocumentoSchema),
        defaultValues: getReviewSolicitudDocumentoDefaultValues(),
    });

    useEffect(() => {
        if (target) {
            form.reset(getReviewSolicitudDocumentoDefaultValues());
        }
    }, [target, form]);

    if (!target) {
        return null;
    }

    const { solicitud, accion } = target;
    const isApprove = accion === 'approve';

    return (
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
                            bgcolor: isApprove ? 'success.50' : 'error.50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isApprove ? 'success.main' : 'error.main',
                        }}
                    >
                        <FactCheckIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                            {isApprove ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Revise los datos propuestos antes de confirmar.
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <ReviewValue label="Colaborador" value={solicitud.colaboradorNombre} />
                        <ReviewValue label="Tipo de Documento" value={solicitud.tipoDocumentoNombre} />
                        <ReviewValue label="Fecha de Solicitud" value={formatDateTime(solicitud.fechaRegistro)} />
                        <ReviewValue label="Motivo" value={solicitud.motivoSolicitud || 'Sin motivo'} />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}>
                            <Typography variant="overline" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                DATOS ACTUALES
                            </Typography>
                            <Stack spacing={1}>
                                <ReviewValue label="Número" value={solicitud.numeroDocumentoActual || '—'} />
                                <ReviewValue label="Emisión" value={solicitud.fechaEmisionActual ? formatDateLong(solicitud.fechaEmisionActual) : '—'} />
                                <ReviewValue label="Vencimiento" value={solicitud.fechaVencimientoActual ? formatDateLong(solicitud.fechaVencimientoActual) : '—'} />
                            </Stack>
                        </Box>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'primary.50' }}>
                            <Typography variant="overline" fontWeight="bold" color="primary.main" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                DATOS PROPUESTOS
                            </Typography>
                            <Stack spacing={1}>
                                <ReviewValue label="Número" value={solicitud.numeroDocumentoPropuesto || '—'} />
                                <ReviewValue label="Emisión" value={solicitud.fechaEmisionPropuesta ? formatDateLong(solicitud.fechaEmisionPropuesta) : '—'} />
                                <ReviewValue label="Vencimiento" value={solicitud.fechaVencimientoPropuesta ? formatDateLong(solicitud.fechaVencimientoPropuesta) : '—'} />
                            </Stack>
                        </Box>
                    </Box>

                    {solicitud.rutaArchivoPropuesta ? (
                        <Box>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<InsertDriveFileOutlined />}
                                onClick={() => onPreviewFile(solicitud)}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                Ver archivo propuesto
                            </Button>
                        </Box>
                    ) : null}

                    <Box>
                        <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                            COMENTARIO DE REVISIÓN
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
                                    helperText={fieldState.error?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                />
                            )}
                        />
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 4, py: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
                <Button onClick={onClose} disabled={isProcessing} sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { bgcolor: 'action.selected' } }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    color={isApprove ? 'success' : 'error'}
                    disabled={isProcessing}
                    onClick={form.handleSubmit((values) => onSubmit(values, form.setError))}
                    endIcon={isApprove ? <CheckCircleOutline /> : <CancelOutlined />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
                >
                    {isProcessing ? 'Procesando...' : isApprove ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
