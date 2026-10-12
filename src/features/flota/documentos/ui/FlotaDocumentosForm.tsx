import { useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Tag as TagIcon,
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon,
    Alarm as AlarmIcon,
    ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createFlotaDocumentoSchema,
    FLOTA_DOCUMENTO_FORM_DEFAULTS,
    type CreateFlotaDocumentoSchema,
} from '../../model/schema';
import { TipoDocumentoSelect } from '@shared/components/ui/TipoDocumentoSelect';
import { FormDatePicker } from '@shared/components/ui/FormDatePicker';
import { ImageUpload } from '@shared/components/ui/ImageUpload';
import { getDocumentVigenciaMetaByExpirationDate } from '@shared/utils/document-vigencia';

interface FlotaDocumentosFormProps {
    defaultValues?: CreateFlotaDocumentoSchema;
    onSubmit: (data: CreateFlotaDocumentoSchema) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    isEditing?: boolean;
    viewOnly?: boolean;
}

function formatRemainingDuration(daysLeft?: number): string {
    if (daysLeft == null) return '';
    if (daysLeft < 0) return `Vencido hace ${Math.abs(daysLeft)} días`;
    if (daysLeft === 0) return 'Vence hoy';

    const years = Math.floor(daysLeft / 365);
    const remainingDays = daysLeft % 365;

    if (years >= 1) {
        if (remainingDays >= 30) {
            const months = Math.floor(remainingDays / 30);
            return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
        }
        return `${years} ${years === 1 ? 'año' : 'años'}`;
    }

    if (daysLeft >= 30) {
        const months = Math.floor(daysLeft / 30);
        return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    return `${daysLeft} días`;
}

export function FlotaDocumentosForm({
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
    isEditing = false,
    viewOnly = false,
}: FlotaDocumentosFormProps) {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(createFlotaDocumentoSchema),
        defaultValues: {
            ...FLOTA_DOCUMENTO_FORM_DEFAULTS,
            ...defaultValues,
        },
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
    const rutaArchivo = useWatch({ control, name: 'rutaArchivo' });

    const vigencia = fechaVencimiento
        ? getDocumentVigenciaMetaByExpirationDate(fechaVencimiento)
        : null;

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            {/* Grid 2x2 de Campos (Stitch Layout) */}
            <Grid container spacing={3}>
                {/* Field 1: Tipo de Documento */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: 'text.primary',
                            }}
                        >
                            Tipo de Documento
                        </Typography>
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.background.default, 0.6)
                                                    : '#f0f3ff',
                                            minHeight: 48,
                                            '& fieldset': {
                                                borderColor: 'transparent',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: (theme) =>
                                                    alpha(theme.palette.primary.main, 0.4),
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Clasificación del documento dentro del legajo de la unidad
                        </Typography>
                    </Box>
                </Grid>

                {/* Field 2: Número de Documento / Póliza */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: 'text.primary',
                            }}
                        >
                            Número de Documento / Póliza
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Ingrese número o código oficial"
                            {...register('numeroDocumento')}
                            error={!!errors.numeroDocumento}
                            helperText={errors.numeroDocumento?.message}
                            disabled={viewOnly}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <TagIcon
                                            sx={{
                                                fontSize: 20,
                                                color: 'text.secondary',
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                    style: {
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                    },
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.default, 0.6)
                                            : '#f0f3ff',
                                    minHeight: 48,
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: (theme) =>
                                            alpha(theme.palette.primary.main, 0.4),
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Código tabular conforme al certificado impreso
                        </Typography>
                    </Box>
                </Grid>

                {/* Field 3: Entidad Emisora */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: 'text.primary',
                            }}
                        >
                            Entidad Emisora
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Ej. Farenet Planta Lima, SUNARP, Rímac Seguros"
                            {...register('entidadEmisora')}
                            error={!!errors.entidadEmisora}
                            helperText={errors.entidadEmisora?.message}
                            disabled={viewOnly}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.default, 0.6)
                                            : '#f0f3ff',
                                    minHeight: 48,
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: (theme) =>
                                            alpha(theme.palette.primary.main, 0.4),
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Organismo emisor o aseguradora que emitió el documento
                        </Typography>
                    </Box>
                </Grid>

                {/* Field 4: Fecha de Emisión */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <FormDatePicker
                            label="Fecha de Emisión"
                            size="medium"
                            registration={register('fechaEmision')}
                            error={!!errors.fechaEmision}
                            helperText={errors.fechaEmision?.message}
                            disabled={viewOnly}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.default, 0.6)
                                            : '#f0f3ff',
                                    minHeight: 48,
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: (theme) =>
                                            alpha(theme.palette.primary.main, 0.4),
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Inicio del período de cobertura registrado
                        </Typography>
                    </Box>
                </Grid>

                {/* Field 5: Fecha de Vencimiento con Semáforo Integrado (Ancho completo) */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                gap: 1.5,
                            }}
                        >
                            <FormDatePicker
                                label="Fecha de Vencimiento"
                                size="medium"
                                registration={register('fechaVencimiento')}
                                error={!!errors.fechaVencimiento}
                                helperText={errors.fechaVencimiento?.message}
                                disabled={viewOnly}
                                sx={{
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? alpha(theme.palette.background.default, 0.6)
                                                : '#f0f3ff',
                                        minHeight: 48,
                                        '& fieldset': {
                                            borderColor: 'transparent',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: (theme) =>
                                                alpha(theme.palette.primary.main, 0.4),
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />

                            {/* Semáforo Integrado Stitch */}
                            {vigencia && vigencia.key !== 'desconocido' ? (
                                <Box
                                    sx={{
                                        minHeight: 48,
                                        px: 2,
                                        borderRadius: 2,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        bgcolor: (theme) => {
                                            if (vigencia.key === 'vencido') return alpha(theme.palette.error.main, 0.12);
                                            if (vigencia.key === 'por_vencer') return alpha(theme.palette.warning.main, 0.15);
                                            return alpha(theme.palette.success.main, 0.15);
                                        },
                                        color: (theme) => {
                                            if (vigencia.key === 'vencido') return theme.palette.error.main;
                                            if (vigencia.key === 'por_vencer') return theme.palette.warning.main;
                                            return theme.palette.success.main;
                                        },
                                        fontWeight: 700,
                                        fontSize: '0.8125rem',
                                        whiteSpace: 'nowrap',
                                        alignSelf: { xs: 'stretch', sm: 'auto' },
                                    }}
                                >
                                    {vigencia.key === 'vencido' ? (
                                        <ErrorIcon sx={{ fontSize: 18 }} />
                                    ) : vigencia.key === 'por_vencer' ? (
                                        <AlarmIcon sx={{ fontSize: 18 }} />
                                    ) : (
                                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                                    )}
                                    <span>
                                        {vigencia.key === 'vencido'
                                            ? `Vencido hace ${Math.abs(vigencia.daysLeft ?? 0)} días • Vencido`
                                            : vigencia.key === 'por_vencer'
                                                ? `Vence en ${vigencia.daysLeft} días • Próximo a vencer`
                                                : `Vigencia restante: ${formatRemainingDuration(vigencia.daysLeft)} • Vigente`}
                                    </span>
                                </Box>
                            ) : null}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Plazo máximo otorgado por el organismo certificador
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Archivo del documento (componente shared ImageUpload: PDF/imagen + preview) */}
            <ImageUpload
                value={rutaArchivo || ''}
                onChange={(url) => setValue('rutaArchivo', url, { shouldDirty: true, shouldValidate: true })}
                folder="flotas"
                label="Archivo del documento (PDF, JPG o PNG)"
                helperText="Formatos permitidos: PDF, JPG o PNG."
                disabled={viewOnly}
                viewOnly={viewOnly}
            />

            {/* Acciones del Formulario Stitch */}
            {!viewOnly && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        pt: 1,
                    }}
                >
                    <Button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        sx={{
                            height: 48,
                            px: 3,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.action.hover, 0.08),
                                color: 'text.primary',
                            },
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || (isEditing && !isDirty)}
                        startIcon={
                            isSubmitting ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <SaveIcon sx={{ fontSize: 20 }} />
                            )}
                        sx={{
                            height: 48,
                            px: 4,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: '#004580',
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0, 69, 128, 0.25)',
                            '&:hover': {
                                bgcolor: '#003360',
                                boxShadow: '0 4px 12px rgba(0, 69, 128, 0.35)',
                            },
                        }}
                    >
                        {isSubmitting
                            ? 'Guardando...'
                            : isEditing
                                ? 'Actualizar Documento'
                                : 'Guardar Documento'}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
