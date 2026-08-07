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
import { DocumentPreviewCard } from '../shared/DocumentPreviewCard';

interface MisViajeGuiasSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeGuiasSection({ controller }: MisViajeGuiasSectionProps) {
    const [formValues, setFormValues] = useState<EmployeeViajeGuiaFormValues>(
        getCreateMisViajeGuiaDefaultValues(),
    );
    const [preview, setPreview] = useState<EmployeeViajeDocumentPreviewState>(
        closedEmployeeViajeDocumentPreviewState,
    );

    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;

    const handleSubmit = async () => {
        await controller.createGuiaMutation.mutateAsync(
            buildCreateMisViajeGuiaPayload(formValues),
        );

        setFormValues(getCreateMisViajeGuiaDefaultValues());
    };

    const handleClosePreview = () => {
        setPreview(closedEmployeeViajeDocumentPreviewState);
    };

    return (
        <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Registrar guía de remisión
                    </Typography>

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

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 7' } }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                        Guías registradas
                    </Typography>

                    <Stack spacing={2}>
                        {controller.guias.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No hay guías registradas para este viaje.
                            </Typography>
                        ) : (
                            controller.guias.map((item) => {
                                const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                                const tipo = controller.tiposGuia.find(
                                    (option) => option.id === item.tipoGuiaID,
                                )?.text
                                    ?? item.tipoGuia?.descripcion
                                    ?? 'Sin tipo';

                                return (
                                    <Box key={item.viajeGuiaID} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {item.serie} - {item.numero}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {tipo}
                                                </Typography>
                                            </Box>

                                            {archivoUrl ? (
                                                <DocumentPreviewCard
                                                    previewUrl={archivoUrl}
                                                    alt={`Guía ${item.serie} - ${item.numero}`}
                                                    onPreview={() => {
                                                        setPreview({
                                                            previewUrl: archivoUrl,
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
                title={preview.title}
            />
        </>
    );
}
