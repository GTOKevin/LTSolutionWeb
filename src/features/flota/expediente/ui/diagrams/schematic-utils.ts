import { alpha, useTheme } from '@mui/material';
import { LENGTH_UNIT_SUFFIX, type LengthUnit } from '@shared/utils/format-utils';

/** Paleta del estilo blueprint técnico, sensible al modo claro/oscuro. */
export interface BlueprintPalette {
    isDark: boolean;
    blueprintBg: string;
    stroke: string;
    chassisFill: string;
    dimension: string;
    wheelFill: string;
    wheelHub: string;
    accent: string;
    deckFill: string;
    /** Trazo primario de estructura/cabina. */
    primary: string;
    /** Relleno sólido primario. */
    primaryFill: string;
    /** Cotas/avisos de riesgo (p. ej. cota de altura, HAZMAT, paragolpes). */
    danger: string;
    /** Fondo de callouts (cajas de leyenda). */
    callout: string;
    /** Texto sobre callouts. */
    calloutText: string;
    /** Estructura metálica oscura. */
    metal: string;
    /** Detalle metálico claro. */
    metalLight: string;
}

export function useBlueprintPalette(): BlueprintPalette {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return {
        isDark,
        blueprintBg: isDark ? alpha('#0F172A', 0.8) : '#F1F5F9',
        stroke: isDark ? '#38BDF8' : '#0284C7',
        chassisFill: isDark ? alpha('#0284C7', 0.4) : alpha('#0284C7', 0.2),
        dimension: isDark ? '#94A3B8' : '#475569',
        wheelFill: isDark ? '#1E293B' : '#334155',
        wheelHub: '#94A3B8',
        accent: '#F59E0B',
        deckFill: isDark ? alpha('#38BDF8', 0.18) : alpha('#0284C7', 0.1),
        primary: isDark ? '#38BDF8' : '#004580',
        primaryFill: isDark ? '#0284C7' : '#004580',
        danger: isDark ? '#FF8A8A' : '#ba1a1a',
        callout: '#713300',
        calloutText: '#ffffff',
        metal: isDark ? '#0F172A' : '#263143',
        metalLight: isDark ? '#38BDF8' : '#a4c9ff',
    };
}

/** Formatea una dimensión en la unidad del catálogo MEDIDA; `—` si falta el dato. */
export function formatLengthValue(value: number | null | undefined, unit?: LengthUnit): string {
    if (value == null || !Number.isFinite(Number(value))) {
        return '—';
    }

    const suffix = unit ? ` ${LENGTH_UNIT_SUFFIX[unit]}` : '';
    return `${Number(value).toFixed(2)}${suffix}`;
}

/** Distribuye `count` ejes de forma equiespaciada entre `startX` y `endX`. */
export function distributeAxles(count: number, startX: number, endX: number): number[] {
    if (count <= 0) {
        return [];
    }
    if (count === 1) {
        return [(startX + endX) / 2];
    }

    const step = (endX - startX) / (count - 1);
    return Array.from({ length: count }, (_, index) => startX + step * index);
}
