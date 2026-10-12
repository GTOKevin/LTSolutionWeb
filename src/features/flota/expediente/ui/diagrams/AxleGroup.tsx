interface AxleGroupProps {
    positions: number[];
    centerY: number;
    stroke: string;
    wheelFill: string;
    hubFill: string;
    radius?: number;
    strokeWidth?: number;
}

/** Dibuja un conjunto de ejes (ruedas) centrados en las coordenadas X indicadas. */
export function AxleGroup({
    positions,
    centerY,
    stroke,
    wheelFill,
    hubFill,
    radius = 14,
    strokeWidth = 2,
}: AxleGroupProps) {
    if (positions.length === 0) {
        return null;
    }

    return (
        <g>
            {positions.map((cx) => (
                <g key={cx} fill={wheelFill} stroke={stroke} strokeWidth={strokeWidth}>
                    <circle cx={cx} cy={centerY} r={radius} />
                    <circle cx={cx} cy={centerY} r={radius * 0.42} fill={hubFill} />
                </g>
            ))}
        </g>
    );
}
