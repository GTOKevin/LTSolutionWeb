import { BadgeOutlined, DescriptionOutlined, WarningAmberRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { MyProfileDocumentoDto } from '@entities/profile/model/types';
import { SectionTitle, cardSx, formatDate, tableCellSx, tableHeaderSx } from './ProfileShared';

interface ProfileDocumentsSectionProps {
    documentos: MyProfileDocumentoDto[];
    criticalCount: number;
}

export function ProfileDocumentsSection({ documentos, criticalCount }: ProfileDocumentsSectionProps) {
    const theme = useTheme();
    const mode = theme.palette.mode;

    const resolveDocumentHref = (raw?: string | null) => {
        if (!raw) return undefined;

        const value = raw.trim();
        if (!value) return undefined;

        const lower = value.toLowerCase();
        if (lower.startsWith('https://') || lower.startsWith('http://')) return value;

        if (value.startsWith('/') && !value.startsWith('//') && !value.includes('..') && !value.includes('\\')) {
            return value;
        }

        return undefined;
    };

    return (
        <Card sx={cardSx(mode)}>
            <CardContent sx={{ p: 3 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mb: 3 }}
                    spacing={1.5}
                >
                    <SectionTitle
                        icon={<DescriptionOutlined sx={{ color: 'primary.main', fontSize: 20 }} />}
                        title="Documentación Crítica"
                        sx={{ mb: 0 }}
                    />
                    {criticalCount > 0 ? (
                        <Chip
                            size="small"
                            color="error"
                            icon={<WarningAmberRounded />}
                            label={`${criticalCount} documento(s) próximo(s) a vencer`}
                            sx={{ fontWeight: 700 }}
                        />
                    ) : (
                        <Chip size="small" color="success" label="Sin alertas" sx={{ fontWeight: 700 }} />
                    )}
                </Stack>

                {documentos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Sin documentos registrados.
                    </Typography>
                ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ minWidth: 720 }}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '2.1fr 1.4fr 1fr 1fr 1fr auto',
                                    gap: 1.5,
                                    pb: 1.5,
                                    mb: 0.5,
                                }}
                            >
                                {['Documento', 'N° registro', 'Emisión', 'Vencimiento', 'Estado', 'Acción'].map((header) => (
                                    <Typography key={header} sx={tableHeaderSx}>
                                        {header}
                                    </Typography>
                                ))}
                            </Box>

                            <Stack spacing={1}>
                                {documentos.map((d) => {
                                    const href = resolveDocumentHref(d.rutaArchivo);

                                    return (
                                        <Box
                                            key={d.colaboradorDocumentoId}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '2.1fr 1.4fr 1fr 1fr 1fr auto',
                                                gap: 1.5,
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 3,
                                                bgcolor: d.vigenciaEstado === 'vencido'
                                                    ? alpha('#ba1a1a', 0.06)
                                                    : mode === 'dark'
                                                        ? alpha('#ffffff', 0.04)
                                                        : '#f7f8fa',
                                            }}
                                        >
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 2,
                                                    bgcolor: d.vigenciaEstado === 'vencido'
                                                        ? alpha('#ba1a1a', 0.12)
                                                        : alpha('#005da8', 0.08),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <BadgeOutlined
                                                    sx={{
                                                        fontSize: 18,
                                                        color: d.vigenciaEstado === 'vencido' ? 'error.main' : 'primary.main',
                                                    }}
                                                />
                                            </Box>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                                                {d.tipoDocumentoNombre}
                                            </Typography>
                                        </Stack>
                                        <Typography sx={tableCellSx}>{d.numeroDocumento ?? '—'}</Typography>
                                        <Typography sx={tableCellSx}>{formatDate(d.fechaEmision)}</Typography>
                                        <Typography sx={{ ...tableCellSx, color: d.vigenciaEstado === 'vencido' ? 'error.main' : 'text.primary', fontWeight: 700 }}>
                                            {formatDate(d.fechaVencimiento)}
                                        </Typography>
                                        <Box>
                                            <Chip
                                                size="small"
                                                color={d.vigenciaEstado === 'vencido' ? 'error' : 'success'}
                                                label={d.vigenciaEstado === 'vencido' ? 'Crítico' : 'Vigente'}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            {href ? (
                                                <Button
                                                    size="small"
                                                    href={href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    sx={{ minWidth: 0, fontWeight: 700 }}
                                                >
                                                    Desc
                                                </Button>
                                            ) : (
                                                <Typography sx={{ ...tableCellSx, textAlign: 'right' }}>—</Typography>
                                            )}
                                        </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
