import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Tag as TagIcon,
    CalendarToday as CalendarTodayIcon,
    EventRepeat as EventRepeatIcon,
    PictureAsPdf as PdfIcon,
    Verified as VerifiedIcon,
    SwapHoriz as SwapHorizIcon,
    DeleteOutline as DeleteIcon,
    UploadFile as UploadFileIcon,
    Visibility as ViewIcon,
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon,
    Alarm as AlarmIcon,
    ErrorOutline as ErrorIcon,
    Description as FileDefaultIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import imageCompression from 'browser-image-compression';
import {
    createFlotaDocumentoSchema,
    FLOTA_DOCUMENTO_FORM_DEFAULTS,
    type CreateFlotaDocumentoSchema,
} from '../../model/schema';
import { TipoDocumentoSelect } from '@shared/components/ui/TipoDocumentoSelect';
import { archivoApi } from '@shared/api/archivo.api';
import { buildInternalFileUrl } from '@/shared/config/env';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage } from '@/shared/utils/api-errors';
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

function getFileNameFromPath(path?: string): string {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1] || 'documento_cargado.pdf';
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
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
            let fileToUpload: File = file;

            if (!isPdf) {
                const options = {
                    maxSizeMB: 0.8,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: file.type,
                };
                const compressedBlob = await imageCompression(file, options);
                fileToUpload = new File([compressedBlob], file.name, {
                    type: compressedBlob.type,
                    lastModified: Date.now(),
                });
            }

            const response = await archivoApi.upload(fileToUpload, 'flotas');
            setValue('rutaArchivo', response.url, { shouldDirty: true, shouldValidate: true });
            showToast({ message: 'Documento cargado correctamente', severity: 'success' });
        } catch (error) {
            const message = getErrorMessage(error, 'No se pudo subir el archivo.');
            showToast({ message, severity: 'error' });
        } finally {
            setUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    const handleRemoveFile = async () => {
        setValue('rutaArchivo', '', { shouldDirty: true, shouldValidate: true });
        showToast({ message: 'Archivo desvinculado', severity: 'info' });
    };

    const isPdfFile =
        Boolean(rutaArchivo && /\.pdf$/i.test(rutaArchivo)) ||
        Boolean(rutaArchivo && rutaArchivo.toLowerCase().includes('pdf'));

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
                            Requerido por la SUTRAN para unidades en tránsito interprovincial
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
                            Organismo emisor o aseguradora autorizada por el MTC
                        </Typography>
                    </Box>
                </Grid>

                {/* Field 4: Fecha de Emisión */}
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
                            Fecha de Emisión
                        </Typography>
                        <TextField
                            fullWidth
                            type="date"
                            {...register('fechaEmision')}
                            error={!!errors.fechaEmision}
                            helperText={errors.fechaEmision?.message}
                            disabled={viewOnly}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <CalendarTodayIcon
                                            sx={{
                                                fontSize: 20,
                                                color: 'text.secondary',
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                    style: {
                                        fontFamily: 'monospace',
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
                            Inicio del período de cobertura reglamentaria
                        </Typography>
                    </Box>
                </Grid>

                {/* Field 5: Fecha de Vencimiento con Semáforo Integrado (Ancho completo) */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: 'text.primary',
                            }}
                        >
                            Fecha de Vencimiento
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                gap: 1.5,
                            }}
                        >
                            <TextField
                                fullWidth
                                type="date"
                                {...register('fechaVencimiento')}
                                error={!!errors.fechaVencimiento}
                                helperText={errors.fechaVencimiento?.message}
                                disabled={viewOnly}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <EventRepeatIcon
                                                sx={{
                                                    fontSize: 20,
                                                    color: 'text.secondary',
                                                    mr: 1,
                                                }}
                                            />
                                        ),
                                        style: {
                                            fontFamily: 'monospace',
                                        },
                                    },
                                }}
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

            {/* Dropzone Panorámico Stitch (Loaded File Card Preview / Dropzone) */}
            <Box
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.default, 0.5)
                            : '#f0f3ff',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                {rutaArchivo ? (
                    /* Tarjeta de Archivo Cargado Stitch */
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: theme.palette.background.paper,
                            p: 1.5,
                            borderRadius: 2,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            width: { xs: '100%', md: 'auto' },
                            minWidth: { md: 340 },
                        }}
                    >
                        <Box
                            onClick={() => setPreviewUrl(buildInternalFileUrl(rutaArchivo) || null)}
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: isPdfFile
                                    ? alpha(theme.palette.error.main, 0.12)
                                    : alpha(theme.palette.primary.main, 0.12),
                                color: isPdfFile ? 'error.main' : 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shrink: 0,
                                cursor: 'pointer',
                            }}
                        >
                            {isPdfFile ? (
                                <PdfIcon sx={{ fontSize: 24 }} />
                            ) : (
                                <FileDefaultIcon sx={{ fontSize: 24 }} />
                            )}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    noWrap
                                    title={getFileNameFromPath(rutaArchivo)}
                                    sx={{ color: 'text.primary' }}
                                >
                                    {getFileNameFromPath(rutaArchivo)}
                                </Typography>
                                <VerifiedIcon sx={{ fontSize: 16, color: 'success.main', shrink: 0 }} />
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontFamily: 'monospace',
                                    color: 'text.secondary',
                                    display: 'block',
                                    fontSize: '0.75rem',
                                }}
                            >
                                Archivo digital verificado • Repositorio pericial
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                                size="small"
                                onClick={() => setPreviewUrl(buildInternalFileUrl(rutaArchivo) || null)}
                                title="Ver archivo"
                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                            >
                                <ViewIcon fontSize="small" />
                            </IconButton>
                            {!viewOnly && (
                                <>
                                    <IconButton
                                        size="small"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Reemplazar archivo"
                                        disabled={uploading}
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                    >
                                        <SwapHorizIcon fontSize="small" />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>
                ) : (
                    /* Texto Informativo Stitch cuando no hay archivo */
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                            Formatos permitidos: PDF, JPG o PNG de alta resolución
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                            Tamaño máximo 5 MB. El archivo queda encriptado en el repositorio pericial de EURO TRANSPORT.
                        </Typography>
                    </Box>
                )}

                {/* Botón de Carga de Archivo */}
                {!viewOnly && (
                    <Box sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <Button
                            variant="contained"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            startIcon={
                                uploading ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <UploadFileIcon sx={{ fontSize: 20 }} />
                                )
                            }
                            sx={{
                                height: 48,
                                px: 3,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.primary.main, 0.2)
                                        : '#d8e3fb',
                                color: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? theme.palette.primary.light
                                        : '#004580',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.primary.main, 0.3)
                                            : '#c3d5f8',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {uploading
                                ? 'Subiendo Archivo...'
                                : rutaArchivo
                                    ? 'Cargar Otro Archivo'
                                    : 'Cargar Nuevo Archivo'}
                        </Button>
                    </Box>
                )}
            </Box>

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
                        disabled={isSubmitting || uploading}
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
                        disabled={isSubmitting || uploading || (isEditing && !isDirty)}
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

            {/* Modal de Previsualización de Archivo */}
            <DocumentPreviewDialog
                open={!!previewUrl}
                onClose={() => setPreviewUrl(null)}
                previewUrl={previewUrl}
            />
        </Box>
    );
}
