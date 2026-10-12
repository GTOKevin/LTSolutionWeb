import type { ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useBlueprintPalette } from './schematic-utils';

interface SchematicFrameProps {
    tipoNombre?: string | null;
    ejesLabel: string;
    anchoLabel: string;
    altoLabel: string;
    viewBox?: string;
    minWidth?: number;
    maxHeight?: number;
    showDefaultGroundLine?: boolean;
    children: ReactNode;
}

/**
 * Marco blueprint reutilizable: fondo, borde, header técnico, línea de rasante
 * y `viewBox`. No contiene textos funcionales hardcodeados ni ejes: el cuerpo lo
 * aporta cada variante de diagrama.
 */
export function SchematicFrame({
    tipoNombre,
    ejesLabel,
    anchoLabel,
    altoLabel,
    viewBox = '0 0 600 160',
    minWidth = 480,
    maxHeight = 160,
    showDefaultGroundLine = viewBox === '0 0 600 160',
    children,
}: SchematicFrameProps) {
    const theme = useTheme();
    const palette = useBlueprintPalette();

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: palette.blueprintBg,
                p: { xs: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Header del diagrama con etiquetas técnicas */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography
                    variant="caption"
                    sx={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'primary.main',
                        fontSize: '0.75rem',
                    }}
                >
                    ESQUEMA TÉCNICO DIMENSIONAL • {tipoNombre?.toUpperCase() ?? 'UNIDAD'} ({ejesLabel})
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        Ancho: <strong>{anchoLabel}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        Alto: <strong>{altoLabel}</strong>
                    </Typography>
                </Box>
            </Box>

            {/* Gráfico SVG Técnico (Blueprint) */}
            <Box sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
                <svg viewBox={viewBox} width="100%" height="100%" style={{ minWidth, maxHeight, display: 'block' }}>
                    {/* Línea de Suelo / Rasante por defecto (solo para diagramas 600x160) */}
                    {showDefaultGroundLine ? (
                        <line
                            x1="20"
                            y1="135"
                            x2="580"
                            y2="135"
                            stroke={palette.dimension}
                            strokeWidth="1"
                            strokeDasharray="4 2"
                            opacity="0.4"
                        />
                    ) : null}
                    {children}
                </svg>
            </Box>
        </Box>
    );
}
