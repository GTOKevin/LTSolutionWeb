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
import type { CreateMiLicenciaRequestDto, MiLicenciaDto } from '@entities/employee/model/types';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { LICENCIA_CODIGO, SECCION_MAESTRO } from '@entities/master-data/model/constants';
import {
    createLicenciaSolicitudSchema,
    getCreateLicenciaSolicitudDefaultValues,
    getUpdateLicenciaSolicitudDefaultValues,
    type CreateLicenciaSolicitudForm,
    type CreateLicenciaSolicitudFormInput,
} from '../model/schema';
import { getErrorMessage } from '@shared/utils/api-errors';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { MultiImageUploadField } from '@shared/components/ui/MultiImageUploadField';
import { buildRutasArchivo } from '@shared/utils/file-utils';

interface SolicitarLicenciaModalProps {
    open: boolean;
    onClose: () => void;
    editing?: MiLicenciaDto | null;
    editPending?: boolean;
    onEditSubmit?: (id: number, payload: CreateMiLicenciaRequestDto) => void;
}

export function SolicitarLicenciaModal({ open, onClose, editing, editPending = false, onEditSubmit }: SolicitarLicenciaModalProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const isEditing = Boolean(editing);
    const dialogVisible = open || isEditing;

    const form = useForm<CreateLicenciaSolicitudFormInput, unknown, CreateLicenciaSolicitudForm>({
        resolver: zodResolver(createLicenciaSolicitudSchema),
        defaultValues: getCreateLicenciaSolicitudDefaultValues(),
    });

    useEffect(() => {
        if (dialogVisible) {
            form.reset(
                editing
                    ? getUpdateLicenciaSolicitudDefaultValues(editing)
                    : getCreateLicenciaSolicitudDefaultValues(),
            );
        }
    }, [dialogVisible, editing, form]);

    const { data: tiposLicencia } = useQuery({
        queryKey: ['employee-portal', 'tipos-licencia'],
        queryFn: () => maestroApi.getSelect(undefined, SECCION_MAESTRO.LICENCIA, LICENCIA_CODIGO.EMPLEADOS),
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateMiLicenciaRequestDto) => employeePortalApi.createMyLicencia(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Solicitud de licencia registrada correctamente.', severity: 'success' });
            onClose();
        },
        onError: (error: unknown) => {
            const message =
                handleBackendErrors<CreateLicenciaSolicitudForm>(error, form.setError)
                ?? getErrorMessage(error, 'No se pudo registrar la licencia.');
            showToast({ message, severity: 'error' });
        },
    });

    const handleClose = () => {
        if (!createMutation.isPending && !editPending) {
            onClose();
        }
    };

    return (
        <Dialog
            open={dialogVisible}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
            <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                        {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isEditing
                            ? 'Modifique los datos de su solicitud pendiente para continuar la revisión interna.'
                            : 'Complete los datos basicos de su solicitud para iniciar la revision interna.'}
                    </Typography>
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
                                    helperText={fieldState.error?.message ?? 'Use este campo para agregar el contexto que ayude a la revisión interna.'}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 2 } }}
                                />
                            )}
                        />
                    </Box>

                    <Box>
                        <Typography variant="overline" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                            IMÁGENES ADJUNTAS (OPCIONAL)
                        </Typography>
                        <Controller
                            control={form.control}
                            name="rutasFoto"
                            render={({ field }) => (
                                <MultiImageUploadField
                                    values={field.value ?? []}
                                    onChange={field.onChange}
                                    folder="licencias"
                                    helperText="Adjunte imágenes que sustenten su solicitud. Se subirán automáticamente al seleccionarlas."
                                    disabled={createMutation.isPending || editPending}
                                />
                            )}
                        />
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 4, py: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
                <Button onClick={handleClose} sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { bgcolor: 'action.selected' } }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    disabled={createMutation.isPending || editPending}
                    onClick={form.handleSubmit((values) => {
                        const payload: CreateMiLicenciaRequestDto = {
                            tipoLicenciaID: values.tipoLicenciaID,
                            descripcion: values.descripcion || undefined,
                            fechaInicial: values.fechaInicial,
                            fechaFinal: values.fechaFinal || undefined,
                            rutasFoto: buildRutasArchivo(values.rutasFoto ?? []),
                        };
                        if (isEditing && editing && onEditSubmit) {
                            onEditSubmit(editing.colaboradorLicenciaId, payload);
                            return;
                        }
                        createMutation.mutate(payload);
                    })}
                    endIcon={<SendIcon />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: '0 8px 16px rgba(0,93,168,0.2)' }}
                >
                    {editPending ? 'Actualizando...' : createMutation.isPending ? 'Enviando...' : isEditing ? 'Guardar cambios' : 'Enviar solicitud'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
