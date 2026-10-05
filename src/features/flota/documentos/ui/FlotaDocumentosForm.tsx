import {
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    Chip,
    alpha,
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
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                bgcolor: (theme) => {
                                    if (vigencia.chipColor === 'error') return alpha(theme.palette.error.main, 0.1);
                                    if (vigencia.chipColor === 'warning') return alpha(theme.palette.warning.main, 0.1);
                                    return alpha(theme.palette.success.main, 0.1);
                                },
                                border: '1px solid',
                                borderColor: (theme) => {
                                    if (vigencia.chipColor === 'error') return alpha(theme.palette.error.main, 0.3);
                                    if (vigencia.chipColor === 'warning') return alpha(theme.palette.warning.main, 0.3);
                                    return alpha(theme.palette.success.main, 0.3);
                                },
                            }}
                        >
                            <Chip
                                label={vigencia.label}
                                color={vigencia.chipColor}
                                size="small"
                                sx={{ fontWeight: 700 }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                                {vigencia.daysLeft != null
                                    ? vigencia.daysLeft > 0
                                        ? `Vence en ${vigencia.daysLeft} días a partir de hoy`
                                        : `El documento venció hace ${Math.abs(vigencia.daysLeft)} días`
                                    : 'Sin fecha de vencimiento'}
                            </Typography>
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
