import type { LengthUnit } from '@shared/utils/format-utils';
import { DimensionCota } from './DimensionCota';
import { distributeAxles, formatLengthValue, useBlueprintPalette } from './schematic-utils';
import { Neumatico } from './Neumatico';

interface CamionetaSchematicProps {
    largo?: number | null;
    alto?: number | null;
    lengthUnit?: LengthUnit;
}

/**
 * Camioneta / pickup liviana N1 (vista lateral simplificada). Silueta fija de
 * dos ejes; no aplica cota de Cama Útil.
 */
export function CamionetaSchematic({ largo, alto, lengthUnit }: CamionetaSchematicProps) {
    const palette = useBlueprintPalette();

    const axlePositions = distributeAxles(2, 80, 220);

    return (
        <g>
            {/* Cota de longitud total */}
            <DimensionCota
                orientation="horizontal"
                start={40}
                end={300}
                cross={20}
                label={`LONGITUD TOTAL: ${formatLengthValue(largo, lengthUnit)}`}
                color={palette.dimension}
            />

            {/* Carrocería pickup */}
            <path
                d="M 45,78 L 90,78 L 110,45 L 200,45 L 200,78 L 300,78 L 300,102 L 45,102 Z"
                fill={palette.chassisFill}
                stroke={palette.stroke}
                strokeWidth="2"
            />
            {/* Parabrisas */}
            <line x1="150" y1="45" x2="150" y2="78" stroke={palette.stroke} strokeWidth="1.5" opacity="0.7" />
            <line x1="190" y1="45" x2="190" y2="78" stroke={palette.stroke} strokeWidth="1.5" opacity="0.7" />

            {/* Separación cabina / tolva */}
            <line x1="90" y1="78" x2="200" y2="78" stroke={palette.stroke} strokeWidth="1" opacity="0.6" />

            {/* Cota de altura */}
            <DimensionCota
                orientation="vertical"
                start={20}
                end={135}
                cross={28}
                labelOffset={-40}
                label={formatLengthValue(alto, lengthUnit)}
                color={palette.dimension}
            />


            {axlePositions.map((pos) => (
                <Neumatico key={pos} cx={pos} cy={110} radius={17} showSuspension={false} />
            ))}



            <text x="250" y="70" fill={palette.stroke} fontSize="9" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                CAMIONETA (N1)
            </text>
        </g>
    );
}
