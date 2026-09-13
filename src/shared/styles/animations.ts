/**
 * Animaciones compartidas (M5): un unico `@keyframes spin` reutilizable para
 * que los indicadores de recarga no definan el keyframe por instancia.
 */
export const spinKeyframes = {
    '@keyframes shared-spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
} as const;

export const SPIN_ANIMATION = 'shared-spin 1s linear infinite';
