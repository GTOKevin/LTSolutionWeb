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
import { useQuery } from '@tanstack/react-query';
import { tipoDocumentoApi } from '@entities/tipo-documento/api/tipo-documento.api';
import type { ColaboradorDocumento } from '@entities/colaborador-documento/model/types';
import { createColaboradorDocumentoSchema, type CreateColaboradorDocumentoSchema } from '../model/schema';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { useEffect } from 'react';
import { useCreateColaboradorDocumento, useUpdateColaboradorDocumento } from '../../hooks/useColaboradorDocumentoCrud';
import { handleAlphaNumericHyphenNoSpacesKeyDown } from '@shared/utils/input-validators';

interface ColaboradorDocumentoFormProps {
    open: boolean;
    onClose: () => void;
    colaboradorId: number;
    documentoToEdit?: ColaboradorDocumento | null;
}

export function ColaboradorDocumentoForm({ open, onClose, colaboradorId, documentoToEdit }: ColaboradorDocumentoFormProps) {
    const theme = useTheme();
    const isEdit = !!documentoToEdit;

    const createMutation = useCreateColaboradorDocumento();
    const updateMutation = useUpdateColaboradorDocumento();

    // Queries
    const { data: tiposDocumento } = useQuery({
        queryKey: ['tipos-documento-colaborador'],
        queryFn: () => tipoDocumentoApi.getSelect(undefined, 'COLABORADOR'),
        enabled: open
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(createColaboradorDocumentoSchema),
        defaultValues: {
            colaboradorID: colaboradorId,
            estado: true
        }
    });

    useEffect(() => {
        if (open) {
            if (documentoToEdit) {
                reset({
                    colaboradorID: colaboradorId,
                    tipoDocumentoID: documentoToEdit.tipoDocumentoID,
                    numeroDocumento: documentoToEdit.numeroDocumento || '',
                    rutaArchivo: documentoToEdit.rutaArchivo || '',
                    fechaEmision: documentoToEdit.fechaEmision || '',
                    fechaVencimiento: documentoToEdit.fechaVencimiento || '',
                    estado: documentoToEdit.estado
                });
            } else {
                reset({
                    colaboradorID: colaboradorId,
                    tipoDocumentoID: 0,
                    numeroDocumento: '',
                    rutaArchivo: '',
                    fechaEmision: '',
                    fechaVencimiento: '',
                    estado: true
                });
            }
        }
    }, [open, documentoToEdit, colaboradorId, reset]);

    const onSubmit = (data: CreateColaboradorDocumentoSchema) => {
        if (isEdit && documentoToEdit) {
            updateMutation.mutate(
                { id: documentoToEdit.colaboradorDocumentoID, data },
                { onSuccess: () => onClose() }
            );
        } else {
            createMutation.mutate(
                { colaboradorId, data },
                { onSuccess: () => onClose() }
            );
        }
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
                    {isEdit ? 'Editar Documento' : 'Nuevo Documento'}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid  size={{xs:12}}>
                            <Controller
                                name="tipoDocumentoID"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label="Tipo de Documento"
                                        fullWidth
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        value={field.value || 0}
                                        error={!!errors.tipoDocumentoID}
                                        helperText={errors.tipoDocumentoID?.message}
                                    >
                                        <MenuItem value={0} disabled>Seleccione</MenuItem>
                                        {tiposDocumento?.data?.map((t) => (
                                            <MenuItem key={t.id} value={t.id}>
                                                {t.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <TextField
                                label="Número de Documento"
                                fullWidth
                                {...register('numeroDocumento')}
                                error={!!errors.numeroDocumento}
                                helperText={errors.numeroDocumento?.message}
                                onKeyDown={handleAlphaNumericHyphenNoSpacesKeyDown}
                            />
                        </Grid>

                        <Grid size={{xs:12,sm:6}}>
                            <TextField
                                label="Fecha Emisión"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...register('fechaEmision')}
                                error={!!errors.fechaEmision}
                                helperText={errors.fechaEmision?.message}
                            />
                        </Grid>

                        <Grid size={{xs:12,sm:6}}>
                            <TextField
                                label="Fecha Vencimiento"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...register('fechaVencimiento')}
                                error={!!errors.fechaVencimiento}
                                helperText={errors.fechaVencimiento?.message}
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
                                        folder="temp/documentos/colaborador"
                                        label="Subir imagen del documento"
                                        error={!!errors.rutaArchivo}
                                        helperText={errors.rutaArchivo?.message}
                                    />
                                )}
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
                        disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                    >
                        {isEdit ? 'Guardar Cambios' : 'Registrar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
