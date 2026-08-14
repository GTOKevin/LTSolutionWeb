import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { EventNote as EventNoteIcon } from '@mui/icons-material';
import { formatDateOnly } from '@shared/utils/date-utils';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { buildInternalFileUrl } from '@/shared/config/env';
import { EvidenceGallery } from '@shared/components/ui/EvidenceGallery';
import type { MiLicenciaDto } from '@entities/employee/model/types';

interface MisLicenciasDetailModalProps {
    target: MiLicenciaDto | null;
    onClose: () => void;
}

function DetailValue({ label, value }: { label: string; value: string }) {
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

export function MisLicenciasDetailModal({ target, onClose }: MisLicenciasDetailModalProps) {
    const [preview, setPreview] = useState<{
        previewUrl: string | null;
        previewUrls: string[];
        currentIndex: number;
    }>({
        previewUrl: null,
        previewUrls: [],
        currentIndex: 0,
    });

    if (!target) {
        return null;
    }

    const isApproved = target.estadoRevision === 'aprobada';
    const statusColor = isApproved ? 'success' : 'error';
    const rutasFoto = target.rutasFoto ?? [];
    const previewUrls = rutasFoto
        .map((ruta) => buildInternalFileUrl(ruta))
        .filter((url): url is string => Boolean(url));
    const periodo = `${formatDateOnly(target.fechaInicial)}${target.fechaFinal ? ` al ${formatDateOnly(target.fechaFinal)}` : ''}`;

    return (
        <>
            <Dialog
                open={Boolean(target)}
                onClose={onClose}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: 'info.50',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'info.main',
                            }}
                        >
                            <EventNoteIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                                Detalle de Licencia
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Solicitud resuelta. Revisa la información y los adjuntos.
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            <DetailValue label="Tipo de licencia" value={target.tipoLicenciaNombre} />
                            <DetailValue label="Periodo" value={periodo} />
                        </Box>

                        <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: 99, bgcolor: `${statusColor}.50`, color: `${statusColor}.dark`, border: '1px solid', borderColor: `${statusColor}.200`, alignSelf: 'flex-start' }}>
                            <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '11px' }}>
                                {isApproved ? 'Aprobada' : 'Rechazada'}
                            </Typography>
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
                                {target.descripcion || 'Sin descripción'}
                            </Typography>
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
                                Resolución
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {target.fechaAceptacion
                                    ? `Resuelta el ${formatDateOnly(target.fechaAceptacion)}`
                                    : 'Sin fecha de resolución'}
                            </Typography>
                            {target.comentarioRevision ? (
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
                                        {target.comentarioRevision}
                                    </Typography>
                                </>
                            ) : null}
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
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 4, py: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <DocumentPreviewDialog
                open={!!preview.previewUrl}
                onClose={() => setPreview({ previewUrl: null, previewUrls: [], currentIndex: 0 })}
                previewUrl={preview.previewUrl}
                previewUrls={preview.previewUrls}
                initialIndex={preview.currentIndex}
                title="Adjuntos de la licencia"
            />
        </>
    );
}