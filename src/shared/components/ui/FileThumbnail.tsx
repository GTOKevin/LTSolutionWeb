import { useState, type KeyboardEvent } from 'react';
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
    fileUrl: string;
    alt?: string;
    containerSx?: SxProps<Theme>;
    imageObjectFit?: 'cover' | 'contain';
    showFileLabel?: boolean;
    className?: string;
    onClick?: () => void;
}


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

    const showImage = kind === 'image' && failedUrl !== fileUrl;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick?.();
        }
    };

    return (
        <Box
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={onClick ? alt : undefined}
            onClick={onClick}
            onKeyDown={onClick ? handleKeyDown : undefined}
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                ...(onClick ? { cursor: 'pointer' } : {}),
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
