import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { licenciaApi } from '@entities/licencia/api/licencia.api';
import { maestroApi } from '@shared/api/maestro.api';
import type { Licencia } from '@entities/licencia/model/types';
import { createLicenciaSchema, type CreateLicenciaSchema } from '../model/schema';
import { useEffect } from 'react';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';

interface LicenciaFormProps {
    open: boolean;
    onClose: () => void;
    colaboradorId: number;
    licenciaToEdit?: Licencia | null;
}

export function LicenciaForm({ open, onClose, colaboradorId, licenciaToEdit }: LicenciaFormProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const isEdit = !!licenciaToEdit;

    // Queries
    const { data: tiposLicencia } = useQuery({
        queryKey: ['tipos-licencia'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_LICENCIA),
        enabled: open
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(createLicenciaSchema),
        defaultValues: {
            colaboradorID: colaboradorId
        }
    });

    useEffect(() => {
        if (open) {
            if (licenciaToEdit) {
                reset({
                    colaboradorID: colaboradorId,
                    tipoLicenciaID: licenciaToEdit.tipoLicenciaID,
                    descripcion: licenciaToEdit.descripcion || '',
                    fechaInicial: licenciaToEdit.fechaInicial,
                    fechaFinal: licenciaToEdit.fechaFinal || ''
                });
            } else {
                reset({
                    colaboradorID: colaboradorId,
                    tipoLicenciaID: 0,
                    descripcion: '',
                    fechaInicial: new Date().toISOString().split('T')[0],
                    fechaFinal: ''
                });
            }
        }
    }, [open, licenciaToEdit, colaboradorId, reset]);

    const mutation = useMutation({
        mutationFn: async (data: CreateLicenciaSchema) => {
            if (isEdit && licenciaToEdit) {
                await licenciaApi.update(licenciaToEdit.licenciaID, data);
                return licenciaToEdit.licenciaID;
            }
            const response = await licenciaApi.create(colaboradorId, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licencias', colaboradorId] });
            onClose();
        }
    });

    const onSubmit = (data: CreateLicenciaSchema) => {
        mutation.mutate(data);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle component="div" sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5)
            }}>
                <Typography variant="h6" component="div" fontWeight="bold">
                    {isEdit ? 'Editar Ausencia/Licencia' : 'Nueva Ausencia/Licencia'}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{xs:12}}>
                            <Controller
                                name="tipoLicenciaID"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label="Tipo de Ausencia/Licencia"
                                        fullWidth
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        value={field.value || 0}
                                        error={!!errors.tipoLicenciaID}
                                        helperText={errors.tipoLicenciaID?.message}
                                    >
                                        <MenuItem value={0} disabled>Seleccione</MenuItem>
                                        {tiposLicencia?.data?.map((t) => (
                                            <MenuItem key={t.id} value={t.id}>
                                                {t.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12,sm:6}}>
                            <TextField
                                label="Fecha Inicio"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...register('fechaInicial')}
                                error={!!errors.fechaInicial}
                                helperText={errors.fechaInicial?.message}
                            />
                        </Grid>

                        <Grid size={{xs:12,sm:6}}>
                            <TextField
                                label="Fecha Fin"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...register('fechaFinal')}
                                error={!!errors.fechaFinal}
                                helperText={errors.fechaFinal?.message}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <TextField
                                label="Motivó / Comentario"
                                fullWidth
                                multiline
                                rows={2}
                                {...register('descripcion')}
                                error={!!errors.descripcion}
                                helperText={errors.descripcion?.message}
                                placeholder="Ej: Cita médica programada..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={isSubmitting || mutation.isPending}
                    >
                        {isEdit ? 'Guardar Cambios' : 'Registrar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
