import { useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { DescriptionOutlined as DescriptionOutlinedIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FacturaDocumento } from '@/entities/factura-documento/model/types';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { useCreateFacturaDocumento, useUpdateFacturaDocumento } from '../hooks/useFacturaDocumentoCrud';
import {
    buildFacturaDocumentoDefaultValues,
    createFacturaDocumentoSchema,
    mapFacturaDocumentoToFormValues,
    type CreateFacturaDocumentoSchema,
} from '../model/schema';

interface FacturaDocumentoFormProps {
    open: boolean;
    onClose: () => void;
    facturaId: number;
    documentoToEdit?: FacturaDocumento | null;
}

export function FacturaDocumentoForm({ open, onClose, facturaId, documentoToEdit }: FacturaDocumentoFormProps) {
    const theme = useTheme();
    const isEdit = !!documentoToEdit;

    const createMutation = useCreateFacturaDocumento();
    const updateMutation = useUpdateFacturaDocumento();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateFacturaDocumentoSchema>({
        resolver: zodResolver(createFacturaDocumentoSchema),
        defaultValues: buildFacturaDocumentoDefaultValues(facturaId),
    });

    useEffect(() => {
        if (open) {
            reset(documentoToEdit ? mapFacturaDocumentoToFormValues(documentoToEdit) : buildFacturaDocumentoDefaultValues(facturaId));
        }
    }, [open, documentoToEdit, facturaId, reset]);

    const onSubmit = (data: CreateFacturaDocumentoSchema) => {
        const payload = {
            facturaID: facturaId,
            descripcion: data.descripcion?.trim() || undefined,
            rutaArchivo: data.rutaArchivo,
        };

        if (isEdit && documentoToEdit) {
            updateMutation.mutate(
                { id: documentoToEdit.facturaDocumentoID, data: { descripcion: payload.descripcion, rutaArchivo: payload.rutaArchivo } },
                { onSuccess: () => { reset(buildFacturaDocumentoDefaultValues(facturaId)); onClose(); } },
            );
        } else {
            createMutation.mutate(
                { facturaId, data: payload },
                { onSuccess: () => { reset(buildFacturaDocumentoDefaultValues(facturaId)); onClose(); } },
            );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === 'backdropClick') return;
                onClose();
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, boxShadow: '0 24px 40px -12px rgba(25, 28, 29, 0.06)' }
            }}
        >
            <DialogTitle sx={{
                p: 3,
                pb: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}>
                <DescriptionOutlinedIcon color="primary" />
                <Typography component="span" variant="h6" fontWeight="bold">
                    {isEdit ? 'Editar Documento' : 'Agregar Documento'}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box component="form" id="factura-documento-form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Controller
                        name="rutaArchivo"
                        control={control}
                        render={({ field }) => (
                            <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                folder="facturas"
                                label="Subir archivo de la factura (JPG, PNG o PDF)"
                                error={!!errors.rutaArchivo}
                                helperText={errors.rutaArchivo?.message}
                            />
                        )}
                    />

                    <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Descripción (opcional)"
                                fullWidth
                                multiline
                                rows={3}
                                error={!!errors.descripcion}
                                helperText={errors.descripcion?.message}
                                sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                            />
                        )}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2, px: 3 }}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    form="factura-documento-form"
                    variant="contained"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Registrar')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}