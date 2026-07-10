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
    CloudUpload as CloudUploadIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@shared/components/ui/Toast';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { CreateDocumentoActualizacionSolicitudDto, MiDocumentoDto } from '@entities/employee/model/types';
import { useEffect } from 'react';
import {
    createSolicitudActualizacionSchema,
    getCreateSolicitudActualizacionDefaultValues,
    type CreateSolicitudActualizacionForm,
    type CreateSolicitudActualizacionFormInput,
} from '../model/schema';

interface SolicitudActualizacionModalProps {
    open: boolean;
    onClose: () => void;
    documentos: MiDocumentoDto[];
    initialDocumentoId?: number;
}

export function SolicitudActualizacionModal({ open, onClose, documentos, initialDocumentoId }: SolicitudActualizacionModalProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const form = useForm<CreateSolicitudActualizacionFormInput, unknown, CreateSolicitudActualizacionForm>({
        resolver: zodResolver(createSolicitudActualizacionSchema),
        defaultValues: getCreateSolicitudActualizacionDefaultValues(),
    });

    useEffect(() => {
        if (open) {
            form.reset(getCreateSolicitudActualizacionDefaultValues(initialDocumentoId));
        }
    }, [open, initialDocumentoId, form]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDocumentoActualizacionSolicitudDto) => employeePortalApi.createDocumentoSolicitud(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Solicitud de actualización enviada correctamente.', severity: 'success' });
            onClose();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'No se pudo enviar la solicitud.';
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
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>Solicitar Actualización Documental</Typography>
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
                        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 3, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { bgcolor: 'action.selected' } }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', mb: 2, boxShadow: 1 }}>
                                <CloudUploadIcon />
                            </Box>
                            <Typography variant="body2" fontWeight="medium">Arrastra y suelta el archivo o haz clic para buscar</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>PDF, JPG o PNG hasta 10MB</Typography>
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 4, py: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
                <Button onClick={onClose} sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { bgcolor: 'action.selected' } }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    disabled={createMutation.isPending}
                    onClick={form.handleSubmit((values) => {
                        createMutation.mutate({
                            colaboradorDocumentoID: values.colaboradorDocumentoID,
                            numeroDocumentoPropuesto: values.numeroDocumentoPropuesto || undefined,
                            fechaEmisionPropuesta: values.fechaEmisionPropuesta || undefined,
                            fechaVencimientoPropuesta: values.fechaVencimientoPropuesta || undefined,
                            motivoSolicitud: values.motivoSolicitud || undefined,
                        });
                    })}
                    endIcon={<SendIcon />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: '0 8px 16px rgba(0,93,168,0.2)' }}
                >
                    {createMutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
