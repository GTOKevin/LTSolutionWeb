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
    PictureAsPdf as PdfIcon,
    OpenInNew as OpenInNewIcon,
    DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { buildInternalFileUrl } from '@/shared/config/env';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';

export interface FacturaDocumentoItemProps {
    /** Ruta del archivo (relativa o absoluta) */
    rutaArchivo?: string | null;
    /** URL ya resuelta si se desea pasar directamente */
    fileUrl?: string | null;
    /** Nombre o título a mostrar para el documento */
    fileName?: string;
    /** Subtítulo descriptivo (por defecto: 'Comprobante Electrónico') */
    subtitle?: string;
    /** Función de callback personalizada para vista previa. Si no se pasa, usa el DocumentPreviewDialog integrado */
    onPreview?: (rutaArchivo: string) => void;
    /** Función de callback para eliminar el archivo */
    onDelete?: () => void;
    /** Determina si el botón de eliminar debe mostrarse */
    canDelete?: boolean;
    /** Texto para el tooltip de ver archivo */
    previewTooltip?: string;
    /** Texto para el tooltip de eliminar */
    deleteTooltip?: string;
    /** Estilos personalizados adicionales para el Paper contenedor */
    sx?: SxProps<Theme>;
}

export function FacturaDocumentoItem({
    rutaArchivo,
    fileUrl: customFileUrl,
    fileName,
    subtitle = 'Comprobante Electrónico',
    onPreview,
    onDelete,
    canDelete = false,
    previewTooltip = 'Ver archivo',
    deleteTooltip = 'Eliminar archivo',
    sx,
}: FacturaDocumentoItemProps) {
    const theme = useTheme();
    const [previewOpen, setPreviewOpen] = useState(false);

    const resolvedFileUrl = customFileUrl ?? (rutaArchivo ? buildInternalFileUrl(rutaArchivo) : null);
    const displayFileName =
        fileName?.trim() ||
        (rutaArchivo ? rutaArchivo.split('/').pop() : 'Documento adjunto');

    const handlePreviewClick = () => {
        if (onPreview && rutaArchivo) {
            onPreview(rutaArchivo);
        } else if (resolvedFileUrl) {
            setPreviewOpen(true);
        }
    };

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
                    <PdfIcon color="error" fontSize="small" sx={{ flexShrink: 0 }} />
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
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {subtitle}
                        </Typography>
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

            {!onPreview && (
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
