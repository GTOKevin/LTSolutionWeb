import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const portalFilterPanelSx: SxProps<Theme> = {
    borderRadius: 4,
    border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 18px 30px -28px rgba(15, 23, 42, 0.24)',
    p: { xs: 2, md: 3 },
};

export const portalFilterPanelFlatSx: SxProps<Theme> = {
    borderRadius: 3,
    backgroundColor: 'action.hover',
    p: { xs: 2, md: 3 },
};

export const portalTableContainerSx: SxProps<Theme> = {
    borderRadius: 4,
    border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
    boxShadow: 'none',
    overflow: 'hidden',
};

export const portalTableContainerFlatSx: SxProps<Theme> = {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    overflow: 'hidden',
};

export const portalTableHeaderSx: SxProps<Theme> = {
    backgroundColor: (theme) => theme.palette.grey[100],
    color: 'text.secondary',
    fontWeight: 800,
    letterSpacing: 1.1,
};

export const portalTableHeaderFlatSx: SxProps<Theme> = {
    backgroundColor: 'action.hover',
    color: 'text.secondary',
    fontWeight: 800,
    letterSpacing: '0.1em',
    py: 2.5,
};
