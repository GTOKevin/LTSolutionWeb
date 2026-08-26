import { useState } from 'react';
import {
    Box,
    Typography,
    alpha,
    useTheme,
    type SxProps,
    type Theme,
} from '@mui/material';
import {
    Description as FileIcon,
    PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { getFileThumbKind } from '@/shared/utils/file-utils';

interface FileThumbnailProps {
    /** URL completa del archivo (imagen o PDF) a mostrar como miniatura. */
    fileUrl: string;
    /** Texto alternativo para las imágenes. */
    alt?: string;
    /** Estilos extra aplicados al contenedor raíz (ocupa 100% del padre). */
    containerSx?: SxProps<Theme>;
    /** Ajuste de la imagen dentro del contenedor (default: cover). */
    imageObjectFit?: 'cover' | 'contain';
    /** Muestra la etiqueta de tipo de archivo (PDF/DOC) en los badges. */
    showFileLabel?: boolean;
    /** Clase CSS aplicada al <img> (para efectos hover existentes tipo grayscale). */
    className?: string;
    /** Handler de click sobre el contenedor. */
    onClick?: () => void;
}

/**
 * Miniatura de archivo adjunto que distingue por tipo:
 * - Imágenes: <img> real con objectFit configurable; si la carga falla, degrada
 *   a badge genérico en vez de dejar un recuadro vacío.
 * - PDF: badge rojo con PictureAsPdfIcon + etiqueta "PDF".
 * - Otro/desconocido: badge neutro con FileIcon + etiqueta "DOC".
 * Centraliza la representación de miniaturas en listados de documentos.
 */
export function FileThumbnail({
    fileUrl,
    alt = 'Documento',
    containerSx,
    imageObjectFit = 'cover',
    showFileLabel = true,
    className,
    onClick,
}: FileThumbnailProps) {
    const theme = useTheme();
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const kind = getFileThumbKind(fileUrl);

    // Deriva el fallback: si el <img> falla se recuerda la URL exacta, de modo
    // que al cambiar de archivo la nueva imagen vuelve a intentar cargarse.
    const showImage = kind === 'image' && failedUrl !== fileUrl;

    return (
        <Box
            onClick={onClick}
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                ...containerSx,
            }}
        >
            {showImage ? (
                <img
                    className={className}
                    src={fileUrl}
                    alt={alt}
                    onError={() => setFailedUrl(fileUrl)}
                    style={{ width: '100%', height: '100%', objectFit: imageObjectFit, display: 'block' }}
                />
            ) : (
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.25,
                        bgcolor: kind === 'pdf' ? alpha(theme.palette.error.main, 0.1) : 'action.hover',
                        color: kind === 'pdf' ? 'error.main' : 'text.secondary',
                    }}
                >
                    {kind === 'pdf' ? (
                        <PictureAsPdfIcon sx={{ fontSize: 26 }} />
                    ) : (
                        <FileIcon sx={{ fontSize: 26 }} />
                    )}
                    {showFileLabel && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                lineHeight: 1,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}
                        >
                            {kind === 'pdf' ? 'PDF' : 'DOC'}
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}