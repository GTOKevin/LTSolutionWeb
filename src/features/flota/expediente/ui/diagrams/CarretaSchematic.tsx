import type { LengthUnit } from '@shared/utils/format-utils';
import { DimensionCota } from './DimensionCota';
import { distributeAxles, formatLengthValue, useBlueprintPalette } from './schematic-utils';
import { Neumatico } from './Neumatico';

interface CarretaSchematicProps {
    label: string;
    largo?: number | null;
    alto?: number | null;
    ejes?: number | null;
    camaUtil?: number | null;
    lengthUnit?: LengthUnit;
}

/**
 * Carreta tipo cama baja / cama cuna (vista lateral, plataforma rebajada).
 * Comparten forma; incluye la cota de Cama Útil cuando el dato existe.
 */
export function CarretaSchematic({ label, largo, alto, ejes, camaUtil, lengthUnit }: CarretaSchematicProps) {
    const palette = useBlueprintPalette();
    // Sin dato de ejes no se dibuja tren rodante (evita inventar un trídem).
    const axleCount = ejes && ejes > 0 ? ejes : 0;
    const axlePositions = distributeAxles(axleCount, 460, 545);

    return (
        <g>
            {/* Cota de longitud total */}
            <DimensionCota
                orientation="horizontal"
                start={35}
                end={575}
                cross={20}
                label={`LONGITUD TOTAL: ${formatLengthValue(largo, lengthUnit)}`}
                color={palette.dimension}
            />

            {/* Carrocería rebajada */}
            <path
                d="M 35,55 L 120,55 L 145,90 L 430,90 L 450,80 L 565,80 L 565,102 L 440,102 L 420,112 L 140,112 L 120,78 L 35,78 Z"
                fill={palette.chassisFill}
                stroke={palette.stroke}
                strokeWidth="2"
            />
            {/* Superficie de carga */}
            <line x1="145" y1="88" x2="430" y2="88" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />

            {/* Acople cuello de ganso / king pin */}
            <circle cx="65" cy="85" r="4.5" fill={palette.accent} />
            <line x1="65" y1="85" x2="65" y2="95" stroke={palette.accent} strokeWidth="2" />
            <text x="95" y="90" fill={palette.dimension} fontSize="8.5" fontFamily="monospace" textAnchor="middle">
                KING PIN
            </text>

            {/* Cota de altura de plataforma */}
            <DimensionCota
                orientation="vertical"
                start={55}
                end={135}
                cross={12}
                label={formatLengthValue(alto, lengthUnit)}
                color={palette.dimension}
            />

            {/* Cota de Cama Útil (solo cama baja / cama cuna / plataforma) */}
            {camaUtil != null ? (
                <DimensionCota
                    orientation="horizontal"
                    start={150}
                    end={425}
                    cross={80}
                    label={`CAMA ÚTIL: ${formatLengthValue(camaUtil, lengthUnit)}`}
                    color={palette.accent}
                />
            ) : null}


            {axlePositions.map((pos) => (
                <Neumatico key={pos} cx={pos} cy={120} radius={15} />
            ))}


            <text x="285" y="50" fill={palette.stroke} fontSize="9" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                {label} - IMAGEN REFERENCIAL
            </text>
        </g>
    );
}
