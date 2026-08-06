import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Info as InfoIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import { useState } from 'react';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { UbigeoSelect } from '@shared/components/ui/UbigeoSelect';
import { buildInternalFileUrl } from '@shared/config/env';
import type { useMisViajeDetailPageController } from '../hooks/useMisViajeDetailPageController';

const styles = {
    heroHeader: {
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
        backdropFilter: 'blur(20px)',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 3,
        p: 3,
        boxShadow: 'none',
        border: '1px solid rgba(192, 199, 212, 0.5)',
    },
};

function formatDateLabel(value?: string | null): string {
    if (!value) {
        return 'Sin informacion';
    }

    const parsedValue = new Date(value);
    if (Number.isNaN(parsedValue.getTime())) {
        return value;
    }

    return parsedValue.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatDateTimeLabel(value?: string | null): string {
    if (!value) {
        return 'Sin informacion';
    }

    const parsedValue = new Date(value);
    if (Number.isNaN(parsedValue.getTime())) {
        return value;
    }

    return parsedValue.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatKmLabel(value?: number | null): string {
    if (value === null || value === undefined) {
        return 'Sin registrar';
    }

    return `${value} km`;
}

function getCurrentDateInput() {
    return new Date().toISOString().slice(0, 10);
}

function getCurrentTimeInput() {
    return new Date().toTimeString().slice(0, 5);
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <Box>
            <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}
            >
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
                {value}
            </Typography>
        </Box>
    );
}

function StatusTab({ controller }: { controller: ReturnType<typeof useMisViajeDetailPageController> }) {
    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                    Estado del flujo
                </Typography>
                <Stack spacing={3}>
                    <SummaryItem label="Estado actual" value={controller.viaje?.estadoNombre ?? 'Sin informacion'} />
                    <SummaryItem label="Siguiente estado" value={controller.nextEstado?.text ?? 'No disponible'} />
                    <SummaryItem label="Fecha de partida" value={formatDateLabel(controller.viaje?.fechaPartida)} />
                    <SummaryItem label="Fecha de llegada" value={formatDateLabel(controller.viaje?.fechaLlegada)} />
                    <SummaryItem label="Fecha de descarga" value={formatDateLabel(controller.viaje?.fechaDescarga)} />
                </Stack>
            </Box>

            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 8' } }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Gestión operativa del viaje
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    El flujo permitido es secuencial: Agendado, Tránsito, Descargando y Completado. Las fechas automáticas se registran desde backend al cambiar de estado.
                </Typography>

                {controller.isWorkflowBlocked ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Este viaje ya no permite cambios de flujo porque está cerrado, facturado o completado.
                    </Alert>
                ) : null}

                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Controller
                        name="fechaLlegada"
                        control={controller.statusForm.control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Fecha de llegada"
                                type="date"
                                value={field.value ?? ''}
                                onChange={(event) => field.onChange(event.target.value || null)}
                                disabled={!canEdit || controller.updateStatusMutation.isPending}
                                InputLabelProps={{ shrink: true }}
                                error={!!controller.statusForm.formState.errors.fechaLlegada}
                                helperText={controller.statusForm.formState.errors.fechaLlegada?.message ?? 'Puedes registrar la fecha de llegada sin cambiar de estado.'}
                            />
                        )}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <Button
                            variant="outlined"
                            disabled={!canEdit || controller.updateStatusMutation.isPending}
                            onClick={controller.statusForm.handleSubmit((data) => controller.saveFechaLlegada(data.fechaLlegada))}
                        >
                            Guardar fecha de llegada
                        </Button>
                        <Button
                            variant="contained"
                            disabled={!canEdit || !controller.nextEstado || controller.updateStatusMutation.isPending}
                            onClick={controller.statusForm.handleSubmit((data) => controller.submitNextEstado(data.fechaLlegada))}
                        >
                            {controller.nextEstado ? `Pasar a ${controller.nextEstado.text}` : 'Sin transición disponible'}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}

function IncidentesTab({ controller }: { controller: ReturnType<typeof useMisViajeDetailPageController> }) {
    const [tipoIncidenteID, setTipoIncidenteID] = useState(0);
    const [ubigeoID, setUbigeoID] = useState(0);
    const [fecha, setFecha] = useState(getCurrentDateInput());
    const [hora, setHora] = useState(getCurrentTimeInput());
    const [lugar, setLugar] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [rutaFoto, setRutaFoto] = useState('');

    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;

    const handleSubmit = async () => {
        await controller.createIncidenteMutation.mutateAsync({
            tipoIncidenteID,
            ubigeoID,
            fechaHora: `${fecha}T${hora}:00`,
            lugar,
            descripcion,
            rutaFoto,
        });

        setTipoIncidenteID(0);
        setUbigeoID(0);
        setFecha(getCurrentDateInput());
        setHora(getCurrentTimeInput());
        setLugar('');
        setDescripcion('');
        setRutaFoto('');
    };

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
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
                        value={tipoIncidenteID}
                        onChange={(event) => setTipoIncidenteID(Number(event.target.value))}
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
                        value={ubigeoID}
                        onChange={(value) => setUbigeoID(value)}
                        disabled={!canEdit || controller.createIncidenteMutation.isPending}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            label="Fecha"
                            type="date"
                            value={fecha}
                            onChange={(event) => setFecha(event.target.value)}
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="Hora"
                            type="time"
                            value={hora}
                            onChange={(event) => setHora(event.target.value)}
                            disabled={!canEdit || controller.createIncidenteMutation.isPending}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Stack>

                    <TextField
                        label="Lugar o referencia"
                        value={lugar}
                        onChange={(event) => setLugar(event.target.value)}
                        disabled={!canEdit || controller.createIncidenteMutation.isPending}
                    />

                    <TextField
                        label="Descripción"
                        value={descripcion}
                        onChange={(event) => setDescripcion(event.target.value)}
                        disabled={!canEdit || controller.createIncidenteMutation.isPending}
                        multiline
                        rows={4}
                    />

                    <ImageUpload
                        value={rutaFoto || undefined}
                        onChange={(value) => setRutaFoto(value ?? '')}
                        helperText="Adjunta evidencia del incidente"
                    />

                    <Button
                        variant="contained"
                        disabled={
                            !canEdit ||
                            controller.createIncidenteMutation.isPending ||
                            tipoIncidenteID <= 0 ||
                            ubigeoID <= 0 ||
                            !descripcion.trim() ||
                            !lugar.trim() ||
                            !rutaFoto
                        }
                        onClick={handleSubmit}
                    >
                        Registrar incidente
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 7' } }}>
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
                            const tipo = controller.tiposIncidente.find((option) => option.id === item.tipoIncidenteID)?.text
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
                                                {formatDateTimeLabel(item.fechaHora)}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.lugar || 'Sin referencia'}
                                        </Typography>
                                        <Typography variant="body2">{item.descripcion}</Typography>
                                        {evidenciaUrl ? (
                                            <Button component="a" href={evidenciaUrl} target="_blank" rel="noreferrer" size="small" sx={{ alignSelf: 'flex-start' }}>
                                                Ver evidencia
                                            </Button>
                                        ) : null}
                                    </Stack>
                                </Box>
                            );
                        })
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

function GuiasTab({ controller }: { controller: ReturnType<typeof useMisViajeDetailPageController> }) {
    const [tipoGuiaID, setTipoGuiaID] = useState(0);
    const [serie, setSerie] = useState('');
    const [numero, setNumero] = useState('');
    const [rutaArchivo, setRutaArchivo] = useState('');

    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;

    const handleSubmit = async () => {
        await controller.createGuiaMutation.mutateAsync({
            tipoGuiaID,
            serie,
            numero,
            rutaArchivo: rutaArchivo || undefined,
        });

        setTipoGuiaID(0);
        setSerie('');
        setNumero('');
        setRutaArchivo('');
    };

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
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
                        value={tipoGuiaID}
                        onChange={(event) => setTipoGuiaID(Number(event.target.value))}
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
                        value={serie}
                        onChange={(event) => setSerie(event.target.value)}
                        disabled={!canEdit || controller.createGuiaMutation.isPending}
                    />

                    <TextField
                        label="Número"
                        value={numero}
                        onChange={(event) => setNumero(event.target.value)}
                        disabled={!canEdit || controller.createGuiaMutation.isPending}
                    />

                    <ImageUpload
                        value={rutaArchivo || undefined}
                        onChange={(value) => setRutaArchivo(value ?? '')}
                        helperText="Adjunta la guía escaneada"
                    />

                    <Button
                        variant="contained"
                        disabled={
                            !canEdit ||
                            controller.createGuiaMutation.isPending ||
                            tipoGuiaID <= 0 ||
                            !serie.trim() ||
                            !numero.trim()
                        }
                        onClick={handleSubmit}
                    >
                        Registrar guía
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 7' } }}>
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
                            const tipo = controller.tiposGuia.find((option) => option.id === item.tipoGuiaID)?.text
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
                                            <Button component="a" href={archivoUrl} target="_blank" rel="noreferrer" size="small">
                                                Ver documento
                                            </Button>
                                        ) : null}
                                    </Stack>
                                </Box>
                            );
                        })
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

function PermisosTab({ controller }: { controller: ReturnType<typeof useMisViajeDetailPageController> }) {
    return (
        <Box sx={{ ...styles.card }}>
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

                        return (
                            <Box key={item.viajePermisoID} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Permiso #{item.viajePermisoID}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Vigencia: {formatDateLabel(item.fechaVigencia)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Vencimiento: {formatDateLabel(item.fechaVencimiento)}
                                        </Typography>
                                    </Box>
                                    {archivoUrl ? (
                                        <Button component="a" href={archivoUrl} target="_blank" rel="noreferrer" size="small">
                                            Ver archivo
                                        </Button>
                                    ) : null}
                                </Stack>
                            </Box>
                        );
                    })
                )}
            </Stack>
        </Box>
    );
}

interface MisViajeDetailPageContentProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeDetailPageContent({ controller }: MisViajeDetailPageContentProps) {
    const { viaje, isLoading } = controller;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (controller.isError && !viaje) {
        return (
            <Box sx={{ p: 4 }}>
                <FetchErrorState
                    message="No se pudo cargar el viaje del portal del empleado."
                    onRetry={controller.retryViajeLoad}
                />
            </Box>
        );
    }

    if (!viaje) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">No se encontró el viaje</Typography>
                <Button onClick={controller.handleBack} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Box>
        );
    }

    const isCerrado = viaje.cerrado;
    const isFacturado = viaje.facturado;

    return (
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
            <Box sx={{ ...styles.heroHeader, position: 'sticky', top: 0, zIndex: 10, px: { xs: 2, md: 4 }, py: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        onClick={controller.handleBack}
                        sx={{ minWidth: 'auto', p: 1, borderRadius: '50%', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                        <ArrowBackIcon />
                    </Button>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                                Viaje: {viaje.codigo}
                            </Typography>
                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '999px', bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {viaje.estadoNombre}
                            </Box>
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">CERRADO:</Typography>
                            <Typography variant="caption" fontWeight="900" color={isCerrado ? 'success.main' : 'error.main'}>{isCerrado ? 'SÍ' : 'NO'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">FACTURADO:</Typography>
                            <Typography variant="caption" fontWeight="900" color={isFacturado ? 'success.main' : 'error.main'}>{isFacturado ? 'SÍ' : 'NO'}</Typography>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary', '& > span': { fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' } }}>
                    <span>Portal del Empleado</span>
                    <span>›</span>
                    <span>Mis Viajes</span>
                    <span>›</span>
                    <span>{viaje.codigo}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                            Ruta: {viaje.origenDescripcion} - {viaje.destinoDescripcion}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Cliente: {viaje.clienteRazonSocial}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Tabs
                    value={controller.currentTab}
                    onChange={controller.handleTabChange}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    sx={{ minHeight: 48, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minWidth: 'auto', px: 3, py: 1.5 } }}
                >
                    <Tab label="Resumen" />
                    <Tab label="Estado" />
                    <Tab label="Incidentes" />
                    <Tab label="Guías" />
                    <Tab label="Permisos" />
                    <Tab label="KMs" />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, bgcolor: 'background.paper', p: { xs: 2, md: 4 } }}>
                {controller.currentTab === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                                    Resumen operativo
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                    <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                                    <SummaryItem label="Ruta" value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`} />
                                    <SummaryItem label="Fecha de carga" value={formatDateLabel(viaje.fechaCarga)} />
                                    <SummaryItem label="Fecha de partida" value={formatDateLabel(viaje.fechaPartida)} />
                                    <SummaryItem label="Fecha de llegada" value={formatDateLabel(viaje.fechaLlegada)} />
                                    <SummaryItem label="Fecha de descarga" value={formatDateLabel(viaje.fechaDescarga)} />
                                    <SummaryItem label="Llegada a base" value={formatDateLabel(viaje.fechaLlegadaBase)} />
                                    <SummaryItem label="Estado actual" value={viaje.estadoNombre} />
                                </Box>
                            </Box>

                            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 3' } }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                                    Unidad asignada
                                </Typography>
                                <Stack spacing={3}>
                                    <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin informacion'} />
                                    <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin informacion'} />
                                    <SummaryItem label="Viaje cerrado" value={isCerrado ? 'Si' : 'No'} />
                                    <SummaryItem label="Viaje facturado" value={isFacturado ? 'Si' : 'No'} />
                                </Stack>
                            </Box>

                            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                                    Kilometraje registrado
                                </Typography>
                                <Stack spacing={3}>
                                    <SummaryItem label="Inicio de ruta" value={formatKmLabel(viaje.kmInicio)} />
                                    <SummaryItem label="Llegada a destino" value={formatKmLabel(viaje.kmLlegada)} />
                                    <SummaryItem label="Regreso a base" value={formatKmLabel(viaje.kmLlegadaBase)} />
                                </Stack>
                                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Desde esta pantalla también puedes gestionar el flujo del viaje, registrar incidentes, adjuntar guías y revisar permisos.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ) : null}

                {controller.isStatusTabActive ? <StatusTab controller={controller} /> : null}
                {controller.isIncidentesTabActive ? <IncidentesTab controller={controller} /> : null}
                {controller.isGuiasTabActive ? <GuiasTab controller={controller} /> : null}
                {controller.isPermisosTabActive ? <PermisosTab controller={controller} /> : null}

                {controller.isKmsTabActive ? (
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
                        <Box sx={{ width: { xs: '100%', lg: '33%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ ...styles.card }}>
                                <Typography variant="overline" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3 }}>
                                    Contexto del viaje
                                </Typography>
                                <Stack spacing={2.5}>
                                    <SummaryItem label="Ruta" value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`} />
                                    <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                                    <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin informacion'} />
                                    <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin informacion'} />
                                </Stack>
                            </Box>
                        </Box>

                        <Box sx={{ width: { xs: '100%', lg: '67%' } }}>
                            <Box sx={{ ...styles.card, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>Registro de Kilometraje</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Introduzca los valores actuales para actualizar la hoja de ruta.
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box component="form" onSubmit={controller.kmsForm.handleSubmit(controller.onSubmitKms)} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                                        <Box>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                                KM INICIO DE RUTA
                                            </Typography>
                                            <Controller
                                                name="kmInicio"
                                                control={controller.kmsForm.control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        type="number"
                                                        placeholder="0"
                                                        disabled={!controller.canManageViajeKms || isCerrado}
                                                        error={!!controller.kmsForm.formState.errors.kmInicio}
                                                        helperText={controller.kmsForm.formState.errors.kmInicio?.message}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end"><Typography fontWeight="bold" color="text.secondary">KM</Typography></InputAdornment>,
                                                            sx: { fontSize: '1.5rem', fontWeight: 'bold', bgcolor: 'action.hover', borderRadius: 2, '& fieldset': { border: 'none' } }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                                KM LLEGADA DESTINO
                                            </Typography>
                                            <Controller
                                                name="kmLlegada"
                                                control={controller.kmsForm.control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        type="number"
                                                        placeholder="0"
                                                        disabled={!controller.canManageViajeKms || isCerrado}
                                                        error={!!controller.kmsForm.formState.errors.kmLlegada}
                                                        helperText={controller.kmsForm.formState.errors.kmLlegada?.message}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end"><Typography fontWeight="bold" color="text.secondary">KM</Typography></InputAdornment>,
                                                            sx: { fontSize: '1.5rem', fontWeight: 'bold', bgcolor: 'action.hover', borderRadius: 2, '& fieldset': { border: 'none' } }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                            KM REGRESO A BASE (FINAL)
                                        </Typography>
                                        <Controller
                                            name="kmLlegadaBase"
                                            control={controller.kmsForm.control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    type="number"
                                                    placeholder="0"
                                                    disabled={!controller.canManageViajeKms || isCerrado}
                                                    error={!!controller.kmsForm.formState.errors.kmLlegadaBase}
                                                    helperText={controller.kmsForm.formState.errors.kmLlegadaBase?.message}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end"><Typography fontWeight="bold" color="text.secondary">KM TOTAL</Typography></InputAdornment>,
                                                        sx: { fontSize: '2rem', fontWeight: 'bold', bgcolor: 'action.hover', borderRadius: 2, '& fieldset': { border: 'none' } }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                                            <InfoIcon fontSize="small" />
                                            <Typography variant="body2">
                                                Los campos se bloquearán una vez guardado el cierre de viaje.
                                            </Typography>
                                        </Box>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={!controller.canManageViajeKms || isCerrado || controller.updateKmsMutation.isPending}
                                            startIcon={<SaveIcon />}
                                            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 8px 16px rgba(0,93,168,0.2)' }}
                                        >
                                            Guardar Kilometraje
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}
