import { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { UbigeoSelect } from '@shared/components/ui/UbigeoSelect';
import { buildInternalFileUrl } from '@shared/config/env';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import {
    buildCreateMisViajeIncidentePayload,
    getCreateMisViajeIncidenteDefaultValues,
    type EmployeeViajeIncidenteFormValues,
} from '../../model/forms';
import {
    closedEmployeeViajeDocumentPreviewState,
    type EmployeeViajeDocumentPreviewState,
} from '../../model/preview';
import {
    employeeViajeDetailStyles,
    formatEmployeeViajeDateTimeLabel,
} from '../../model/view-helpers';
import { DocumentPreviewCard } from '../shared/DocumentPreviewCard';

interface MisViajeIncidentesSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeIncidentesSection({ controller }: MisViajeIncidentesSectionProps) {
    const [formValues, setFormValues] = useState<EmployeeViajeIncidenteFormValues>(
        getCreateMisViajeIncidenteDefaultValues(),
    );
    const [preview, setPreview] = useState<EmployeeViajeDocumentPreviewState>(
        closedEmployeeViajeDocumentPreviewState,
    );

    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;

    const handleSubmit = async () => {
        await controller.createIncidenteMutation.mutateAsync(
            buildCreateMisViajeIncidentePayload(formValues),
        );

        setFormValues(getCreateMisViajeIncidenteDefaultValues());
    };

    const handleClosePreview = () => {
        setPreview(closedEmployeeViajeDocumentPreviewState);
    };

    return (
        <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Registrar incidente
                    </Typography>

                    {controller.isWorkflowBlocked ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            El viaje no admite más incidentes porque ya está cerrado o completado.
                        </Alert>
                    ) : null}

                    <Stack spacing={2}>
                        <TextField
                            select
                            label="Tipo de incidente"
                            value={formValues.tipoIncidenteID}
                            onChange={(event) => {
                                setFormValues((current) => ({
                                    ...current,
                                    tipoIncidenteID: Number(event.target.value),
                                }));
                            }}
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                            SelectProps={{ native: true }}
                        >
                            <option value={0}>Seleccione</option>
                            {controller.tiposIncidente.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.text}
                                </option>
                            ))}
                        </TextField>

                        <UbigeoSelect
                            label="Ubigeo"
                            value={formValues.ubigeoID}
                            onChange={(value) => {
                                setFormValues((current) => ({
                                    ...current,
                                    ubigeoID: value,
                                }));
                            }}
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                        />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="Fecha"
                                type="date"
                                value={formValues.fecha}
                                onChange={(event) => {
                                    setFormValues((current) => ({
                                        ...current,
                                        fecha: event.target.value,
                                    }));
                                }}
                                disabled={!canEdit || controller.createIncidenteMutation.isPending}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Hora"
                                type="time"
                                value={formValues.hora}
                                onChange={(event) => {
                                    setFormValues((current) => ({
                                        ...current,
                                        hora: event.target.value,
                                    }));
                                }}
                                disabled={!canEdit || controller.createIncidenteMutation.isPending}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Stack>

                        <TextField
                            label="Lugar o referencia"
                            value={formValues.lugar}
                            onChange={(event) => {
                                setFormValues((current) => ({
                                    ...current,
                                    lugar: event.target.value,
                                }));
                            }}
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                        />

                        <TextField
                            label="Descripción"
                            value={formValues.descripcion}
                            onChange={(event) => {
                                setFormValues((current) => ({
                                    ...current,
                                    descripcion: event.target.value,
                                }));
                            }}
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                            multiline
                            rows={4}
                        />

                        <ImageUpload
                            value={formValues.rutaFoto || undefined}
                            onChange={(value) => {
                                setFormValues((current) => ({
                                    ...current,
                                    rutaFoto: value ?? '',
                                }));
                            }}
                            helperText="Adjunta evidencia del incidente"
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                        />

                        <Button
                            variant="contained"
                            disabled={
                                !canEdit
                                || controller.createIncidenteMutation.isPending
                                || formValues.tipoIncidenteID <= 0
                                || formValues.ubigeoID <= 0
                                || !formValues.descripcion.trim()
                                || !formValues.lugar.trim()
                                || !formValues.rutaFoto
                            }
                            onClick={handleSubmit}
                        >
                            Registrar incidente
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 7' } }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                        Incidentes registrados
                    </Typography>

                    <Stack spacing={2}>
                        {controller.incidentes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No hay incidentes registrados para este viaje.
                            </Typography>
                        ) : (
                            controller.incidentes.map((item) => {
                                const evidenciaUrl = item.rutaFoto ? buildInternalFileUrl(item.rutaFoto) : null;
                                const tipo = controller.tiposIncidente.find(
                                    (option) => option.id === item.tipoIncidenteID,
                                )?.text
                                    ?? item.tipoIncidente?.descripcion
                                    ?? 'Sin tipo';

                                return (
                                    <Box key={item.viajeIncidenteID} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {tipo}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatEmployeeViajeDateTimeLabel(item.fechaHora)}
                                                </Typography>
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary">
                                                {item.lugar || item.ubigeo?.descripcion || 'Sin referencia'}
                                            </Typography>

                                            <Typography variant="body2">
                                                {item.descripcion}
                                            </Typography>

                                            {evidenciaUrl ? (
                                                <DocumentPreviewCard
                                                    previewUrl={evidenciaUrl}
                                                    alt={`Evidencia del incidente ${tipo}`}
                                                    onPreview={() => {
                                                        setPreview({
                                                            previewUrl: evidenciaUrl,
                                                            title: `Evidencia del incidente ${tipo}`,
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
