import { DescriptionOutlined as DescriptionOutlinedIcon } from '@mui/icons-material';
import { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { buildInternalFileUrl } from '@shared/config/env';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import {
    buildCreateMisViajeGuiaPayload,
    getCreateMisViajeGuiaDefaultValues,
    type EmployeeViajeGuiaFormValues,
} from '../../model/forms';
import {
    closedEmployeeViajeDocumentPreviewState,
    type EmployeeViajeDocumentPreviewState,
} from '../../model/preview';
import { employeeViajeDetailStyles } from '../../model/view-helpers';
import { DetailSectionHeader } from '../shared/DetailSectionHeader';
import { DocumentPreviewCard } from '../shared/DocumentPreviewCard';
import { EmptyStateCard } from '../shared/EmptyStateCard';
import { OperationalStatusBadge } from '../shared/OperationalStatusBadge';

interface MisViajeGuiasSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

interface MisViajeGuiasFormCardProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

function MisViajeGuiasFormCard({ controller }: MisViajeGuiasFormCardProps) {
    const [formValues, setFormValues] = useState<EmployeeViajeGuiaFormValues>(
        getCreateMisViajeGuiaDefaultValues(),
    );

    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;

    const handleSubmit = async () => {
        await controller.createGuiaMutation.mutateAsync(
            buildCreateMisViajeGuiaPayload(formValues),
        );

        setFormValues(getCreateMisViajeGuiaDefaultValues());
    };

    return (
        <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
            <DetailSectionHeader
                eyebrow="Registro"
                title="Registrar guía de remisión"
                description="Adjunta la guía asociada al traslado para mantener el expediente operativo actualizado."
                aside={
                    canEdit
                        ? <OperationalStatusBadge label="Editable" tone="success" />
                        : <OperationalStatusBadge label="Bloqueado" tone="warning" />
                }
            />

            {controller.isWorkflowBlocked ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    El viaje no admite nuevas guías porque ya está cerrado o completado.
                </Alert>
            ) : null}

            <Stack spacing={2}>
                <TextField
                    select
                    label="Tipo de guía"
                    value={formValues.tipoGuiaID}
                    onChange={(event) => {
                        setFormValues((current) => ({
                            ...current,
                            tipoGuiaID: Number(event.target.value),
                        }));
                    }}
                    disabled={!canEdit || controller.createGuiaMutation.isPending}
                    SelectProps={{ native: true }}
                >
                    <option value={0}>Seleccione</option>
                    {controller.tiposGuia.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.text}
                        </option>
                    ))}
                </TextField>

                <TextField
                    label="Serie"
                    value={formValues.serie}
                    onChange={(event) => {
                        setFormValues((current) => ({
                            ...current,
                            serie: event.target.value,
                        }));
                    }}
                    disabled={!canEdit || controller.createGuiaMutation.isPending}
                />

                <TextField
                    label="Número"
                    value={formValues.numero}
                    onChange={(event) => {
                        setFormValues((current) => ({
                            ...current,
                            numero: event.target.value,
                        }));
                    }}
                    disabled={!canEdit || controller.createGuiaMutation.isPending}
                />

                <ImageUpload
                    value={formValues.rutaArchivo || undefined}
                    onChange={(value) => {
                        setFormValues((current) => ({
                            ...current,
                            rutaArchivo: value ?? '',
                        }));
                    }}
                    helperText="Adjunta la guía escaneada"
                    disabled={!canEdit || controller.createGuiaMutation.isPending}
                />

                <Button
                    variant="contained"
                    disabled={
                        !canEdit
                        || controller.createGuiaMutation.isPending
                        || formValues.tipoGuiaID <= 0
                        || !formValues.serie.trim()
                        || !formValues.numero.trim()
                    }
                    onClick={handleSubmit}
                >
                    Registrar guía
                </Button>
            </Stack>
        </Box>
    );
}

export function MisViajeGuiasSection({ controller }: MisViajeGuiasSectionProps) {
    const [preview, setPreview] = useState<EmployeeViajeDocumentPreviewState>(
        closedEmployeeViajeDocumentPreviewState,
    );

    const isCerrado = controller.isCerrado;

    const handleClosePreview = () => {
        setPreview(closedEmployeeViajeDocumentPreviewState);
    };

    return (
        <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                {!isCerrado ? <MisViajeGuiasFormCard controller={controller} /> : null}

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: isCerrado ? 'span 12' : 'span 7' } }}>
                    <DetailSectionHeader
                        eyebrow="Historial"
                        title="Guías registradas"
                        description="Revisa rápidamente las guías anexadas al viaje y abre su vista previa cuando la necesites."
                        aside={<OperationalStatusBadge label={`${controller.guias.length} registros`} tone="info" />}
                    />

                    <Stack spacing={2}>
                        {controller.guias.length === 0 ? (
                            <EmptyStateCard
                                icon={<DescriptionOutlinedIcon fontSize="large" />}
                                title="Aún no hay guías registradas"
                                description="Cuando se adjunten guías de remisión, aparecerán aquí con acceso rápido a su documento."
                            />
                        ) : (
                            controller.guias.map((item) => {
                                const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                                const tipo = controller.tiposGuia.find(
                                    (option) => option.id === item.tipoGuiaID,
                                )?.text
                                    ?? item.tipoGuia?.descripcion
                                    ?? 'Sin tipo';

                                return (
                                    <Box key={item.viajeGuiaID} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                                            <Box>
                                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                                                    <OperationalStatusBadge label={tipo} tone="info" />
                                                </Stack>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {item.serie} - {item.numero}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Documento adjunto para el viaje
                                                </Typography>
                                            </Box>

                                            {archivoUrl ? (
                                                <DocumentPreviewCard
                                                    previewUrl={archivoUrl}
                                                    alt={`Guía ${item.serie} - ${item.numero}`}
                                                    onPreview={() => {
                                                        setPreview({
                                                            previewUrl: archivoUrl,
                                                            previewUrls: [archivoUrl],
                                                            currentIndex: 0,
                                                            title: `Guía ${item.serie} - ${item.numero}`,
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