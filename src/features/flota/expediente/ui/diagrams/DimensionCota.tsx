import { useLayoutEffect, useRef, useState } from 'react';

interface DimensionCotaProps {
    orientation: 'horizontal' | 'vertical';
    background?: 'bg' | 'none';
    /** Coordenada inicial sobre el eje de la cota (x si horizontal, y si vertical). */
    start: number;
    /** Coordenada final sobre el eje de la cota (x si horizontal, y si vertical). */
    end: number;
    /** Coordenada perpendicular (y si horizontal, x si vertical) donde vive la cota. */
    cross: number;
    label: string;
    color: string;
    txtColor?: string;
    tickSize?: number;
    labelOffset?: number;
    strokeWidth?: number;
    fontSize?: number;
}

/**
 * Primitiva de acotación reutilizable: línea con flechas, topes y etiqueta.
 * No decide qué se acota ni con qué unidad; eso lo define cada variante.
 */
export function DimensionCota({
    orientation,
    background = 'none',
    start,
    end,
    cross,
    label,
    color,
    txtColor = "black",
    tickSize = 5,
    labelOffset = 6,
    strokeWidth = 1.2,
    fontSize = 10,
}: DimensionCotaProps) {
    const textRef = useRef<SVGTextElement>(null);
    const [textBox, setTextBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    useLayoutEffect(() => {
        if (textRef.current) {
            try {
                const bbox = textRef.current.getBBox();
                setTextBox({
                    x: bbox.x,
                    y: bbox.y,
                    width: bbox.width,
                    height: bbox.height,
                });
            } catch {
                // Salvaguarda para entornos sin soporte nativo de SVG DOM (ej. JSDOM/tests)
            }
        }
    }, [label, fontSize]);

    const isHorizontal = orientation === 'horizontal';
    const mid = (start + end) / 2;
    const arrow = Math.max(3, Math.min(7, Math.abs(end - start) / 4));

    const dimensionLine = isHorizontal
        ? { x1: start, y1: cross, x2: end, y2: cross }
        : { x1: cross, y1: start, x2: cross, y2: end };

    const startTick = isHorizontal
        ? { x1: start, y1: cross - tickSize, x2: start, y2: cross + tickSize }
        : { x1: cross - tickSize, y1: start, x2: cross + tickSize, y2: start };

    const endTick = isHorizontal
        ? { x1: end, y1: cross - tickSize, x2: end, y2: cross + tickSize }
        : { x1: cross - tickSize, y1: end, x2: cross + tickSize, y2: end };

    const startArrow = isHorizontal
        ? `${start + arrow},${cross - 3} ${start},${cross} ${start + arrow},${cross + 3}`
        : `${cross - 3},${start + arrow} ${cross},${start} ${cross + 3},${start + arrow}`;

    const endArrow = isHorizontal
        ? `${end - arrow},${cross - 3} ${end},${cross} ${end - arrow},${cross + 3}`
        : `${cross - 3},${end - arrow} ${cross},${end} ${cross + 3},${end - arrow}`;

    const textX = isHorizontal ? mid : cross + labelOffset + 2;
    const textY = isHorizontal ? cross - labelOffset : mid;
    const textAnchor = isHorizontal ? 'middle' : 'start';

    return (
        <g stroke={color} fill={color} strokeWidth={strokeWidth}>
            <line {...dimensionLine} strokeDasharray="3 3" />
            <line {...startTick} />
            <line {...endTick} />
            <polyline points={startArrow} fill="none" />
            <polyline points={endArrow} fill="none" />
            {background === 'bg' && textBox && (
                <rect
                    x={textBox.x - 2.5}
                    y={textBox.y - 2.5}
                    width={textBox.width + 5}
                    height={textBox.height + 5}
                    rx={2}
                    fill={color}
                    opacity={0.2}
                />
            )}
            <text
                ref={textRef}
                x={textX}
                y={textY}
                fill={txtColor}
                stroke="none"
                fontSize={fontSize}
                fontWeight="700"
                fontFamily="monospace"
                textAnchor={textAnchor}
            >
                {label}
            </text>
        </g>
    );
}
