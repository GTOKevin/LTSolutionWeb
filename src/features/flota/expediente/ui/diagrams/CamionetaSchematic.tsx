import type { LengthUnit } from '@shared/utils/format-utils';
import { AxleGroup } from './AxleGroup';
import { DimensionCota } from './DimensionCota';
import { formatLengthValue, useBlueprintPalette } from './schematic-utils';

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

    return (
        <g>
            {/* Cota de longitud total */}
            <DimensionCota
                orientation="horizontal"
                start={40}
                end={575}
                cross={20}
                label={`LONGITUD TOTAL: ${formatLengthValue(largo, lengthUnit)}`}
                color={palette.dimension}
            />

            {/* Carrocería pickup */}
            <path
                d="M 45,88 L 150,88 L 175,58 L 315,58 L 315,88 L 540,88 L 540,102 L 45,102 Z"
                fill={palette.chassisFill}
                stroke={palette.stroke}
                strokeWidth="2"
            />
            {/* Parabrisas */}
            <line x1="178" y1="60" x2="200" y2="88" stroke={palette.stroke} strokeWidth="1.5" opacity="0.7" />
            {/* Separación cabina / tolva */}
            <line x1="315" y1="64" x2="315" y2="88" stroke={palette.stroke} strokeWidth="1" opacity="0.6" />

            {/* Cota de altura */}
            <DimensionCota
                orientation="vertical"
                start={58}
                end={135}
                cross={28}
                label={formatLengthValue(alto, lengthUnit)}
                color={palette.dimension}
            />

            <AxleGroup
                positions={[120, 470]}
                centerY={118}
                radius={13}
                stroke={palette.stroke}
                wheelFill={palette.wheelFill}
                hubFill={palette.wheelHub}
            />

            <text x="300" y="76" fill={palette.stroke} fontSize="9" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                CAMIONETA (N1)
            </text>
        </g>
    );
}
