import type { LengthUnit } from '@shared/utils/format-utils';
import { resolveAxleCount } from '@entities/flota/model/diagram';
import { distributeAxles, formatLengthValue, useBlueprintPalette } from './schematic-utils';
import { Neumatico } from './Neumatico';
import { DimensionCota } from './DimensionCota';
import { alpha } from '@mui/material';

interface TractoSchematicProps {
    largo?: number | null;
    alto?: number | null;
    ejes?: number | null;
    configuracionEjesCodigo?: string | null;
    configuracionEjesNombre?: string | null;
    lengthUnit?: LengthUnit;
}

/**
 * Diagrama técnico dimensional de Tractocamión / Volvo FH Globetrotter XL.
 * Basado en la especificación visual de ingeniería de Google Stitch ("Diagrama Tracto").
 * Soporta configuración de ejes dinámica (6x4 tándem motriz o 4x2) y cotas reales.
 */
export function TractoSchematic({
    largo,
    alto,
    ejes,
    configuracionEjesCodigo,
    configuracionEjesNombre,
    lengthUnit,
}: TractoSchematicProps) {
    const palette = useBlueprintPalette();
    const isDark = palette.isDark;

    const axleCount = resolveAxleCount(configuracionEjesCodigo, ejes);
    const axlePositions = distributeAxles(axleCount - 1, 600, 700);
    const isTandem = axleCount >= 3 || (configuracionEjesCodigo?.includes('6') ?? true);
    const configLabel = configuracionEjesNombre ?? configuracionEjesCodigo ?? (isTandem ? '6x4' : '4x2');

    const largoStr = formatLengthValue(largo, lengthUnit);
    const altoStr = formatLengthValue(alto, lengthUnit);



    const primaryColor = isDark ? '#38BDF8' : '#004580';
    const outlineColor = isDark ? '#64748B' : '#727782';
    const gridColor = isDark ? '#1E293B' : '#d8e3fb';
    const windowFill = isDark ? 'rgba(56, 189, 248, 0.25)' : '#dee8ff';

    return (
        <g>
            <defs>
                <pattern id="tractoGrid" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke={gridColor} strokeDasharray="2 2" strokeWidth="0.75" />
                </pattern>
                <linearGradient id="cabGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity={isDark ? 0.28 : 0.18} />
                    <stop offset="100%" stopColor={primaryColor} stopOpacity={isDark ? 0.1 : 0.05} />
                </linearGradient>
            </defs>

            {/* Cuadrícula técnica de ingeniería CAD */}
            <rect width="860" height="420" fill="url(#tractoGrid)" />

            {/* Nivel de calzada / rasante oficial */}
            <line x1="50" y1="360" x2="810" y2="360" stroke={outlineColor} strokeDasharray="6 4" strokeWidth="2" />
            <text x="60" y="375" fill={outlineColor} fontFamily="Inter, monospace" fontSize="10" fontWeight="600">
                NIVEL DE CALZADA (RASANTE)
            </text>

            {/* ================= COTA SUPERIOR: LONGITUD TOTAL ================= */}



            <DimensionCota
                orientation="horizontal"
                strokeWidth={2}
                labelOffset={10}
                start={110}
                end={750}
                cross={35}
                label={`LONGITUD TOTAL: ${largoStr}`}
                color={primaryColor}
                txtColor={primaryColor}
                background="bg"

            />

            {/* ================= COTA LATERAL IZQUIERDA: ALTURA ================= */}


            <DimensionCota
                orientation="vertical"
                strokeWidth={2}
                labelOffset={-30}
                start={55}
                end={350}
                cross={35}
                label={`ALTO: ${altoStr}`}
                color="#ba1a1a"
                txtColor="#ba1a1a"
                background="bg"

            />

            {/* ================= CHASIS Y ESTRUCTURA METÁLICA ================= */}
            {/* Largueros de acero ASTM A572 */}
            <rect x="220" y="270" width="530" height="24" rx="2" fill={isDark ? '#1E293B' : '#263143'} />
            <rect x="230" y="274" width="510" height="4" fill={outlineColor} opacity="0.4" />

            {/* Línea guía de voladizo posterior */}
            <line x1="750" y1="270" x2="750" y2="330" stroke={outlineColor} strokeDasharray="3 3" strokeWidth="1.5" />

            {/* Tanque de combustible de aluminio (650L) */}
            <rect x="360" y="266" width="130" height="44" rx="8" fill={isDark ? '#334155' : '#5a5f62'} stroke={isDark ? '#0F172A' : '#263143'} strokeWidth="2" />
            <line x1="385" y1="266" x2="385" y2="310" stroke={isDark ? '#0F172A' : '#263143'} strokeWidth="2" />
            <line x1="465" y1="266" x2="465" y2="310" stroke={isDark ? '#0F172A' : '#263143'} strokeWidth="2" />
            <text x="425" y="292" fill="#ffffff" fontFamily="Inter, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                DIÉSEL
            </text>

            {/* Caja de baterías y depósitos de aire comprimido */}
            <rect x="500" y="280" width="46" height="24" rx="3" fill={isDark ? '#1E293B' : '#414751'} stroke={isDark ? '#0F172A' : '#263143'} strokeWidth="1.5" />

            {/* ================= QUINTA RUEDA (FIFTH WHEEL JOST) ================= */}
            <path d="M 590 270 L 610 248 L 650 248 L 670 270 Z" fill="#713300" stroke="#ffb68b" strokeWidth="1.5" />
            <rect x="600" y="244" width="60" height="6" rx="2" fill="#ffc9ab" stroke="#713300" strokeWidth="1.5" />
            <circle cx="630" cy="247" r="3" fill="#ffffff" />



            {/* Callout: Quinta Rueda Jost */}
            <rect x="540" y="100" width="180" height="20" rx="4" fill="#713300" />
            <text x="630" y="112" fill="#ffffff" fontFamily="Inter, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                DIAGRAMA REFERENCIAL
            </text>

            {/* ================= CABINA VOLVO FH GLOBETROTTER XL ================= */}
            <path d="M 120 310 L 120 180 L 160 120 L 210 90 L 310 90 L 325 90 L 325 310 Z" fill="url(#cabGrad)" stroke={primaryColor} strokeWidth="3" />

            {/* Deflector aerodinámico superior */}
            <path d="M 190 90 L 330 70 L 330 90 Z" fill={primaryColor} fillOpacity="0.35" stroke={primaryColor} strokeWidth="2" />

            {/* Parabrisas laminado y pilar A */}
            <path d="M 160 125 L 225 98 L 225 180 L 140 180 Z" fill={windowFill} stroke={primaryColor} strokeWidth="2" />

            {/* Ventana lateral de conductor */}
            <path d="M 250 135 L 295 135 L 295 180 L 250 180 Z" fill={windowFill} stroke={primaryColor} strokeWidth="0.5" />
            <rect x="205" y="195" width="20" height="4" rx="2" fill={primaryColor} />



            {/* Parrilla frontal y emblema */}
            <path d="M 120 220 L 150 220 L 150 295 L 120 295 Z" fill={isDark ? 'rgba(56, 189, 248, 0.15)' : '#d8e3fb'} stroke={primaryColor} strokeWidth="1.5" />
            <line x1="120" y1="240" x2="150" y2="240" stroke={primaryColor} strokeWidth="1" />
            <line x1="120" y1="255" x2="150" y2="255" stroke={primaryColor} strokeWidth="1" />
            <line x1="120" y1="270" x2="150" y2="270" stroke={primaryColor} strokeWidth="1" />

            {/* Faros principales LED */}
            <polygon points="120,295 140,295 136,315 120,315" fill={isDark ? '#38BDF8' : '#bdd6ff'} stroke={primaryColor} strokeWidth="1.5" />

            {/* Peldaños de acceso y parachoques */}
            <rect x="120" y="315" width="45" height="15" rx="2" fill={isDark ? '#1E293B' : '#414751'} />
            <line x1="130" y1="322" x2="155" y2="322" stroke="#ffffff" strokeWidth="1" />
            <rect x="180" y="320" width="30" height="6" fill={isDark ? '#1E293B' : '#414751'} />

            {/* Tubo de escape vertical trasero */}
            <rect x="330" y="100" width="12" height="170" rx="2" fill={outlineColor} stroke={isDark ? '#0F172A' : '#263143'} strokeWidth="1.5" />
            <path d="M 330 100 Q 336 82 346 80 L 346 95 Z" fill={isDark ? '#1E293B' : '#414751'} />

            {/* Callout: Cabina Globetrotter */}


            {/* ================= RUEDAS Y EJES ================= */}
            {/* 1. EJE DELANTERO DIRECTRIZ */}
            <Neumatico key={200} cx={200} cy={320} radius={40} showSuspension={false} />

            {/* 2. EJES TRASEROS SEGÚN CONFIGURACIÓN (Tándem 6x4 o Simple 4x2) */}
            {isTandem ? (
                <>

                    {axlePositions.map((pos) => (
                        <Neumatico key={pos} cx={pos} cy={320} radius={40} showSuspension={false} />
                    ))}



                    {/* Callout: Tándem Motriz */}
                    <rect x="400" y="200" width="280" height="18" rx="3" fill={isDark ? alpha(primaryColor, 0.2) : '#e7eeff'} stroke={primaryColor} strokeWidth="1" />
                    <text x="540" y="212" fill={primaryColor} fontFamily="Inter, monospace" fontSize="9.5" fontWeight="700" textAnchor="middle">
                        CONFIGURACIÓN DE EJES {configLabel}
                    </text>
                </>
            ) : (
                <>
                    {/* Eje Trasero Simple 4x2 */}
                    <path d="M 600 320 A 46 46 0 0 1 690 320" fill="none" stroke={isDark ? '#38BDF8' : '#263143'} strokeWidth="3" />
                    <circle cx="645" cy="320" r="40" fill="#111c2d" stroke={isDark ? '#64748B' : '#414751'} strokeWidth="2" />
                    <circle cx="645" cy="320" r="28" fill="#c3c7cb" stroke={outlineColor} strokeWidth="2" />
                    <circle cx="645" cy="320" r="14" fill="#263143" />
                    <circle cx="645" cy="320" r="4" fill="#dee8ff" />
                    <rect x="550" y="200" width="190" height="18" rx="3" fill={isDark ? alpha(primaryColor, 0.2) : '#e7eeff'} stroke={primaryColor} strokeWidth="1" />
                    <text x="645" y="213" fill={primaryColor} fontFamily="Inter, monospace" fontSize="8.5" fontWeight="700" textAnchor="middle">
                        EJE MOTRIZ SIMPLE {configLabel}
                    </text>
                </>
            )}


        </g>
    );
}
