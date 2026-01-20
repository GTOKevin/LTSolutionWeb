import {
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFlotaDocumentoSchema, type CreateFlotaDocumentoSchema } from '../../model/schema';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { TipoDocumentoSelect } from '@shared/components/ui/TipoDocumentoSelect';
import { useEffect } from 'react';

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
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(createFlotaDocumentoSchema),
        defaultValues: {
            tipoDocumentoID: 0,
            numeroDocumento: '',
            rutaArchivo: '',
            fechaEmision: '',
            fechaVencimiento: '',
            activo: true,
            ...defaultValues
        }
    });

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    return (
        <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)} 
            sx={{ 
                p: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5)
            }}
        >
            <Typography variant="subtitle1" sx={{ mb: 3, color: 'primary.main', fontWeight: 700 }}>
                {isEditing ? 'Editar Documento' : 'Nuevo Documento'}
            </Typography>
            
            <Grid container spacing={3}>
                <Grid size={{xs:12,md:6}}>
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
                <Grid size={{xs:12,md:6}}>
                    <TextField
                        label="Número Documento"
                        fullWidth
                        {...register('numeroDocumento')}
                        error={!!errors.numeroDocumento}
                        helperText={errors.numeroDocumento?.message}
                        disabled={viewOnly}
                    />
                </Grid>
                <Grid size={{xs:12,md:6}}>
                    <TextField
                        label="Fecha Emisión"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        {...register('fechaEmision')}
                        error={!!errors.fechaEmision}
                        helperText={errors.fechaEmision?.message}
                        disabled={viewOnly}
                    />
                </Grid>
                <Grid size={{xs:12,md:6}}>
                    <TextField
                        label="Fecha Vencimiento"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        {...register('fechaVencimiento')}
                        error={!!errors.fechaVencimiento}
                        helperText={errors.fechaVencimiento?.message}
                        disabled={viewOnly}
                    />
                </Grid>
                
                <Grid size={{xs:12}}>
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
                                label="Subir imagen del documento"
                                error={!!errors.rutaArchivo}
                                helperText={errors.rutaArchivo?.message}
                                viewOnly={viewOnly}
                            />
                        )}
                    />
                </Grid>

                {!viewOnly && (
                    <Grid size={{xs:12}}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button 
                                onClick={onCancel} 
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
