import { useBlueprintPalette } from './schematic-utils';

export interface NeumaticoProps {
    /** Coordenada X del centro del neumático */
    cx: number;
    /** Coordenada Y del centro del neumático (por defecto 245) */
    cy?: number;
    /** Radio exterior del neumático en px (por defecto 36, escala estándar CAD) */
    radius?: number;
    /** Mostrar guardabarros / tapabarros superior en arco (por defecto true) */
    showFender?: boolean;
    /** Mostrar soporte superior / amortiguador de suspensión (por defecto true) */
    showSuspension?: boolean;
    /** Color primario de los aros y detalles (por defecto azul según modo claro/oscuro) */
    primaryColor?: string;
    /** Color de contorno exterior (por defecto gris según modo claro/oscuro) */
    outlineColor?: string;
    /** Forzar modo oscuro o claro (si no se define, se toma del tema actual) */
    isDark?: boolean;
}

/**
 * Primitiva gráfica para dibujar un neumático técnico individual de ingeniería (Blueprint CAD).
 * Recibe sus coordenadas (cx, cy) y renderiza 1 única rueda completa con llanta, masa y suspensión.
 */
export function Neumatico({
    cx,
    cy = 245,
    radius = 36,
    showFender = true,
    showSuspension = true,
    primaryColor: primaryProp,
    outlineColor: outlineProp,
    isDark: isDarkProp,
}: NeumaticoProps) {
    const palette = useBlueprintPalette();
    const isDark = isDarkProp ?? palette.isDark;

    const primary = primaryProp ?? (isDark ? '#38BDF8' : '#004580');
    const outline = outlineProp ?? (isDark ? '#64748B' : '#727782');
    const fenderStroke = isDark ? '#38BDF8' : '#263143';

    const scale = radius / 36;
    const rimRadius = radius * (22 / 36);
    const hubRadius = radius * (8 / 36);
    const pinRadius = radius * (3 / 36);

    const rectW = 16 * scale;
    const rectH = 24 * scale;
    const rectX = cx - rectW / 2;
    const rectY = cy - 55 * scale;

    const lineX1 = cx - 10 * scale;
    const lineX2 = cx + 10 * scale;
    const lineY = cy - 43 * scale;

    const fenderR = 42 * scale;
    const arcStartX = cx - 37 * scale;
    const arcEndX = cx + 37 * scale;
    const arcY = cy - 5 * scale;

    return (
        <g>
            {/* Neumático exterior (banda de rodamiento) */}
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="#171c1f"
                stroke={outline}
                strokeWidth={3 * scale}
            />

            {/* Llanta / Aro metálico */}
            <circle
                cx={cx}
                cy={cy}
                r={rimRadius}
                fill={isDark ? '#1E293B' : '#dee8ff'}
                stroke={primary}
                strokeWidth={2 * scale}
            />

            {/* Cubo / masa central */}
            <circle cx={cx} cy={cy} r={hubRadius} fill="#111c2d" />

            {/* Detalle del eje / pin central */}
            <circle cx={cx} cy={cy} r={pinRadius} fill="#ffdad6" />

            {/* Soporte superior de suspensión */}
            {showSuspension && (
                <>
                    <rect
                        x={rectX}
                        y={rectY}
                        width={rectW}
                        height={rectH}
                        rx={3 * scale}
                        fill="#171c1f"
                        stroke={outline}
                        strokeWidth={1 * scale}
                    />
                    <line
                        x1={lineX1}
                        y1={lineY}
                        x2={lineX2}
                        y2={lineY}
                        stroke="#a4c9ff"
                        strokeWidth={1.5 * scale}
                    />
                </>
            )}

            {/* Guardabarros / tapabarros superior */}
            {showFender && (
                <path
                    d={`M ${arcStartX} ${arcY} A ${fenderR} ${fenderR} 0 0 1 ${arcEndX} ${arcY}`}
                    fill="none"
                    stroke={fenderStroke}
                    strokeWidth={3 * scale}
                />
            )}
        </g>
    );
}
