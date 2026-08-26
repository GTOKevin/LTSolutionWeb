import { ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { FileThumbnail } from '@/shared/components/ui/FileThumbnail';

interface EvidenceGalleryItem {
    url: string;
    alt: string;
}

interface EvidenceGalleryProps {
    items: EvidenceGalleryItem[];
    onPreview: (index: number) => void;
}

export function EvidenceGallery({ items, onPreview }: EvidenceGalleryProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(248, 250, 252, 0.85)',
                p: 1.5,
            }}
        >
            <Stack spacing={1.5}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={0.75}
                >
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}
                        >
                            Evidencias
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Haz clic en una imagen para ampliarla y navegar la galería.
                        </Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                        {items.length} archivo{items.length === 1 ? '' : 's'}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(auto-fill, minmax(84px, 1fr))',
                            md: 'repeat(auto-fill, minmax(96px, 1fr))',
                        },
                        gap: 1.25,
                    }}
                >
                    {items.map((item, index) => (
                        <Box
                            key={`${item.url}-${index}`}
                            onClick={() => onPreview(index)}
                            sx={{
                                aspectRatio: '1 / 1',
                                borderRadius: 2.5,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                cursor: 'zoom-in',
                                position: 'relative',
                                '&:hover .evidence-gallery-overlay': {
                                    opacity: 1,
                                },
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'transform 0.2s ease',
                            }}
                        >
                            <FileThumbnail fileUrl={item.url} alt={item.alt} imageObjectFit="cover" showFileLabel />
                            <Box
                                className="evidence-gallery-overlay"
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    bgcolor: 'rgba(15, 23, 42, 0.34)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                }}
                            >
                                <ZoomInIcon sx={{ color: 'common.white', fontSize: 22 }} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Stack>
        </Box>
    );
}