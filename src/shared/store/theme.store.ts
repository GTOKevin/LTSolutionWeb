import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appThemePresets, type AppThemeId } from '../config/theme/palette';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    themeId: AppThemeId;
    mode: ThemeMode;

    setThemeId: (themeId: AppThemeId) => void;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
    cycleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeId: 'logistica_light',
            mode: 'light',

            setThemeId: (themeId: AppThemeId) =>
                set({
                    themeId,
                    mode: appThemePresets[themeId].mode,
                }),

            setMode: (mode: ThemeMode) =>
                set((state) => {
                    if (state.mode === mode) return state;

                    if (state.themeId === 'logistica_light' || state.themeId === 'logistica_dark') {
                        return {
                            themeId: mode === 'dark' ? 'logistica_dark' : 'logistica_light',
                            mode,
                        };
                    }

                    return {
                        themeId: mode === 'dark' ? 'midnight_tech' : 'nordic_ice',
                        mode,
                    };
                }),

            toggleMode: () =>
                set((state) => {
                    const nextMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';

                    if (state.themeId === 'logistica_light' || state.themeId === 'logistica_dark') {
                        return {
                            themeId: nextMode === 'dark' ? 'logistica_dark' : 'logistica_light',
                            mode: nextMode,
                        };
                    }

                    return {
                        themeId: nextMode === 'dark' ? 'midnight_tech' : 'nordic_ice',
                        mode: nextMode,
                    };
                }),

            cycleTheme: () =>
                set((state) => {
                    const order: AppThemeId[] = [
                        'logistica_light',
                        'logistica_dark',
                        'midnight_tech',
                        'nordic_ice',
                        'sunset_express',
                    ];
                    const currentIndex = order.indexOf(state.themeId);
                    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % order.length : 0;
                    const themeId = order[nextIndex];
                    return { themeId, mode: appThemePresets[themeId].mode };
                }),
        }),
        {
            name: 'theme-storage',
        }
    )
);
