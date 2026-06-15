import { Box, Card, CardContent, Chip, IconButton, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
    AccountCircleOutlined,
    HistoryOutlined,
    LockResetOutlined,
    PhoneIphoneOutlined,
    VerifiedUserOutlined,
} from '@mui/icons-material';
import { MetaLine, cardSx, heroActionSx } from './ProfileShared';

interface ProfileHeroProps {
    title: string;
    subtitle: string;
    email: string;
    telefono?: string | null;
    initials: string;
    isFetching: boolean;
    isActivoColaborador: boolean;
    isPerfilColaborador: boolean;
    onOpenChangePassword: () => void;
    onRetry: () => void;
}

export function ProfileHero({
    title,
    subtitle,
    email,
    telefono,
    initials,
    isFetching,
    isActivoColaborador,
    isPerfilColaborador,
    onOpenChangePassword,
    onRetry,
}: ProfileHeroProps) {
    const theme = useTheme();

    return (
        <Card
            sx={{
                ...cardSx(theme.palette.mode),
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 'auto -60px -60px auto',
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    filter: 'blur(16px)',
                }}
            />
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                sx={{
                                    width: 112,
                                    height: 112,
                                    borderRadius: 3,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    color: theme.palette.common.white,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 34,
                                    fontWeight: 800,
                                    boxShadow: `0 18px 40px ${alpha(theme.palette.primary.main, 0.22)}`,
                                }}
                            >
                                {initials}
                            </Box>
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    letterSpacing: '0.18em',
                                    color: 'text.secondary',
                                    mb: 1,
                                }}
                            >
                                {isPerfilColaborador ? 'PERFIL DEL COLABORADOR' : 'PERFIL DEL USUARIO'}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography
                                    sx={{
                                        fontSize: { xs: 32, md: 42 },
                                        lineHeight: 1,
                                        fontWeight: 900,
                                        letterSpacing: '-0.03em',
                                        maxWidth: 520,
                                    }}
                                >
                                    {title}
                                </Typography>
                                {isFetching ? <Chip size="small" label="Actualizando" /> : null}
                            </Stack>
                            <Stack spacing={1.25} sx={{ mt: 2 }}>
                                <MetaLine icon={<VerifiedUserOutlined sx={{ fontSize: 18, color: 'primary.main' }} />} text={subtitle} />
                                <MetaLine icon={<AccountCircleOutlined sx={{ fontSize: 18, color: 'primary.main' }} />} text={email} />
                                {telefono ? (
                                    <MetaLine icon={<PhoneIphoneOutlined sx={{ fontSize: 18, color: 'primary.main' }} />} text={telefono} />
                                ) : null}
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack direction={{ xs: 'row', md: 'column' }} spacing={1.25}>
                        <IconButton sx={heroActionSx(theme.palette.mode)} onClick={onOpenChangePassword}>
                            <LockResetOutlined />
                        </IconButton>
                        <IconButton sx={heroActionSx(theme.palette.mode)} onClick={onRetry}>
                            <HistoryOutlined />
                        </IconButton>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

