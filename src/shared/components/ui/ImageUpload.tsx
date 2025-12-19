import { useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Typography,
    alpha,
    useTheme,
    Dialog,
    DialogContent
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import { archivoApi } from '@shared/api/archivo.api';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
    viewOnly?: boolean;
}

const API_URL = import.meta.env.VITE_IMG_URL_BASE || 'https://localhost:44332';

export function ImageUpload({
    value,
    onChange,
    folder = 'general',
    label = 'Imagen',
    error,
    helperText,
    disabled = false,
    viewOnly = false
}: ImageUploadProps) {
    const theme = useTheme();
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            const options = {
                maxSizeMB: 0.8, // Menos de 1MB
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: file.type // Mantener tipo original
            };

            const compressedBlob = await imageCompression(file, options);
            

            const compressedFile = new File([compressedBlob], file.name, {
                type: compressedBlob.type,
                lastModified: Date.now()
            });

            if (value && value.startsWith('/uploads')) {
                await archivoApi.delete(value).catch(console.error);
            }

            const response = await archivoApi.upload(compressedFile, folder);
            onChange(response.data.url);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleDelete = async () => {
        if (!value) return;
        try {
            if (value.startsWith('/uploads')) {
                await archivoApi.delete(value);
            }
            onChange('');
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const getFullUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        const baseUrl = API_URL.replace(/\/api\/?$/, '');
        return `${baseUrl}${path}`;
    };

    const handleDownload = () => {
        if (!value) return;
        const link = document.createElement('a');
        link.href = getFullUrl(value);
        link.target = '_blank';
        link.download = value.split('/').pop() || 'imagen';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box
                sx={{
                    border: `1px dashed ${error ? theme.palette.error.main : theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: !viewOnly && !disabled ? alpha(theme.palette.action.hover, 0.05) : undefined,
                        borderColor: !viewOnly && !disabled ? theme.palette.primary.main : undefined
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color={error ? 'error' : 'text.secondary'} fontWeight={600}>
                        {label}
                    </Typography>
                    {value && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                                size="small" 
                                onClick={() => setPreviewOpen(true)}
                                title="Ver imagen"
                            >
                                <ViewIcon fontSize="small" />
                            </IconButton>
                            {!viewOnly && !disabled && (
                                <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={handleDelete}
                                    title="Eliminar imagen"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    )}
                </Box>

                {value ? (
                    <Box 
                        sx={{ 
                            position: 'relative',
                            width: '100%',
                            height: 150,
                            borderRadius: 1,
                            overflow: 'hidden',
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => setPreviewOpen(true)}
                    >
                        <img 
                            src={getFullUrl(value)} 
                            alt="Preview" 
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%', 
                                objectFit: 'contain' 
                            }} 
                        />
                    </Box>
                ) : (
                    <Box 
                        sx={{ 
                            height: 150,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            color: 'text.secondary',
                            bgcolor: theme.palette.action.hover,
                            borderRadius: 1
                        }}
                    >
                        <ImageIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                        <Typography variant="caption">Sin imagen</Typography>
                    </Box>
                )}

                {!viewOnly && !disabled && (
                    <Button
                        component="label"
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                        disabled={uploading}
                    >
                        {value ? 'Cambiar Imagen' : 'Subir Imagen'}
                        <input
                            type="file"
                            hidden
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                        />
                    </Button>
                )}

                {helperText && (
                    <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                        {helperText}
                    </Typography>
                )}
            </Box>

            {/* Modal de Previsualización */}
            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)}
                maxWidth="lg"
            >
                <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black', display: 'flex', justifyContent: 'center' }}>
                    {value && (
                        <img 
                            src={getFullUrl(value)} 
                            alt="Full preview" 
                            style={{ maxWidth: '100%', maxHeight: '90vh' }} 
                        />
                    )}
                    <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 1 }}>
                         <Button 
                            variant="contained" 
                            color="primary" 
                            size="small"
                            onClick={handleDownload}
                        >
                            Descargar
                        </Button>
                        <Button 
                            variant="contained" 
                            color="inherit" 
                            size="small"
                            onClick={() => setPreviewOpen(false)}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
