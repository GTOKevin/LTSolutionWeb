import { ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { FileThumbnail } from '@/shared/components/ui/FileThumbnail';

interface DocumentPreviewCardProps {
    previewUrl: string;
    alt: string;
    buttonLabel?: string;
    onPreview: () => void;
}

export function DocumentPreviewCard({
    previewUrl,
    alt,
    buttonLabel = 'Abrir vista previa',
    onPreview,
}: DocumentPreviewCardProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', pt: 0.5 }}>
            <Box
                onClick={onPreview}
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'zoom-in',
                    position: 'relative',
                    '&:hover .employee-viaje-preview-overlay': {
                        opacity: 1,
                    },
                }}
            >
                <FileThumbnail fileUrl={previewUrl} alt={alt} imageObjectFit="cover" showFileLabel />
                <Box
                    className="employee-viaje-preview-overlay"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                    }}
                >
                    <ZoomInIcon sx={{ color: 'common.white', fontSize: 20 }} />
                </Box>
            </Box>
            <Button size="small" variant="outlined" onClick={onPreview}>
                {buttonLabel}
            </Button>
        </Box>
    );
}
