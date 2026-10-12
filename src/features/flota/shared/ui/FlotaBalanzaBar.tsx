import { Box, Tooltip, Typography, useTheme, alpha } from '@mui/material';
import { Equalizer as EqualizerIcon, Speed } from '@mui/icons-material';

interface FlotaBalanzaBarProps {
    pesoBruto?: number | null;
    pesoNeto?: number | null;
    cargaUtil?: number | null;
    mode?: 'compact' | 'detailed';
    unit?: 'KG' | 'TN' | 'LB';
}

export function FlotaBalanzaBar({
    pesoBruto = 0,
    pesoNeto = 0,
    cargaUtil,
    mode = 'detailed',
    unit = 'KG',
}: FlotaBalanzaBarProps) {
    const theme = useTheme();

    const pbv = Math.max(0, Number(pesoBruto) || 0);
    const tara = Math.max(0, Number(pesoNeto) || 0);
    const flete = cargaUtil != null ? Math.max(0, Number(cargaUtil)) : Math.max(0, pbv - tara);

    const taraPct = pbv > 0 ? Math.min(100, Math.max(0, (tara / pbv) * 100)) : 0;
    const fletePct = pbv > 0 ? Math.min(100 - taraPct, Math.max(0, (flete / pbv) * 100)) : 0;

    const formatWeight = (val: number) => {
        if (unit === 'TN') {
            return `${val.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} TN`;
        }
        if (unit === 'LB') {
            return `${val.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} LB`;
        }
        return `${Math.round(val).toLocaleString('es-PE')} KG`;
    };

    if (pbv <= 0 && mode === 'compact') {
        return (
            <Typography variant="caption" color="text.secondary">
                —
            </Typography>
        );
    }

    if (mode === 'compact') {
        return (
            <Box sx={{ width: '100%', minWidth: 120, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
                        {formatWeight(flete)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        PBV: {formatWeight(pbv)}
                    </Typography>
                </Box>
                <Tooltip
                    title={`Tara: ${formatWeight(tara)} (${taraPct.toFixed(1)}%) • Carga Útil: ${formatWeight(flete)} (${fletePct.toFixed(1)}%)`}
                    arrow
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: 6,
                            borderRadius: 3,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                            overflow: 'hidden',
                            display: 'flex',
                            cursor: 'help',
                        }}
                    >
                        <Box
                            sx={{
                                width: `${taraPct}%`,
                                height: '100%',
                                bgcolor: '#64748B',
                                transition: 'width 0.3s ease',
                            }}
                        />
                        <Box
                            sx={{
                                width: `${fletePct}%`,
                                height: '100%',
                                bgcolor: '#00C482',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </Box>
                </Tooltip>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.5) : '#F8FAFC',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EqualizerIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                        Distribución de Capacidad de Carga
                    </Typography>
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'primary.main',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                    }}
                >
                    Total Balanza: {formatWeight(pbv)} (100%)
                </Typography>
            </Box>

            {/* Barra segmentada */}
            <Box
                sx={{
                    width: '100%',
                    height: 18,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    p: '2px',
                    gap: '2px',
                }}
            >
                <Tooltip title={`Tara / Peso Neto: ${formatWeight(tara)} (${taraPct.toFixed(1)}%)`} arrow>
                    <Box
                        sx={{
                            width: `${taraPct}%`,
                            height: '100%',
                            bgcolor: '#64748B',
                            borderRadius: '4px 0 0 4px',
                            transition: 'width 0.4s ease',
                            cursor: 'pointer',
                        }}
                    />
                </Tooltip>
                <Tooltip title={`Carga Útil Comercial: ${formatWeight(flete)} (${fletePct.toFixed(1)}%)`} arrow>
                    <Box
                        sx={{
                            width: `${fletePct}%`,
                            height: '100%',
                            bgcolor: '#00C482',
                            borderRadius: taraPct === 0 ? '4px' : '0 4px 4px 0',
                            transition: 'width 0.4s ease',
                            cursor: 'pointer',
                        }}
                    />
                </Tooltip>
            </Box>

            {/* Leyenda */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, pt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#64748B' }} />
                        <Typography variant="caption" color="text.secondary">
                            Tara de Unidad: <strong style={{ color: theme.palette.text.primary }}>{formatWeight(tara)}</strong> ({taraPct.toFixed(1)}%)
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Carga Comercial Máx: <strong>{formatWeight(flete)}</strong> ({fletePct.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10B981', fontWeight: 600, fontSize: '0.75rem' }}>
                    <Speed sx={{ fontSize: 16 }} />
                    Eficiencia volumétrica óptima de flete
                </Box>
            </Box>
        </Box>
    );
}
