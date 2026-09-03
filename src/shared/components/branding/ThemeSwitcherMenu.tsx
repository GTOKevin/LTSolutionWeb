import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    useTheme,
} from '@mui/material';
import { PaletteOutlined as PaletteIcon, Check as CheckIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useThemeStore } from '@/shared/store/theme.store';
import { appThemePresets, orderedAppThemeIds } from '@/shared/config/theme/palette';

/**
 * Selector de tema reutilizable (botón + menú) usado en las pantallas de
 * autenticación. Itera `orderedAppThemeIds` (fuente única de presets).
 */
export function ThemeSwitcherMenu() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { themeId, setThemeId } = useThemeStore();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Seleccionar tema visual">
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                    sx={{
                        color: theme.palette.primary.main,
                        p: 1,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.8)',
                    }}
                >
                    <PaletteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {orderedAppThemeIds.map((id) => {
                    const preset = appThemePresets[id];
                    return (
                        <MenuItem
                            key={preset.id}
                            selected={preset.id === themeId}
                            onClick={() => {
                                setThemeId(preset.id);
                                setAnchorEl(null);
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 34 }}>
                                {preset.id === themeId ? <CheckIcon fontSize="small" /> : null}
                            </ListItemIcon>
                            <ListItemText>{preset.label}</ListItemText>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
