import { ReportProblemOutlined as ReportProblemOutlinedIcon } from '@mui/icons-material';
import { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { MultiImageUploadField } from '@shared/components/ui/MultiImageUploadField';
import { UbigeoSelect } from '@shared/components/ui/UbigeoSelect';
import { getIncidenteImageRoutes } from '@entities/viaje/model/incidente-images';
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
import { EvidenceGallery } from '@shared/components/ui/EvidenceGallery';
import { DetailSectionHeader } from '../shared/DetailSectionHeader';
import { EmptyStateCard } from '../shared/EmptyStateCard';
import { OperationalStatusBadge } from '../shared/OperationalStatusBadge';

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
                    <DetailSectionHeader
                        eyebrow="Registro"
                        title="Registrar incidente"
                        description="Documenta eventos operativos y adjunta evidencias para el historial del viaje."
                        aside={
                            canEdit
                                ? <OperationalStatusBadge label="Editable" tone="success" />
                                : <OperationalStatusBadge label="Bloqueado" tone="warning" />
                        }
                    />

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

                        <MultiImageUploadField
                            values={formValues.rutasFoto}
                            onChange={(values) => {
                                setFormValues((current) => ({
                                    ...current,
                                    rutasFoto: values,
                                }));
                            }}
                            helperText="Adjunta evidencia del incidente"
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                            folder="incidentes"
                            layout="slots"
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
                                || formValues.rutasFoto.every((value) => !value.trim())
                            }
                            onClick={handleSubmit}
                        >
                            Registrar incidente
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 7' } }}>
                    <DetailSectionHeader
                        eyebrow="Historial"
                        title="Incidentes registrados"
                        description="Consulta el detalle operativo de cada incidente y navega entre sus evidencias."
                        aside={<OperationalStatusBadge label={`${controller.incidentes.length} registros`} tone="info" />}
                    />

                    <Stack spacing={2}>
                        {controller.incidentes.length === 0 ? (
                            <EmptyStateCard
                                icon={<ReportProblemOutlinedIcon fontSize="large" />}
                                title="Aún no se registraron incidentes"
                                description="Cuando ocurra una novedad operativa, podrás documentarla aquí junto con sus evidencias."
                            />
                        ) : (
                            controller.incidentes.map((item) => {
                                const evidenceRoutes = getIncidenteImageRoutes(item).filter(Boolean);
                                const evidenceUrls = evidenceRoutes
                                    .map((route) => buildInternalFileUrl(route))
                                    .filter((url): url is string => Boolean(url));
                                const tipo = controller.tiposIncidente.find(
                                    (option) => option.id === item.tipoIncidenteID,
                                )?.text
                                    ?? item.tipoIncidente?.descripcion
                                    ?? 'Sin tipo';
                                const evidenceItems = evidenceUrls.map((url, index) => ({
                                    url,
                                    alt: `Evidencia del incidente ${tipo} ${index + 1}`,
                                }));

                                return (
                                    <Box key={item.viajeIncidenteID} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                    <OperationalStatusBadge label={tipo} tone="warning" />
                                                    <OperationalStatusBadge label={`${evidenceRoutes.length} evidencias`} tone="neutral" />
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                                    {formatEmployeeViajeDateTimeLabel(item.fechaHora)}
                                                </Typography>
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary">
                                                {item.lugar || item.ubigeo?.descripcion || 'Sin referencia'}
                                            </Typography>

                                            <Typography variant="body2">
                                                {item.descripcion}
                                            </Typography>

                                            {evidenceRoutes.length > 0 ? (
                                                <EvidenceGallery
                                                    items={evidenceItems}
                                                    onPreview={(index) => {
                                                        const evidenciaUrl = evidenceUrls[index] ?? null;
                                                        if (!evidenciaUrl) {
                                                            return;
                                                        }

                                                        setPreview({
                                                            previewUrl: evidenciaUrl,
                                                            previewUrls: evidenceUrls,
                                                            currentIndex: index,
                                                            title: `Evidencias del incidente ${tipo}`,
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
