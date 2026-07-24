import {
    AppBar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
    InputBase,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    ChevronRight as ChevronRightIcon,
    PaletteOutlined as PaletteIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useThemeStore } from '@shared/store/theme.store';
import { DRAWER_WIDTH } from '@widgets/sidebar';
import { useState } from 'react';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';
import { NotificationBell } from './NotificationBell';
import { appThemePresets, getThemePreviewSwatches, orderedAppThemeIds } from '@/shared/config/theme/palette';

interface HeaderAction {
    icon: React.ReactNode;
    onClick: () => void;
}

interface HeaderProps {
    title: string;
    sectionTitle: string;
    mobileAction?: HeaderAction;
}

export function Header({ title, sectionTitle, mobileAction }: HeaderProps) {
    const { themeId, setThemeId } = useThemeStore();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
    const themeMenuOpen = Boolean(themeAnchorEl);
    const themeOptions = orderedAppThemeIds.map((id) => appThemePresets[id]);

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` },
                bgcolor: theme.palette.mode === 'dark' ? '#111418' : '#ffffff', // From design
                borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#283039' : theme.palette.divider}`,
                color: theme.palette.text.primary
            }}
        >
            <Toolbar sx={{ height: 64, px: { xs: 2, md: 3 } }}>
                {/* Mobile Title */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.125rem' }}>
                        {title}
                    </Typography>
                </Box>

                {/* Desktop Breadcrumbs */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.primary.main } }}
                    >
                        Inicio
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.primary.main } }}
                    >
                        {sectionTitle}
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>
                        {title}
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Right Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                    {/* Mobile Add Button */}
                    {mobileAction ? (
                        <IconButton 
                            sx={{ 
                                display: { xs: 'flex', md: 'none' }, 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                            onClick={mobileAction.onClick}
                        >
                            {mobileAction.icon}
                        </IconButton>
                    ) : null}

                    {/* Search Bar (Hidden on Mobile) */}
                    <Box
                        sx={{
                            position: 'relative',
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            bgcolor: theme.palette.mode === 'dark' ? '#1c2127' : '#f6f7f8',
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.mode === 'dark' ? '#3b4754' : theme.palette.divider}`,
                            width: 280,
                            height: 36,
                            px: 1.5,
                            '&:focus-within': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                            }
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                        <InputBase
                            placeholder="Buscar en la plataforma..."
                            sx={{ flex: 1, fontSize: '0.875rem' }}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(handleSanitizeSearchInput(e.target.value));
                            }}
                        />
                        <Box
                            component="span"
                            sx={{
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 0.5,
                                px: 0.5,
                                py: 0.25,
                                lineHeight: 1
                            }}
                        >
                            ⌘K
                        </Box>
                    </Box>

                    {/* Divider */}
                    <Box 
                        sx={{ 
                            height: 24, 
                            width: '1px', 
                            bgcolor: theme.palette.divider,
                            mx: 0.5,
                            display: { xs: 'none', md: 'block' }
                        }} 
                    />

                    {/* Notifications */}
                    <NotificationBell />

                    {/* Theme */}
                    <IconButton
                        onClick={(e) => setThemeAnchorEl(e.currentTarget)}
                        size="small"
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            color: 'text.secondary',
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                        }}
                    >
                        <PaletteIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                    <Menu
                        anchorEl={themeAnchorEl}
                        open={themeMenuOpen}
                        onClose={() => setThemeAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{
                            sx: {
                                width: { xs: 'calc(100vw - 24px)', sm: 340 },
                                maxWidth: 340,
                                mt: 1,
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[4],
                                backgroundColor: theme.palette.background.paper,
                                backgroundImage: 'none',
                                overflow: 'hidden',
                            },
                        }}
                        MenuListProps={{
                            dense: false,
                            sx: {
                                py: 1,
                            },
                        }}
                    >
                        <Box sx={{ px: 2, pt: 1, pb: 1.25 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Temas
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Vista previa de los colores principales del sistema
                            </Typography>
                        </Box>
                        {themeOptions.map((t) => (
                            <MenuItem
                                key={t.id}
                                selected={t.id === themeId}
                                onClick={() => {
                                    setThemeId(t.id);
                                    setThemeAnchorEl(null);
                                }}
                                sx={{
                                    mx: 1,
                                    my: 0.25,
                                    px: 1.25,
                                    py: 0.85,
                                    borderRadius: 2,
                                    alignItems: 'flex-start',
                                    gap: 1,
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 24, mt: 0.4, color: t.id === themeId ? theme.palette.primary.main : 'transparent' }}>
                                    {t.id === themeId ? <CheckIcon fontSize="small" /> : null}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: t.id === themeId ? 700 : 500 }}>
                                                    {t.label}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        px: 0.75,
                                                        py: 0.125,
                                                        borderRadius: 999,
                                                        bgcolor: alpha(t.palette.primary.main, t.mode === 'dark' ? 0.22 : 0.1),
                                                        textTransform: 'capitalize',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {t.mode === 'dark' ? 'Oscuro' : 'Claro'}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    p: 0.75,
                                                    borderRadius: Math.max(1.25, t.shapeBorderRadius / 5),
                                                    border: `1px solid ${alpha(
                                                        t.mode === 'dark' ? '#ffffff' : '#000000',
                                                        t.mode === 'dark' ? 0.16 : 0.08
                                                    )}`,
                                                    bgcolor: t.palette.background.default,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                                                        alignItems: 'center',
                                                        gap: 0.75,
                                                        p: 0.8,
                                                        borderRadius: Math.max(1, t.shapeBorderRadius / 5),
                                                        bgcolor: t.palette.background.paper,
                                                        border: `1px solid ${t.palette.divider}`,
                                                        boxShadow: `0 3px 10px ${alpha('#000000', t.mode === 'dark' ? 0.18 : 0.06)}`,
                                                    }}
                                                >
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: 'block',
                                                                fontWeight: 700,
                                                                color: t.palette.text.primary,
                                                                lineHeight: 1.2,
                                                                mb: 0.35,
                                                            }}
                                                        >
                                                            Vista rapida
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: 'block',
                                                                color: t.palette.text.secondary,
                                                                lineHeight: 1.2,
                                                                fontSize: '0.6875rem',
                                                            }}
                                                        >
                                                            Fondo, texto y acciones
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                        <Box
                                                            sx={{
                                                                px: 0.85,
                                                                py: 0.35,
                                                                borderRadius: 999,
                                                                bgcolor: t.palette.primary.main,
                                                                color: t.palette.primary.contrastText ?? '#ffffff',
                                                                fontSize: '0.625rem',
                                                                fontWeight: 700,
                                                                lineHeight: 1.2,
                                                            }}
                                                        >
                                                            P
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                px: 0.85,
                                                                py: 0.35,
                                                                borderRadius: 999,
                                                                bgcolor: t.palette.secondary.main,
                                                                color: t.palette.secondary.contrastText ?? '#ffffff',
                                                                fontSize: '0.625rem',
                                                                fontWeight: 700,
                                                                lineHeight: 1.2,
                                                            }}
                                                        >
                                                            S
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 0.6 }}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                                                    gap: 0.55,
                                                }}
                                            >
                                                {getThemePreviewSwatches(t).map((swatch) => (
                                                    <Box
                                                        key={`${t.id}-${swatch.label}`}
                                                        title={`${swatch.label}: ${swatch.color}`}
                                                        sx={{
                                                            height: 14,
                                                            borderRadius: 999,
                                                            bgcolor: swatch.color,
                                                            border: `1px solid ${alpha(
                                                                t.mode === 'dark' ? '#ffffff' : '#000000',
                                                                t.mode === 'dark' ? 0.2 : 0.1
                                                            )}`,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    }
                                    secondaryTypographyProps={{
                                        component: 'div',
                                    }}
                                />
                            </MenuItem>
                        ))}
                    </Menu>
                    
                    {/* Mobile Menu Toggle (Moved to right or kept left? Reference doesn't show it in header)
                        If we follow reference strictly, there is no hamburger. But we need navigation.
                        We will keep hamburger but maybe on the right or left. 
                        Let's keep it left for standard UX unless we do bottom nav.
                    */}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
