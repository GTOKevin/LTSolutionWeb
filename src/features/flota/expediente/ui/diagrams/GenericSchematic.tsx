import type { LengthUnit } from '@shared/utils/format-utils';
import { resolveAxleCount } from '@entities/flota/model/diagram';
import { AxleGroup } from './AxleGroup';
import { DimensionCota } from './DimensionCota';
import { distributeAxles, formatLengthValue, useBlueprintPalette } from './schematic-utils';

interface GenericSchematicProps {
    largo?: number | null;
    alto?: number | null;
    ejes?: number | null;
    camaUtil?: number | null;
    configuracionEjesCodigo?: string | null;
    lengthUnit?: LengthUnit;
}

/**
 * Diagrama genérico de respaldo para tipos desconocidos o combinaciones no
 * contempladas. No inventa dimensiones: muestra `—` cuando falta el dato.
 */
export function GenericSchematic({
    largo,
    alto,
    ejes,
    camaUtil,
    configuracionEjesCodigo,
    lengthUnit,
}: GenericSchematicProps) {
    const palette = useBlueprintPalette();
    const axleCount = resolveAxleCount(configuracionEjesCodigo, ejes);
    const positions = distributeAxles(axleCount, 462, 552);

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

            {/* Chasis genérico */}
            <rect
                x="90"
                y="86"
                width="440"
                height="18"
                rx="4"
                fill={palette.chassisFill}
                stroke={palette.stroke}
                strokeWidth="2"
                strokeDasharray="6 3"
            />

            {/* Cota de altura */}
            <DimensionCota
                orientation="vertical"
                start={86}
                end={135}
                cross={70}
                label={formatLengthValue(alto, lengthUnit)}
                color={palette.dimension}
            />

            {/* Cota de Cama Útil cuando aplique y exista dato */}
            {camaUtil != null ? (
                <DimensionCota
                    orientation="horizontal"
                    start={95}
                    end={525}
                    cross={124}
                    label={`CAMA ÚTIL: ${formatLengthValue(camaUtil, lengthUnit)}`}
                    color={palette.accent}
                />
            ) : null}

            <AxleGroup
                positions={positions}
                centerY={118}
                radius={13}
                stroke={palette.stroke}
                wheelFill={palette.wheelFill}
                hubFill={palette.wheelHub}
            />

            <text x="310" y="76" fill={palette.dimension} fontSize="9" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                UNIDAD NO CLASIFICADA
            </text>
        </g>
    );
}
