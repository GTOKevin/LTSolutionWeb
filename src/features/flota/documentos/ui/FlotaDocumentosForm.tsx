import {
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    Chip
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createFlotaDocumentoSchema,
    FLOTA_DOCUMENTO_FORM_DEFAULTS,
    type CreateFlotaDocumentoSchema,
} from '../../model/schema';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { TipoDocumentoSelect } from '@shared/components/ui/TipoDocumentoSelect';
import { FormDatePicker } from '@shared/components/ui/FormDatePicker';
import { useEffect } from 'react';
import { getDocumentVigenciaMetaByExpirationDate } from '@shared/utils/document-vigencia';

interface FlotaDocumentosFormProps {
    defaultValues?: CreateFlotaDocumentoSchema;
    onSubmit: (data: CreateFlotaDocumentoSchema) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    isEditing?: boolean;
    viewOnly?: boolean;
}

export function FlotaDocumentosForm({
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
    isEditing = false,
    viewOnly = false
}: FlotaDocumentosFormProps) {

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(createFlotaDocumentoSchema),
        defaultValues: {
            ...FLOTA_DOCUMENTO_FORM_DEFAULTS,
            ...defaultValues
        }
    });

    useEffect(() => {
        reset({
            ...FLOTA_DOCUMENTO_FORM_DEFAULTS,
            ...(defaultValues ?? {}),
        });
    }, [defaultValues, reset]);

    const handleCancel = () => {
        reset(FLOTA_DOCUMENTO_FORM_DEFAULTS);
        onCancel();
    };

    const fechaVencimiento = useWatch({ control, name: 'fechaVencimiento' });
    const vigencia = fechaVencimiento
        ? getDocumentVigenciaMetaByExpirationDate(fechaVencimiento)
        : null;

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                p: 3
            }}
        >
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                        name="tipoDocumentoID"
                        control={control}
                        render={({ field }) => (
                            <TipoDocumentoSelect
                                value={field.value as number}
                                onChange={field.onChange}
                                error={!!errors.tipoDocumentoID}
                                helperText={errors.tipoDocumentoID?.message}
                                disabled={viewOnly}
                                seccion="Flota"
                            />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Número Documento"
                        fullWidth
                        {...register('numeroDocumento')}
                        error={!!errors.numeroDocumento}
                        helperText={errors.numeroDocumento?.message}
                        disabled={viewOnly}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Entidad Emisora"
                        fullWidth
                        {...register('entidadEmisora')}
                        error={!!errors.entidadEmisora}
                        helperText={errors.entidadEmisora?.message}
                        disabled={viewOnly}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormDatePicker
                        label="Fecha Emisión"
                        registration={register('fechaEmision')}
                        error={!!errors.fechaEmision}
                        helperText={errors.fechaEmision?.message}
                        disabled={viewOnly}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormDatePicker
                        label="Fecha Vencimiento"
                        registration={register('fechaVencimiento')}
                        error={!!errors.fechaVencimiento}
                        helperText={errors.fechaVencimiento?.message}
                        disabled={viewOnly}
                    />
                </Grid>
                {vigencia && vigencia.key !== 'desconocido' && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                            <Typography variant="body2" color="text.secondary">
                                Vigencia:
                            </Typography>
                            <Chip
                                label={vigencia.label}
                                color={vigencia.chipColor}
                                size="small"
                                variant={vigencia.chipColor === 'default' ? 'outlined' : 'filled'}
                            />
                            {vigencia.daysLeft != null && (
                                <Typography variant="caption" color="text.secondary">
                                    ({vigencia.daysLeft} días)
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Archivo Adjunto
                    </Typography>
                    <Controller
                        name="rutaArchivo"
                        control={control}
                        render={({ field }) => (
                            <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                folder="flotas"
                                label="Subir archivo del documento (JPG, PNG o PDF)"
                                error={!!errors.rutaArchivo}
                                helperText={errors.rutaArchivo?.message}
                                viewOnly={viewOnly}
                            />
                        )}
                    />
                </Grid>

                {!viewOnly && (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button
                                onClick={handleCancel}
                                variant="outlined"
                                color="inherit"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting || (isEditing && !isDirty)}
                            >
                                {isEditing ? 'Actualizar' : 'Guardar'}
                            </Button>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
