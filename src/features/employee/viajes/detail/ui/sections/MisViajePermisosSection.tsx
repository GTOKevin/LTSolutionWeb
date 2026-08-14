import { AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon } from '@mui/icons-material';
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
import { DetailSectionHeader } from '../shared/DetailSectionHeader';
import { DocumentPreviewCard } from '../shared/DocumentPreviewCard';
import { EmptyStateCard } from '../shared/EmptyStateCard';
import { OperationalStatusBadge } from '../shared/OperationalStatusBadge';

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
                <DetailSectionHeader
                    eyebrow="Consulta"
                    title="Permisos y documentos del viaje"
                    description="Sección de solo lectura para revisar vigencia y documentos operativos asociados al viaje."
                    aside={<OperationalStatusBadge label={`${controller.permisos.length} visibles`} tone="info" />}
                />

                <Stack spacing={2}>
                    {controller.permisos.length === 0 ? (
                        <EmptyStateCard
                            icon={<AssignmentTurnedInOutlinedIcon fontSize="large" />}
                            title="No hay permisos asociados"
                            description="Cuando el viaje tenga permisos o documentos visibles para el conductor, se mostrarán en este bloque."
                        />
                    ) : (
                        controller.permisos.map((item) => {
                            const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                            const status = resolveEmployeeViajePermisoStatus(item.fechaVencimiento);

                            return (
                                <Box key={item.viajePermisoID} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                                        <Box>
                                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                                                <OperationalStatusBadge label={status.label} tone={status.color} />
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
                                                        previewUrls: [archivoUrl],
                                                        currentIndex: 0,
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
                previewUrls={preview.previewUrls}
                initialIndex={preview.currentIndex}
                title={preview.title}
            />
        </>
    );
}
