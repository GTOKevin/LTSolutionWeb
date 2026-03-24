import {
    Box,
    Button,
    Collapse,
    Divider,
    TextField,
    Grid,
    MenuItem,
    Paper,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@shared/api/maestro.api';
import type { Licencia } from '@entities/licencia/model/types';
import { createLicenciaSchema, type CreateLicenciaSchema } from '../model/schema';
import { useEffect } from 'react';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import { useCreateLicencia, useUpdateLicencia } from '../../hooks/useLicenciaCrud';
import { handleAddressKeyDown } from '@shared/utils/input-validators';

interface LicenciaFormProps {
    open: boolean;
    onClose: () => void;
    colaboradorId: number;
    licenciaToEdit?: Licencia | null;
}

export function LicenciaForm({ open, onClose, colaboradorId, licenciaToEdit }: LicenciaFormProps) {
    const isEdit = !!licenciaToEdit;

    const createMutation = useCreateLicencia();
    const updateMutation = useUpdateLicencia();

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

    const onSubmit = (data: CreateLicenciaSchema) => {
        if (isEdit && licenciaToEdit) {
            updateMutation.mutate(
                { id: licenciaToEdit.colaboradorLicenciaID, data },
                { onSuccess: () => {
                    reset();
                    onClose();
                }}
            );
        } else {
            createMutation.mutate(
                { colaboradorId, data },
                { onSuccess: () => {
                    reset({
                        colaboradorID: colaboradorId,
                        tipoLicenciaID: 0,
                        descripcion: '',
                        fechaInicial: new Date().toISOString().split('T')[0],
                        fechaFinal: ''
                    });
                    onClose();
                }}
            );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ p: 2.5 }}>
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
                                    onKeyDown={handleAddressKeyDown}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose} color="inherit">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                        >
                            {isEdit ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </Box>
        </form>
    );
}
