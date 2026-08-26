import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    type SxProps,
    type Theme,
} from '@mui/material';
import {
    Description as FileIcon,
    OpenInNew as OpenInNewIcon,
    Download as DownloadIcon,
    DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { buildInternalFileUrl } from '@/shared/config/env';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { FileThumbnail } from '@shared/components/ui/FileThumbnail';
import { downloadFileFromUrl } from '@shared/utils/file-utils';

export interface DocumentListItemProps {
    /** Ruta del archivo (relativa o absoluta) para resolver la URL interna. */
    filePath?: string | null;
    /** URL ya resuelta si se desea pasar directamente. */
    fileUrl?: string | null;
    /** Nombre o título a mostrar para el documento. */
    fileName?: string;
    /** Subtítulo descriptivo (sin default de dominio; no se renderiza si no se provee). */
    subtitle?: string;
    onPreview?: (filePath: string) => void;
    /** URL para la descarga directa de primer nivel. Si se omite, se usa la URL resuelta del documento. */
    downloadUrl?: string | null;
    onDownload?: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
    canDownload?: boolean;
    previewTooltip?: string;
    downloadTooltip?: string;
    deleteTooltip?: string;
    sx?: SxProps<Theme>;
}


export function DocumentListItem({
    filePath,
    fileUrl: customFileUrl,
    fileName,
    subtitle,
    onPreview,
    downloadUrl,
    onDownload,
    onDelete,
    canDelete = false,
    canDownload = true,
    previewTooltip = 'Ver archivo',
    downloadTooltip = 'Descargar archivo',
    deleteTooltip = 'Eliminar archivo',
    sx,
}: DocumentListItemProps) {
    const theme = useTheme();
    const [previewOpen, setPreviewOpen] = useState(false);

    const resolvedFileUrl =
        customFileUrl ?? ((filePath ? buildInternalFileUrl(filePath) : null) || null);
    const displayFileName =
        fileName?.trim() ||
        (filePath ? filePath.split('/').pop() : 'Documento adjunto');

    const handlePreviewClick = () => {
        if (onPreview && filePath) {
            onPreview(filePath);
        } else if (resolvedFileUrl) {
            setPreviewOpen(true);
        }
    };

    const handleDownloadClick = () => {
        if (onDownload) {
            onDownload();
            return;
        }
        const targetUrl = downloadUrl ?? resolvedFileUrl;
        if (targetUrl) {
            void downloadFileFromUrl(targetUrl, displayFileName);
        }
    };

    const showDownload = canDownload && Boolean(onDownload || downloadUrl || resolvedFileUrl);

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 1.25,
                    px: 1.5,
                    borderRadius: 2,
                    borderColor: alpha(theme.palette.divider, 0.8),
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'all 0.15s',
                    '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                    },
                    ...sx,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                    {resolvedFileUrl ? (
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                flexShrink: 0,
                                bgcolor: alpha(theme.palette.action.hover, 0.6),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.6),
                            }}
                        >
                            <FileThumbnail
                                fileUrl={resolvedFileUrl}
                                alt={displayFileName}
                                imageObjectFit="cover"
                                showFileLabel={false}
                                onClick={handlePreviewClick}
                            />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.action.hover, 0.6),
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <FileIcon fontSize="small" />
                        </Box>
                    )}
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            noWrap
                            sx={{
                                fontSize: '0.82rem',
                                color: 'text.primary',
                            }}
                        >
                            {displayFileName}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    {resolvedFileUrl && (
                        <Tooltip title={previewTooltip}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={handlePreviewClick}
                                sx={{ p: 0.6 }}
                            >
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {showDownload && (
                        <Tooltip title={downloadTooltip}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={handleDownloadClick}
                                sx={{ p: 0.6 }}
                            >
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {canDelete && onDelete && (
                        <Tooltip title={deleteTooltip}>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={onDelete}
                                sx={{ p: 0.6 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {!onPreview && previewOpen && resolvedFileUrl && (
                <DocumentPreviewDialog
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    previewUrl={resolvedFileUrl}
                    title={displayFileName}
                />
            )}
        </>
    );
}