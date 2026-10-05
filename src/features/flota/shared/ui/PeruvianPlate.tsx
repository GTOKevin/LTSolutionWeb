import { Box, Typography } from '@mui/material';

interface PeruvianPlateProps {
    placa?: string | null;
    size?: 'sm' | 'md' | 'lg';
}

export function PeruvianPlate({ placa, size = 'md' }: PeruvianPlateProps) {
    const formattedPlaca = placa?.trim().toUpperCase() || '— — —';

    // Dimensiones y tipografía escaladas según variante
    const sizeConfig = {
        sm: {
            width: 86,
            height: 25,
            padding: '1px 3px',
            dotSize: 3,
            peruFontSize: '6px',
            plateFontSize: '11px',
            bandHeight: 2,
        },
        md: {
            width: 116,
            height: 34,
            padding: '2px 5px',
            dotSize: 4,
            peruFontSize: '7.5px',
            plateFontSize: '14px',
            bandHeight: 2.5,
        },
        lg: {
            width: 148,
            height: 46,
            padding: '3px 8px',
            dotSize: 5,
            peruFontSize: '9px',
            plateFontSize: '19px',
            bandHeight: 3.5,
        },
    }[size];

    return (
        <Box
            sx={{
                width: sizeConfig.width,
                height: sizeConfig.height,
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 55%, #E2E8F0 100%)',
                borderRadius: '5px',
                border: '1.5px solid #94A3B8',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.18)',
                display: 'inline-flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: sizeConfig.padding,
                userSelect: 'none',
                position: 'relative',
                flexShrink: 0,
            }}
        >
            {/* Fila superior: Perno izquierdo, texto PERÚ, Perno derecho */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    lineHeight: 1,
                }}
            >
                <Box
                    sx={{
                        width: sizeConfig.dotSize,
                        height: sizeConfig.dotSize,
                        borderRadius: '50%',
                        bgcolor: '#64748B',
                        boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.4)',
                    }}
                />
                <Typography
                    component="span"
                    sx={{
                        fontSize: sizeConfig.peruFontSize,
                        fontWeight: 900,
                        letterSpacing: '0.18em',
                        color: '#334155',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                    }}
                >
                    PERÚ
                </Typography>
                <Box
                    sx={{
                        width: sizeConfig.dotSize,
                        height: sizeConfig.dotSize,
                        borderRadius: '50%',
                        bgcolor: '#64748B',
                        boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.4)',
                    }}
                />
            </Box>

            {/* Matrícula central en fuente monoespaciada en relieve */}
            <Typography
                component="div"
                sx={{
                    fontFamily: '"SF Mono", "Roboto Mono", Menlo, Consolas, monospace',
                    fontSize: sizeConfig.plateFontSize,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#0F172A',
                    textAlign: 'center',
                    lineHeight: 1,
                    textShadow: '0 0.5px 0.5px rgba(255,255,255,0.8)',
                    my: 'auto',
                }}
            >
                {formattedPlaca}
            </Typography>

            {/* Franja reflectiva inferior amarilla oficial */}
            <Box
                sx={{
                    width: '100%',
                    height: sizeConfig.bandHeight,
                    bgcolor: '#FACC15',
                    borderRadius: '1px',
                    boxShadow: '0 0.5px 1px rgba(0,0,0,0.15)',
                }}
            />
        </Box>
    );
}
