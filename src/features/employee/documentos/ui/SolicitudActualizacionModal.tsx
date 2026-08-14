import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    Description as EditDocumentIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@shared/components/ui/Toast';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type {
    CreateDocumentoActualizacionSolicitudDto,
    DocumentoActualizacionSolicitudDto,
    MiDocumentoDto,
} from '@entities/employee/model/types';
import { useEffect } from 'react';
import {
    createSolicitudActualizacionSchema,
    getCreateSolicitudActualizacionDefaultValues,
    type CreateSolicitudActualizacionForm,
    type CreateSolicitudActualizacionFormInput,
} from '../model/schema';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { getErrorMessage } from '@shared/utils/api-errors';
import { handleBackendErrors } from '@shared/utils/form-validation';

interface SolicitudActualizacionModalProps {
    open: boolean;
    onClose: () => void;
    documentos: MiDocumentoDto[];
    initialDocumentoId?: number;
    solicitud?: DocumentoActualizacionSolicitudDto | null;
    onUpdate?: (id: number, payload: CreateDocumentoActualizacionSolicitudDto) => void;
    isUpdating?: boolean;
}

export function SolicitudActualizacionModal({ open, onClose, documentos, initialDocumentoId, solicitud, onUpdate, isUpdating = false }: SolicitudActualizacionModalProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const form = useForm<CreateSolicitudActualizacionFormInput, unknown, CreateSolicitudActualizacionForm>({
        resolver: zodResolver(createSolicitudActualizacionSchema),
        defaultValues: getCreateSolicitudActualizacionDefaultValues(),
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        if (solicitud) {
            form.reset({
                colaboradorDocumentoID: solicitud.colaboradorDocumentoId,
                numeroDocumentoPropuesto: solicitud.numeroDocumentoPropuesto ?? '',
                rutaArchivoPropuesta: solicitud.rutaArchivoPropuesta ?? '',
                fechaEmisionPropuesta: solicitud.fechaEmisionPropuesta ?? '',
                fechaVencimientoPropuesta: solicitud.fechaVencimientoPropuesta ?? '',
                motivoSolicitud: solicitud.motivoSolicitud ?? '',
            });
            return;
        }

        form.reset(getCreateSolicitudActualizacionDefaultValues(initialDocumentoId));
    }, [open, initialDocumentoId, solicitud, form]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDocumentoActualizacionSolicitudDto) => employeePortalApi.createDocumentoSolicitud(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Solicitud de actualización enviada correctamente.', severity: 'success' });
            onClose();
        },
        onError: (error: unknown) => {
            const message =
                handleBackendErrors<CreateSolicitudActualizacionForm>(error, form.setError)
                ?? getErrorMessage(error, 'No se pudo enviar la solicitud.');
            showToast({ message, severity: 'error' });
        },
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
            <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                        <EditDocumentIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>{solicitud ? 'Editar Solicitud de Actualización' : 'Solicitar Actualización Documental'}</Typography>
                        <Typography variant="body2" color="text.secondary">Complete los campos para renovar el registro logístico.</Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        <Box>
                            <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                SELECTOR DE DOCUMENTO <Typography component="span" color="error">*</Typography>
                            </Typography>
                            <Controller
                                control={form.control}
                                name="colaboradorDocumentoID"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        disabled={Boolean(solicitud)}
                                        error={Boolean(fieldState.error)}
                                        helperText={fieldState.error?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                    >
                                        {documentos.map((documento) => (
                                            <MenuItem key={documento.colaboradorDocumentoId} value={documento.colaboradorDocumentoId}>
                                                {documento.tipoDocumentoNombre}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Box>
                        <Box>
                            <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                NUEVO NÚMERO
                            </Typography>
                            <Controller
                                control={form.control}
                                name="numeroDocumentoPropuesto"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        placeholder="Ej: ABC-12345678"
                                        error={Boolean(fieldState.error)}
                                        helperText={fieldState.error?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        <Box>
                            <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                NUEVA FECHA DE EMISIÓN
                            </Typography>
                            <Controller
                                control={form.control}
                                name="fechaEmisionPropuesta"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="date"
                                        error={Boolean(fieldState.error)}
                                        helperText={fieldState.error?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Box>
                        <Box>
                            <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                NUEVA FECHA DE VENCIMIENTO
                            </Typography>
                            <Controller
                                control={form.control}
                                name="fechaVencimientoPropuesta"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="date"
                                        error={Boolean(fieldState.error)}
                                        helperText={fieldState.error?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                            MOTIVO DE LA SOLICITUD
                        </Typography>
                        <Controller
                                control={form.control}
                                name="motivoSolicitud"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Describa brevemente la razón de la actualización..."
                                        error={Boolean(fieldState.error)}
                                        helperText={fieldState.error?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                    />
                                )}
                            />
                    </Box>

                    <Box>
                        <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                            ADJUNTAR DOCUMENTO
                        </Typography>
                        <Controller
                            control={form.control}
                            name="rutaArchivoPropuesta"
                            render={({ field, fieldState }) => (
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    folder="temp/colaboradores/documentos"
                                    label="Adjuntar sustento documental"
                                    error={Boolean(fieldState.error)}
                                    helperText={fieldState.error?.message || 'Adjunta una imagen JPG o PNG del documento si deseas sustentar la actualización.'}
                                />
                            )}
                        />
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 4, py: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
                <Button onClick={onClose} sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { bgcolor: 'action.selected' } }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    disabled={createMutation.isPending || isUpdating}
                    onClick={form.handleSubmit((values) => {
                        const payload: CreateDocumentoActualizacionSolicitudDto = {
                            colaboradorDocumentoID: values.colaboradorDocumentoID,
                            numeroDocumentoPropuesto: values.numeroDocumentoPropuesto || undefined,
                            rutaArchivoPropuesta: values.rutaArchivoPropuesta || undefined,
                            fechaEmisionPropuesta: values.fechaEmisionPropuesta || undefined,
                            fechaVencimientoPropuesta: values.fechaVencimientoPropuesta || undefined,
                            motivoSolicitud: values.motivoSolicitud || undefined,
                        };

                        if (solicitud) {
                            onUpdate?.(solicitud.solicitudId, payload);
                        } else {
                            createMutation.mutate(payload);
                        }
                    })}
                    endIcon={<SendIcon />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: '0 8px 16px rgba(0,93,168,0.2)' }}
                >
                    {createMutation.isPending || isUpdating
                        ? (solicitud ? 'Guardando...' : 'Enviando...')
                        : (solicitud ? 'Guardar Cambios' : 'Enviar Solicitud')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
