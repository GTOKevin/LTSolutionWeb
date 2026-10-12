import type { LengthUnit } from '@shared/utils/format-utils';
import { distributeAxles, formatLengthValue, useBlueprintPalette } from './schematic-utils';
import { DimensionCota } from './DimensionCota';
import { Neumatico } from './Neumatico';

interface CisternaSchematicProps {
    largo?: number | null;
    alto?: number | null;
    ejes?: number | null;
    lengthUnit?: LengthUnit;
}

/**
 * Diagrama técnico dimensional de Semirremolque Cisterna Cilíndrica (HAZMAT).
 * Basado en la especificación visual de ingeniería de Google Stitch ("Diagrama Cisterna").
 * Incluye tanque cilíndrico de 4 compartimentos, pasarela superior, manholes,
 * gabinete de descarga Camlock, rombo HAZMAT 1203 Clase 3 y tren trídem de 3 ejes.
 */
export function CisternaSchematic({ largo, alto, ejes, lengthUnit }: CisternaSchematicProps) {
    const palette = useBlueprintPalette();
    const isDark = palette.isDark;

    const axleCount = ejes || 3;
    const axlePositions = distributeAxles(axleCount, 640, 820);
    const largoStr = formatLengthValue(largo, lengthUnit);
    const altoStr = formatLengthValue(alto, lengthUnit);

    const primaryColor = isDark ? '#38BDF8' : '#004580';
    const primaryFill = isDark ? '#0284C7' : '#004580';
    const outlineColor = isDark ? '#64748B' : '#727782';
    const gridColor = isDark ? '#1E293B' : '#d8e3fb';

    return (
        <g>
            <defs>
                <linearGradient id="tankBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={isDark ? 'rgba(56, 189, 248, 0.22)' : '#dee8ff'} />
                    <stop offset="50%" stopColor={isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f3ff'} />
                    <stop offset="100%" stopColor={isDark ? 'rgba(56, 189, 248, 0.26)' : '#cfdaf2'} />
                </linearGradient>
                <linearGradient id="tankAccentStrip" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isDark ? '#0284C7' : '#004580'} />
                    <stop offset="100%" stopColor={isDark ? '#0369A1' : '#005da8'} />
                </linearGradient>
                <pattern id="cisternaGridPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M 20 0 L 0 0 0 20" fill="none" opacity={isDark ? '0.4' : '0.6'} stroke={gridColor} strokeWidth="0.5" />
                </pattern>
            </defs>

            {/* Fondo cuadriculado CAD */}
            <rect width="1020" height="420" fill="url(#cisternaGridPattern)" />

            {/* Nivel de calzada / rasante */}
            <line x1="30" y1="375" x2="990" y2="375" stroke={outlineColor} strokeDasharray="8 4" strokeWidth="2" />
            <text x="45" y="392" fill={outlineColor} fontFamily="Inter, monospace" fontSize="10" fontWeight="600">
                NIVEL DE CALZADA
            </text>

            {/* ================= COTA SUPERIOR: LONGITUD TOTAL ================= */}

            <DimensionCota
                orientation="horizontal"
                strokeWidth={2.5}
                labelOffset={10}
                start={60}
                end={900}
                cross={60}
                label={`LONGITUD TOTAL: ${largoStr}`}
                color={primaryColor}
                txtColor={primaryColor}
                background="bg"

            />

            {/* ================= COTA LATERAL DERECHA: ALTURA ================= */}
            <DimensionCota
                orientation="vertical"
                strokeWidth={2.5}
                labelOffset={-30}
                start={75}
                end={375}
                cross={940}
                label={`ALTO: ${altoStr}`}
                color={primaryColor}
                txtColor={primaryColor}
                background="bg"

            />

            {/* ================= ENSAMBLE PERNO REY (KING PIN 2") ================= */}
            <g id="kingpin-assembly">
                <path d="M 75 255 L 220 255 L 210 270 L 85 270 Z" fill={isDark ? '#1E293B' : '#263143'} />
                <rect x="132" y="270" width="14" height="18" rx="2" fill={isDark ? '#334155' : '#5a5f62'} />
                <text x="139" y="305" fill={primaryColor} fontFamily="Inter, monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                    KINGPIN
                </text>
                <line x1="139" y1="288" x2="139" y2="296" stroke={primaryColor} strokeWidth="1" />
            </g>

            {/* ================= PATAS DE APOYO (LANDING GEAR JOST) ================= */}
            <g id="landing-gear">
                <rect x="245" y="255" width="16" height="90" rx="2" fill={isDark ? '#1E293B' : '#414751'} />
                <rect x="253" y="255" width="6" height="97" fill={isDark ? '#0F172A' : '#263143'} />
                <polygon points="237,352 269,352 263,360 243,360" fill="#171c1f" />
                <circle cx="265" cy="285" r="5" fill={outlineColor} />
                <line x1="265" y1="285" x2="275" y2="300" stroke={outlineColor} strokeWidth="2" />

            </g>

            {/* Chasis estructural con cuello de ganso */}
            <path d="M 75 255 L 230 255 L 260 272 L 900 272 L 900 284 L 255 284 L 225 264 L 75 264 Z" fill={primaryColor} />

            {/* ================= TANQUE CILÍNDRICO DE 4 COMPARTIMENTOS ================= */}
            {/* Cabezal cóncavo frontal */}
            <path d="M 115 120 C 75 120, 75 255, 115 255 Z" fill="url(#tankBodyGrad)" stroke={primaryColor} strokeWidth="2" />

            {/* Cuerpo cilíndrico principal */}
            <rect x="115" y="120" width="765" height="135" fill="url(#tankBodyGrad)" stroke={primaryColor} strokeWidth="2" />

            {/* Cabezal cóncavo posterior */}
            <path d="M 880 120 C 910 120, 910 255, 880 255 Z" fill="url(#tankBodyGrad)" stroke={primaryColor} strokeWidth="2" />



            {/* Mamparos divisorios y separación de compartimentos */}
            <line x1="330" y1="121" x2="330" y2="254" stroke={primaryColor} strokeWidth="2.5" />
            <line x1="225" y1="125" x2="225" y2="250" stroke={outlineColor} strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="520" y1="121" x2="520" y2="254" stroke={primaryColor} strokeWidth="2.5" />
            <line x1="425" y1="125" x2="425" y2="250" stroke={outlineColor} strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="710" y1="121" x2="710" y2="254" stroke={primaryColor} strokeWidth="2.5" />
            <line x1="615" y1="125" x2="615" y2="250" stroke={outlineColor} strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="800" y1="125" x2="800" y2="250" stroke={outlineColor} strokeDasharray="4 4" strokeWidth="1.5" />



            {/* ================= PASARELA SUPERIOR Y DOMOS MANHOLE ================= */}
            {/* Pasarela metálica antiderrapante */}
            <rect x="125" y="111" width="745" height="6" fill={isDark ? '#334155' : '#5a5f62'} />
            {/* Barandas de seguridad abatibles */}
            <line x1="145" y1="85" x2="145" y2="111" stroke={primaryColor} strokeWidth="2" />
            <line x1="330" y1="85" x2="330" y2="111" stroke={primaryColor} strokeWidth="2" />
            <line x1="520" y1="85" x2="520" y2="111" stroke={primaryColor} strokeWidth="2" />
            <line x1="710" y1="85" x2="710" y2="111" stroke={primaryColor} strokeWidth="2" />
            <line x1="870" y1="85" x2="870" y2="111" stroke={primaryColor} strokeWidth="2" />
            <line x1="140" y1="85" x2="875" y2="85" stroke={primaryColor} strokeWidth="2" />

            {/* 4 Bocas de visita (Manholes) con válvulas de venteo/alivio */}
            <g stroke="#ffffff" strokeWidth="1">
                <rect x="195" y="101" width="30" height="10" rx="3" fill={primaryFill} />
                <circle cx="210" cy="99" r="3" fill="#ba1a1a" />
                <rect x="410" y="101" width="30" height="10" rx="3" fill={primaryFill} />
                <circle cx="425" cy="99" r="3" fill="#ba1a1a" />
                <rect x="600" y="101" width="30" height="10" rx="3" fill={primaryFill} />
                <circle cx="615" cy="99" r="3" fill="#ba1a1a" />
                <rect x="780" y="101" width="30" height="10" rx="3" fill={primaryFill} />
                <circle cx="795" cy="99" r="3" fill="#ba1a1a" />
            </g>

            {/* Escalera posterior de inspección con peldaños */}
            <g stroke={primaryColor} strokeWidth="2">
                <line x1="880" y1="85" x2="880" y2="285" />
                <line x1="892" y1="85" x2="892" y2="285" />
                <line x1="880" y1="100" x2="892" y2="100" />
                <line x1="880" y1="125" x2="892" y2="125" />
                <line x1="880" y1="150" x2="892" y2="150" />
                <line x1="880" y1="175" x2="892" y2="175" />
                <line x1="880" y1="200" x2="892" y2="200" />
                <line x1="880" y1="225" x2="892" y2="225" />
                <line x1="880" y1="250" x2="892" y2="250" />
                <line x1="880" y1="275" x2="892" y2="275" />
            </g>

            {/* Portamangueras tubular 8" (6 metros) */}
            <rect x="135" y="245" width="735" height="14" rx="4" fill={isDark ? 'rgba(56, 189, 248, 0.2)' : '#a4c9ff'} stroke={primaryColor} strokeWidth="1" />


            {/* Rombo / Placa UN HAZMAT 1203 Clase 3 (Mercancía Peligrosa / Combustible) */}
            <g transform="translate(840, 165)">
                <polygon points="0,-16 16,0 0,16 -16,0" fill="#ba1a1a" stroke="#ffffff" strokeWidth="1.5" />

            </g>

            {/* Cinta reflectiva MTC reglamentaria lateral */}
            <line x1="115" y1="235" x2="880" y2="235" stroke="#f59e0b" strokeDasharray="14 14" strokeWidth="3" />

            {/* ================= TREN TRÍDEM POSTERIOR (3 EJES CISTERNA) ================= */}
            {/* Guardafango envolvente trídem */}
            <path d="M 600 290 C 600 275, 860 275, 860 290 L 860 315 L 600 315 Z" fill={isDark ? '#0F172A' : '#263143'} />

            {axlePositions.map((pos) => (
                <Neumatico key={pos} cx={pos} cy={332} radius={40} showSuspension={false} />
            ))}


            <rect x="450" y="0" width="180" height="20" rx="4" fill="#713300" />
            <text x="545" y="13" fill="#ffffff" fontFamily="Inter, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                DIAGRAMA REFERENCIAL
            </text>

            {/* Paragolpes trasero MTC */}
            <rect x="890" y="285" width="18" height="55" fill="#ba1a1a" />
            <rect x="875" y="335" width="35" height="10" fill="#171c1f" />
        </g>
    );
}
