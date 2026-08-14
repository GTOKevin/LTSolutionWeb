import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    AddPhotoAlternate as AddPhotoIcon,
    DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import { archivoApi } from '@shared/api/archivo.api';
import { buildInternalFileUrl } from '@/shared/config/env';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage } from '@/shared/utils/api-errors';

const DEFAULT_ACCEPT = '.jpg,.jpeg,.png';
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1 MB (limite del backend)

interface MultiFileUploadFieldProps {
    values: string[];
    onChange: (values: string[]) => void;
    folder?: string;
    disabled?: boolean;
    helperText?: string;
    accept?: string;
    minItems?: number;
}

interface UploadTask {
    id: string;
    name: string;
    status: 'uploading' | 'error';
    error?: string;
}

function isAcceptedImageFile(file: File): boolean {
    return (
        /\.(jpe?g|png)$/i.test(file.name)
        || file.type.startsWith('image/jpeg')
        || file.type.startsWith('image/png')
    );
}

export function MultiFileUploadField({
    values,
    onChange,
    folder = 'general',
    disabled = false,
    helperText,
    accept = DEFAULT_ACCEPT,
    minItems = 0,
}: MultiFileUploadFieldProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const valuesRef = useRef(values);
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

    const hasUploadsPending = tasks.some((task) => task.status === 'uploading');

    const previewUrls = useMemo(
        () =>
            values
                .map((value) => buildInternalFileUrl(value))
                .filter((url): url is string => Boolean(url)),
        [values],
    );

    const needsMore = minItems > 0 && values.length < minItems;

    const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) {
            return;
        }

        const uploadTasks: UploadTask[] = files.map((file) => ({
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            status: 'uploading',
        }));
        setTasks(uploadTasks);

        const results = await Promise.all(
            files.map(async (file, index) => {
                const taskId = uploadTasks[index].id;
                try {
                    if (!isAcceptedImageFile(file)) {
                        throw new Error('Solo se permiten imágenes .jpg, .jpeg o .png.');
                    }

                    const options = {
                        maxSizeMB: 0.8, // Menos de 1MB
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        fileType: file.type, // Mantener tipo original
                    };
                    const compressedBlob = await imageCompression(file, options);
                    const compressedFile = new File([compressedBlob], file.name, {
                        type: compressedBlob.type || file.type,
                        lastModified: Date.now(),
                    });

                    if (compressedFile.size > MAX_FILE_SIZE_BYTES) {
                        throw new Error('La imagen supera el tamaño máximo permitido (1 MB).');
                    }

                    const response = await archivoApi.upload(compressedFile, folder);

                    setTasks((current) => current.filter((task) => task.id !== taskId));
                    return { url: response.url };
                } catch (error) {
                    const message = getErrorMessage(error, `No se pudo subir "${file.name}".`);
                    setTasks((current) =>
                        current.map((task) =>
                            task.id === taskId ? { ...task, status: 'error', error: message } : task,
                        ),
                    );
                    showToast({ message, severity: 'error' });
                    return { url: null };
                }
            }),
        );

        const newUrls = results
            .map((result) => result.url)
            .filter((url): url is string => Boolean(url));

        if (newUrls.length > 0) {
            onChange([...valuesRef.current, ...newUrls]);
        }

        event.target.value = '';
    };

    const handleDelete = async (value: string) => {
        try {
            if (value.startsWith('/uploads')) {
                await archivoApi.delete(value);
            }
            onChange(values.filter((item) => item !== value));
        } catch (error) {
            const message = getErrorMessage(error, 'No se pudo eliminar la imagen.');
            showToast({ message, severity: 'error' });
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box
                sx={{
                    border: '1px dashed',
                    borderColor: theme.palette.divider,
                    borderRadius: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: !disabled ? alpha(theme.palette.action.hover, 0.05) : undefined,
                        borderColor: !disabled ? theme.palette.primary.main : undefined,
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {values.length > 0 ? `${values.length} imagen${values.length === 1 ? '' : 'es'} adjunta${values.length === 1 ? '' : 's'}` : 'Sin imágenes adjuntas'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        .jpg / .jpeg / .png — máx. 1 MB por imagen
                    </Typography>
                </Box>

                {tasks.length > 0 && (
                    <Stack spacing={1}>
                        {tasks.map((task) =>
                            task.status === 'error' ? (
                                <Alert
                                    key={task.id}
                                    severity="error"
                                    onClose={() => setTasks((current) => current.filter((item) => item.id !== task.id))}
                                >
                                    {task.error}
                                </Alert>
                            ) : (
                                <Box
                                    key={task.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        bgcolor: 'action.hover',
                                    }}
                                >
                                    <CircularProgress size={16} />
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        Subiendo {task.name}...
                                    </Typography>
                                </Box>
                            ),
                        )}
                    </Stack>
                )}

                {values.length > 0 && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
                            gap: 1.25,
                        }}
                    >
                        {values.map((value, index) => {
                            const imageUrl = buildInternalFileUrl(value);
                            if (!imageUrl) {
                                return null;
                            }

                            return (
                                <Box
                                    key={`${value}-${index}`}
                                    sx={{
                                        position: 'relative',
                                        aspectRatio: '1 / 1',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={imageUrl}
                                        alt={`Imagen ${index + 1}`}
                                        onClick={() => {
                                            setPreviewIndex(index);
                                            setPreviewOpen(true);
                                        }}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                            cursor: 'zoom-in',
                                        }}
                                    />
                                    {!disabled && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(value)}
                                            title="Eliminar imagen"
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                bgcolor: 'rgba(0,0,0,0.55)',
                                                color: 'common.white',
                                                '&:hover': { bgcolor: 'error.main' },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                )}

                {!disabled && (
                    <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={hasUploadsPending ? <CircularProgress size={18} /> : <AddPhotoIcon />}
                        disabled={hasUploadsPending}
                        onClick={() => inputRef.current?.click()}
                    >
                        Agregar imágenes
                    </Button>
                )}

                {needsMore && (
                    <Typography variant="caption" color="text.secondary">
                        Se requieren al menos {minItems} imagen{minItems === 1 ? '' : 'es'}.
                    </Typography>
                )}

                {helperText && (
                    <Typography variant="caption" color="text.secondary">
                        {helperText}
                    </Typography>
                )}
            </Box>

            <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                accept={accept}
                onChange={handleFilesSelected}
            />

            <DocumentPreviewDialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                previewUrl={previewUrls[previewIndex] ?? null}
                previewUrls={previewUrls}
                initialIndex={previewIndex}
            />
        </Box>
    );
}
