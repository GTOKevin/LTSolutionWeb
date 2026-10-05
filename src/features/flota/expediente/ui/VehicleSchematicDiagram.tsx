import { Box, Typography, useTheme, alpha } from '@mui/material';

interface VehicleSchematicDiagramProps {
    largo?: number | null;
    ancho?: number | null;
    alto?: number | null;
    tipoNombre?: string | null;
    ejes?: number | null;
}

export function VehicleSchematicDiagram({
    largo = 11.6,
    ancho = 2.6,
    alto = 1.0,
    tipoNombre = 'Carreta Cama Baja',
    ejes = 3,
}: VehicleSchematicDiagramProps) {
    const theme = useTheme();

    const formattedLargo = largo != null ? `${Number(largo).toFixed(2)} m` : '11.60 m';
    const formattedAlto = alto != null ? `${Number(alto).toFixed(2)} m` : '1.00 m';
    const formattedAncho = ancho != null ? `${Number(ancho).toFixed(2)} m` : '2.60 m';

    const isDark = theme.palette.mode === 'dark';
    const blueprintBg = isDark ? alpha('#0F172A', 0.8) : '#F1F5F9';
    const strokeColor = isDark ? '#38BDF8' : '#0284C7';
    const chassisFill = isDark ? alpha('#0284C7', 0.4) : alpha('#0284C7', 0.2);
    const dimensionColor = isDark ? '#94A3B8' : '#475569';

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: blueprintBg,
                p: { xs: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Header del diagrama con etiquetas técnicas */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'primary.main',
                            fontSize: '0.75rem',
                        }}
                    >
                        ESQUEMA TÉCNICO DIMENSIONAL • {tipoNombre?.toUpperCase()} ({ejes || 3} EJES)
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        Ancho: <strong>{formattedAncho}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        Alto: <strong>{formattedAlto}</strong>
                    </Typography>
                </Box>
            </Box>

            {/* Gráfico SVG Técnico (Blueprint) */}
            <Box sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
                <svg
                    viewBox="0 0 600 160"
                    width="100%"
                    height="100%"
                    style={{ minWidth: 480, maxHeight: 160, display: 'block' }}
                >
                    {/* Línea de Cota Superior (Largo Total) */}
                    <g stroke={dimensionColor} strokeWidth="1.2">
                        <line x1="30" y1="20" x2="570" y2="20" strokeDasharray="3 3" />
                        <line x1="30" y1="14" x2="30" y2="26" />
                        <line x1="570" y1="14" x2="570" y2="26" />
                        <polyline points="36,17 30,20 36,23" fill="none" />
                        <polyline points="564,17 570,20 564,23" fill="none" />
                    </g>
                    <text
                        x="300"
                        y="16"
                        fill={dimensionColor}
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="monospace"
                        textAnchor="middle"
                    >
                        LONGITUD TOTAL: {formattedLargo}
                    </text>

                    {/* Chasis y Carrocería Vectorial */}
                    <path
                        d="M 35,55 L 120,55 L 145,90 L 430,90 L 450,80 L 565,80 L 565,102 L 440,102 L 420,112 L 140,112 L 120,78 L 35,78 Z"
                        fill={chassisFill}
                        stroke={strokeColor}
                        strokeWidth="2"
                    />

                    {/* Plataforma superior de carga texturizada */}
                    <line x1="145" y1="88" x2="430" y2="88" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />

                    {/* Acople Cuello de Ganso / Kingpin */}
                    <circle cx="65" cy="85" r="4.5" fill="#F59E0B" />
                    <line x1="65" y1="85" x2="65" y2="100" stroke="#F59E0B" strokeWidth="2" />
                    <text x="65" y="112" fill={dimensionColor} fontSize="8.5" fontFamily="monospace" textAnchor="middle">
                        KING PIN
                    </text>

                    {/* Cota de Altura de Plataforma */}
                    <g stroke={dimensionColor} strokeWidth="1">
                        <line x1="285" y1="90" x2="285" y2="135" />
                        <line x1="280" y1="90" x2="290" y2="90" />
                        <line x1="280" y1="135" x2="290" y2="135" />
                    </g>
                    <text x="295" y="115" fill={dimensionColor} fontSize="9" fontWeight="700" fontFamily="monospace">
                        {formattedAlto}
                    </text>

                    {/* Ruedas y Tren Posterior (3 Ejes) */}
                    <g fill={isDark ? '#1E293B' : '#334155'} stroke={strokeColor} strokeWidth="2">
                        {/* Eje 1 */}
                        <circle cx="475" cy="115" r="15" />
                        <circle cx="475" cy="115" r="6" fill="#94A3B8" />
                        {/* Eje 2 */}
                        <circle cx="510" cy="115" r="15" />
                        <circle cx="510" cy="115" r="6" fill="#94A3B8" />
                        {/* Eje 3 */}
                        <circle cx="545" cy="115" r="15" />
                        <circle cx="545" cy="115" r="6" fill="#94A3B8" />
                    </g>

                    {/* Línea de Suelo / Rasante */}
                    <line
                        x1="20"
                        y1="135"
                        x2="580"
                        y2="135"
                        stroke={dimensionColor}
                        strokeWidth="1"
                        strokeDasharray="4 2"
                        opacity="0.4"
                    />

                    {/* Etiquetas descriptivas de zonas */}
                    <text x="285" y="80" fill={strokeColor} fontSize="9" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                        PLATAFORMA REBAJADA DE CARGA
                    </text>
                    <text x="510" y="148" fill={dimensionColor} fontSize="8.5" fontFamily="monospace" textAnchor="middle">
                        TREN TRÍDEM POSTERIOR ({ejes || 3} EJES)
                    </text>
                </svg>
            </Box>
        </Box>
    );
}
