import type { SystemStyleObject, Theme } from '@mui/system';

export type PeruvianPlateSize = 'sm' | 'md' | 'lg';

export interface PeruvianPlateSizeConfig {
    width: number;
    height: number;
    padding: string;
    dotSize: number;
    peruFontSize: string;
    plateFontSize: string;
    bandHeight: number;
}

/** Dimensiones y tipografía escaladas por variante de placa. */
export const PERUVIAN_PLATE_SIZE_CONFIG: Record<PeruvianPlateSize, PeruvianPlateSizeConfig> = {
    sm: {
        width: 86,
        height: 25,
        padding: '1px 3px',
        dotSize: 3,
        peruFontSize: '6px',
        plateFontSize: '11px',
        bandHeight: 2,
    },
    md: {
        width: 116,
        height: 34,
        padding: '2px 5px',
        dotSize: 4,
        peruFontSize: '7.5px',
        plateFontSize: '14px',
        bandHeight: 2.5,
    },
    lg: {
        width: 148,
        height: 46,
        padding: '3px 8px',
        dotSize: 5,
        peruFontSize: '9px',
        plateFontSize: '19px',
        bandHeight: 3.5,
    },
};

/** Superficie externa de la placa (fondo, borde, sombras y layout). */
export const peruvianPlateSurfaceSx = (size: PeruvianPlateSize): SystemStyleObject<Theme> => {
    const cfg = PERUVIAN_PLATE_SIZE_CONFIG[size];
    return {
        width: cfg.width,
        height: cfg.height,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 55%, #E2E8F0 100%)',
        borderRadius: '5px',
        border: '1.5px solid #94A3B8',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.18)',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: cfg.padding,
        userSelect: 'none',
        position: 'relative',
        flexShrink: 0,
    };
};

/** Perno metálico lateral. */
export const peruvianPlatePernoSx = (dotSize: number): SystemStyleObject<Theme> => ({
    width: dotSize,
    height: dotSize,
    borderRadius: '50%',
    bgcolor: '#64748B',
    boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.4)',
});

/** Texto "PERÚ" de la franja superior. */
export const peruvianPlatePeruTextSx = (fontSize: string): SystemStyleObject<Theme> => ({
    fontSize,
    fontWeight: 900,
    letterSpacing: '0.18em',
    color: '#334155',
    textTransform: 'uppercase',
    lineHeight: 1,
});

/** Franja reflectiva inferior amarilla oficial. */
export const peruvianPlateStripSx = (bandHeight: number): SystemStyleObject<Theme> => ({
    width: '100%',
    height: bandHeight,
    bgcolor: '#FACC15',
    borderRadius: '1px',
    boxShadow: '0 0.5px 1px rgba(0,0,0,0.15)',
});

/** Matrícula central en fuente monoespaciada en relieve. */
export const peruvianPlateValueSx = (fontSize: string): SystemStyleObject<Theme> => ({
    fontFamily: '"SF Mono", "Roboto Mono", Menlo, Consolas, monospace',
    fontSize,
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 1,
    textShadow: '0 0.5px 0.5px rgba(255,255,255,0.8)',
});
