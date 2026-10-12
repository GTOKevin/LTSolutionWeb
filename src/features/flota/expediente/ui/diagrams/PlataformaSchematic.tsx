import type { LengthUnit } from '@shared/utils/format-utils';
import { distributeAxles, formatLengthValue, useBlueprintPalette } from './schematic-utils';
import { DimensionCota } from './DimensionCota';
import { Neumatico } from './Neumatico';

interface PlataformaSchematicProps {
    largo?: number | null;
    alto?: number | null;
    ejes?: number | null;
    camaUtil?: number | null;
    lengthUnit?: LengthUnit;
}

/**
 * Diagrama técnico dimensional de carreta plataforma (semirremolque de cama
 * plana), genérico y referencial. La cantidad de ejes se toma del dato real.
 */
export function PlataformaSchematic({
    largo,
    alto,
    ejes,
    camaUtil,
    lengthUnit,
}: PlataformaSchematicProps) {
    const palette = useBlueprintPalette();
    const isDark = palette.isDark;

    // Sin dato de ejes no se dibuja tren rodante (evita inventar un trídem).
    const axleCount = ejes && ejes > 0 ? ejes : 0;
    const axlePositions = distributeAxles(axleCount, 655, 815);

    const primaryColor = palette.primary;
    const outlineColor = isDark ? '#64748B' : '#727782';
    const gridColor = isDark ? '#1E293B' : '#cfdaf2';

    return (
        <g>
            <defs>
                <pattern id="plataformaGridPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke={gridColor} strokeOpacity={isDark ? 0.4 : 0.6} strokeWidth="0.5" />
                </pattern>
                <marker id="arrowPlat" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={primaryColor} />
                </marker>
                <marker id="arrowPlatSm" markerHeight="4" markerWidth="4" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={outlineColor} />
                </marker>
            </defs>

            {/* Fondo milimétrico CAD */}
            <rect width="960" height="380" rx="8" fill="url(#plataformaGridPattern)" />

            {/* ================= COTA SUPERIOR: LONGITUD TOTAL ================= */}


            <DimensionCota
                orientation="horizontal"
                background="bg"
                start={80}
                end={900}
                cross={35}
                label={`LONGITUD TOTAL: ${formatLengthValue(largo, lengthUnit)}`}
                color={primaryColor}
                txtColor={primaryColor}
            />


            <DimensionCota
                orientation="vertical"
                background="bg"
                strokeWidth={2}
                labelOffset={15}
                start={65}
                end={280}
                cross={35}
                label={`ALTO: ${formatLengthValue(alto, lengthUnit)}`}
                color={palette.danger}
                txtColor={palette.danger}
            />

            {/* ================= CABEZAL FRONTAL / DEFLECTOR ================= */}
            <rect x="80" y="65" width="14" height="85" rx="2" fill={primaryColor} />
            <line x1="85" y1="68" x2="85" y2="148" stroke="#bdd6ff" strokeWidth="2" />
            <text x="80" y="58" fill={isDark ? '#E2E8F0' : '#414751'} fontFamily="Inter, monospace" fontSize="10" fontWeight="600" textAnchor="start">
                CABEZAL FRONTAL
            </text>


            {/* Bisagras y cerrojos de baranda */}
            <g fill={primaryColor}>
                <circle cx="94" cy="150" r="3" />
                <circle cx="251" cy="150" r="3" />
                <circle cx="412" cy="150" r="3" />
                <circle cx="573" cy="150" r="3" />
                <circle cx="734" cy="150" r="3" />
                <circle cx="897" cy="150" r="3" />
            </g>

            {/* ================= PISO Y PLATAFORMA PLANA ================= */}
            <rect x="80" y="150" width="820" height="10" rx="1" fill={isDark ? '#0284C7' : '#004580'} />

            {/* Cinta reflectiva lateral */}
            <line x1="84" y1="155" x2="896" y2="155" stroke={palette.danger} strokeDasharray="14 14" strokeWidth="3" />

            {/* Cota Cama Útil (cuando aplica y existe el dato) */}
            {camaUtil != null ? (
                <>
                    <DimensionCota
                        orientation="horizontal"
                        start={100}
                        end={890}
                        cross={140}
                        label={`CAMA ÚTIL: ${formatLengthValue(camaUtil, lengthUnit)}`}
                        color={palette.accent}
                        txtColor={palette.accent}
                    />
                </>
            ) : null}

            {/* Piñas / twist locks (referencial) */}
            <g fill="#ffc9ab" stroke={palette.callout} strokeWidth="1.5">
                <rect x="84" y="146" width="12" height="8" rx="1" />
                <rect x="480" y="146" width="12" height="8" rx="1" />
                <rect x="884" y="146" width="12" height="8" rx="1" />
            </g>

            {/* ================= CHASIS VIGA I ESTRUCTURAL PRINCIPAL ================= */}
            <path d="M 80 160 L 210 160 L 230 185 L 890 185 L 900 160 Z" fill={isDark ? '#0F172A' : '#001c39'} />
            <line x1="260" y1="160" x2="260" y2="185" stroke={outlineColor} strokeWidth="2" />
            <line x1="340" y1="160" x2="340" y2="185" stroke={outlineColor} strokeWidth="2" />
            <line x1="430" y1="160" x2="430" y2="185" stroke={outlineColor} strokeWidth="2" />
            <line x1="520" y1="160" x2="520" y2="185" stroke={outlineColor} strokeWidth="2" />

            {/* Perno rey (King Pin) y plato de acople */}
            <rect x="145" y="160" width="28" height="5" fill={isDark ? '#334155' : '#5a5f62'} />
            <rect x="156" y="165" width="6" height="5" rx="1" fill={palette.danger} />
            <line x1="159" y1="170" x2="159" y2="190" stroke={palette.danger} strokeDasharray="2 2" strokeWidth="1" />
            <text x="159" y="200" fill={palette.danger} fontFamily="Inter, monospace" fontSize="10" fontWeight="700" textAnchor="middle">
                KING PIN
            </text>

            {/* Patas de apoyo telescópicas*/}
            <g stroke={isDark ? '#0F172A' : '#263143'} strokeWidth="2">
                <rect x="270" y="180" width="18" height="58" rx="1" fill={isDark ? '#334155' : '#5a5f62'} />
                <rect x="274" y="238" width="10" height="24" rx="1" fill={palette.metalLight} />
                <polygon points="266,262 292,262 288,268 270,268" fill={palette.metal} />
                <line x1="288" y1="205" x2="304" y2="205" stroke={primaryColor} strokeWidth="3" />
                <line x1="304" y1="205" x2="304" y2="218" stroke={primaryColor} strokeWidth="3" />
                <circle cx="304" cy="218" r="3" fill={primaryColor} />
            </g>
            <text x="360" y="215" fill={isDark ? '#94A3B8' : '#414751'} fontFamily="Inter, monospace" fontSize="9" fontWeight="600" textAnchor="middle">
                PATAS TELESCÓPICAS
            </text>

            {/* ================= TREN POSTERIOR (ejes según dato) ================= */}
            {axlePositions.map((pos) => (
                <Neumatico key={pos} cx={pos} cy={240} />
            ))}

            {/* Paragolpes trasero */}
            <polygon points="875,185 898,185 895,255 885,255" fill={primaryColor} />
            <rect x="872" y="250" width="28" height="14" rx="1" fill={isDark ? '#0F172A' : '#001c39'} />
            <rect x="874" y="252" width="24" height="10" rx="1" fill={palette.danger} />

            {/* ================= COTAS INFERIORES: ENTRE-EJES Y PIVOTE ================= */}

            {/* Línea de suelo / nivel calzada */}
            <line x1="50" y1="281" x2="930" y2="281" stroke={isDark ? '#64748B' : '#c1c7d3'} strokeWidth="2" />
            <text x="910" y="275" fill={outlineColor} fontFamily="Inter, monospace" fontSize="9" textAnchor="end">
                NIVEL CALZADA
            </text>
        </g>
    );
}
