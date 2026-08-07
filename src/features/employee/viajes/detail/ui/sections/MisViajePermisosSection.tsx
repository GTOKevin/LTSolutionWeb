import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { buildInternalFileUrl } from '@shared/config/env';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import {
    closedEmployeeViajeDocumentPreviewState,
    type EmployeeViajeDocumentPreviewState,
} from '../../model/preview';
import {
    employeeViajeDetailStyles,
    formatEmployeeViajeDateLabel,
    resolveEmployeeViajePermisoStatus,
} from '../../model/view-helpers';
import { DocumentPreviewCard } from '../shared/DocumentPreviewCard';

interface MisViajePermisosSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajePermisosSection({ controller }: MisViajePermisosSectionProps) {
    const [preview, setPreview] = useState<EmployeeViajeDocumentPreviewState>(
        closedEmployeeViajeDocumentPreviewState,
    );

    const handleClosePreview = () => {
        setPreview(closedEmployeeViajeDocumentPreviewState);
    };

    return (
        <>
            <Box sx={{ ...employeeViajeDetailStyles.card }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Permisos y documentos del viaje
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Esta sección es de solo lectura para que el conductor pueda revisar la documentación asociada a su viaje.
                </Typography>

                <Stack spacing={2}>
                    {controller.permisos.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No hay permisos registrados para este viaje.
                        </Typography>
                    ) : (
                        controller.permisos.map((item) => {
                            const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                            const status = resolveEmployeeViajePermisoStatus(item.fechaVencimiento);

                            return (
                                <Box key={item.viajePermisoID} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                                        <Box>
                                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                                                <Box
                                                    sx={{
                                                        px: 1.25,
                                                        py: 0.5,
                                                        borderRadius: '999px',
                                                        bgcolor: `${status.color}.light`,
                                                        color: `${status.color}.dark`,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                    }}
                                                >
                                                    {status.label}
                                                </Box>
                                            </Stack>

                                            <Typography variant="subtitle2" fontWeight="bold">
                                                Permiso #{item.viajePermisoID}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Vigencia: {formatEmployeeViajeDateLabel(item.fechaVigencia)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Vencimiento: {formatEmployeeViajeDateLabel(item.fechaVencimiento)}
                                            </Typography>
                                        </Box>

                                        {archivoUrl ? (
                                            <DocumentPreviewCard
                                                previewUrl={archivoUrl}
                                                alt={`Permiso ${item.viajePermisoID}`}
                                                onPreview={() => {
                                                    setPreview({
                                                        previewUrl: archivoUrl,
                                                        title: `Permiso ${item.viajePermisoID}`,
                                                    });
                                                }}
                                            />
                                        ) : null}
                                    </Stack>
                                </Box>
                            );
                        })
                    )}
                </Stack>
            </Box>

            <DocumentPreviewDialog
                open={!!preview.previewUrl}
                onClose={handleClosePreview}
                previewUrl={preview.previewUrl}
                title={preview.title}
            />
        </>
    );
}
