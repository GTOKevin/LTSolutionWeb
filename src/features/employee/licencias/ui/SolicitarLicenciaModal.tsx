import { useEffect } from 'react';
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
import { Send as SendIcon } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@shared/components/ui/Toast';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@entities/employee/api/employee-portal.api';
import type { CreateMiLicenciaRequestDto } from '@entities/employee/model/types';
import { maestroApi } from '@shared/api/maestro.api';
import { SECCION_MAESTRO } from '@shared/constants/maestro';
import {
    createLicenciaSolicitudSchema,
    getCreateLicenciaSolicitudDefaultValues,
    type CreateLicenciaSolicitudForm,
    type CreateLicenciaSolicitudFormInput,
} from '../model/schema';

interface SolicitarLicenciaModalProps {
    open: boolean;
    onClose: () => void;
}

export function SolicitarLicenciaModal({ open, onClose }: SolicitarLicenciaModalProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const form = useForm<CreateLicenciaSolicitudFormInput, unknown, CreateLicenciaSolicitudForm>({
        resolver: zodResolver(createLicenciaSolicitudSchema),
        defaultValues: getCreateLicenciaSolicitudDefaultValues(),
    });

    useEffect(() => {
        if (open) {
            form.reset(getCreateLicenciaSolicitudDefaultValues());
        }
    }, [open, form]);

    const { data: tiposLicencia } = useQuery({
        queryKey: ['employee-portal', 'tipos-licencia'],
        queryFn: async () => (await maestroApi.getSelect(undefined, SECCION_MAESTRO.LICENCIA)).data,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateMiLicenciaRequestDto) => employeePortalApi.createMyLicencia(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Solicitud de licencia registrada correctamente.', severity: 'success' });
            onClose();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'No se pudo registrar la licencia.';
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
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>Nueva Solicitud</Typography>
                    <Typography variant="body2" color="text.secondary">Complete el formulario para solicitar una licencia.</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box>
                        <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                            TIPO DE LICENCIA <Typography component="span" color="error">*</Typography>
                        </Typography>
                        <Controller
                            control={form.control}
                            name="tipoLicenciaID"
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    error={Boolean(fieldState.error)}
                                    helperText={fieldState.error?.message ?? 'Elija el motivo principal de su ausencia.'}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                >
                                    {(tiposLicencia ?? []).map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>
                                            {tipo.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                        <Box>
                            <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                FECHA INICIAL <Typography component="span" color="error">*</Typography>
                            </Typography>
                            <Controller
                                control={form.control}
                                name="fechaInicial"
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
                                FECHA FINAL
                            </Typography>
                            <Controller
                                control={form.control}
                                name="fechaFinal"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="date"
                                        error={Boolean(fieldState.error)}
                                        helperText={fieldState.error?.message ?? 'Opcional si es solo un día.'}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                            DESCRIPCIÓN / MOTIVO
                        </Typography>
                        <Controller
                            control={form.control}
                            name="descripcion"
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    placeholder="Brinde más detalles sobre su solicitud..."
                                    error={Boolean(fieldState.error)}
                                    helperText={fieldState.error?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
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
                    disabled={createMutation.isPending}
                    onClick={form.handleSubmit((values) => {
                        createMutation.mutate({
                            tipoLicenciaID: values.tipoLicenciaID,
                            descripcion: values.descripcion || undefined,
                            fechaInicial: values.fechaInicial,
                            fechaFinal: values.fechaFinal || undefined,
                        });
                    })}
                    endIcon={<SendIcon />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: '0 8px 16px rgba(0,93,168,0.2)' }}
                >
                    {createMutation.isPending ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
