import { Alert, Box, Button, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import { AccountCircleOutlined } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import type { MyProfileDto } from '@entities/profile/model/types';
import { SelfChangePasswordModal } from '@features/auth/change-password';
import { cardSx } from './ProfileShared.helpers';
import { ProfileHero } from './ProfileHero';
import { ProfileMetrics } from './ProfileMetrics';
import { ProfileAccountSection } from './ProfileAccountSection';
import { ProfileCollaboratorSection } from './ProfileCollaboratorSection';
import { ProfileSecuritySection } from './ProfileSecuritySection';
import { ProfileDocumentsSection } from './ProfileDocumentsSection';
import { ProfileLicenciasAusenciasSection } from './ProfileLicenciasAusenciasSection';
import { ProfileRecentTripsSection } from './ProfileRecentTripsSection';
import { isDocumentExpired, isDocumentVigente } from '@shared/utils/document-vigencia';

interface ProfileViewProps {
    data?: MyProfileDto;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    onRetry: () => void;
}

export function ProfileView({ data, isLoading, isFetching, isError, onRetry }: ProfileViewProps) {
    const theme = useTheme();
    const [openChangePassword, setOpenChangePassword] = useState(false);

    const headerTitle = useMemo(() => {
        if (data?.colaborador?.nombreCompleto) return data.colaborador.nombreCompleto;
        return data?.usuario.nombreUsuario ?? 'Perfil';
    }, [data]);

    const headerSubtitle = useMemo(() => {
        if (!data) return '';
        return data.colaborador?.rolColaboradorNombre || data.usuario.rolUsuarioNombre;
    }, [data]);

    const initials = useMemo(() => {
        const value = headerTitle
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0]?.toUpperCase() ?? '')
            .join('');

        return value || 'PU';
    }, [headerTitle]);

    if (isLoading && !data) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Card sx={cardSx(theme.palette.mode)}>
                    <CardContent>
                        <Typography variant="h6">Cargando perfil...</Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={onRetry}>
                            Reintentar
                        </Button>
                    }
                >
                    No se pudo cargar el perfil.
                </Alert>
            </Box>
        );
    }

    if (!data) return null;

    const documentosCriticos = data.documentos.filter(doc => isDocumentExpired(doc.vigenciaEstado)).length;
    const documentosVigentes = data.documentos.filter(doc => isDocumentVigente(doc.vigenciaEstado)).length;
    const actividadPercent = data.documentos.length > 0
        ? Math.round((documentosVigentes / data.documentos.length) * 1000) / 10
        : 0;
    const totalRegistrosLicencias = data.licencias.length + data.ausencias.length;
    const hasCollaborator = !!data.colaborador;

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: theme.palette.mode === 'dark' ? '#12161d' : '#f3f4f5' }}>
            <Stack spacing={3}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.9fr) minmax(280px, 1fr)' },
                        gap: 3,
                    }}
                >
                    <ProfileHero
                        title={headerTitle}
                        subtitle={headerSubtitle}
                        email={data.usuario.email ?? 'Sin correo registrado'}
                        telefono={data.colaborador?.telefono}
                        initials={initials}
                        isFetching={isFetching}
                        isActivoColaborador={data.colaborador?.activo ?? false}
                        isPerfilColaborador={hasCollaborator}
                        onOpenChangePassword={() => setOpenChangePassword(true)}
                        onRetry={onRetry}
                    />

                    <ProfileMetrics
                        viajesCount={data.ultimosViajes.length}
                        ultimaFechaViaje={data.ultimosViajes[0]?.fechaCarga ?? null}
                        actividadPercent={actividadPercent}
                        documentosCriticos={documentosCriticos}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', xl: '360px minmax(0, 1fr)' },
                        gap: 3,
                    }}
                >
                    <Stack spacing={3} sx={{ minWidth: 0 }}>
                        <ProfileAccountSection
                            nombreUsuario={data.usuario.nombreUsuario}
                            email={data.usuario.email}
                            rolUsuario={data.usuario.rolUsuarioNombre}
                            estado={data.usuario.estadoNombre}
                            ultimoAcceso={data.usuario.ultimoAcceso}
                            bloqueado={data.usuario.bloqueado}
                            fechaRegistro={data.usuario.fechaRegistro}
                        />

                        {data.colaborador ? (
                            <ProfileCollaboratorSection
                                nombreCompleto={data.colaborador.nombreCompleto}
                                rolColaborador={data.colaborador.rolColaboradorNombre}
                                telefono={data.colaborador.telefono}
                                activo={data.colaborador.activo}
                            />
                        ) : (
                            <Card sx={cardSx(theme.palette.mode)}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                                        <AccountCircleOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
                                        <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
                                            Datos Personales
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        Tu cuenta no tiene un colaborador asociado. Solo se muestran datos de acceso.
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        <ProfileSecuritySection
                            bloqueado={data.usuario.bloqueado}
                            onOpenChangePassword={() => setOpenChangePassword(true)}
                        />
                    </Stack>

                    <Stack spacing={3} sx={{ minWidth: 0 }}>
                        <ProfileDocumentsSection documentos={data.documentos} criticalCount={documentosCriticos} />

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr'},
                                gap: 3,
                            }}
                        >

                            <ProfileLicenciasAusenciasSection
                                licencias={data.licencias}
                                ausencias={data.ausencias}
                                total={totalRegistrosLicencias}
                            />
                        </Box>

                        {data.colaborador?.esConductor ? (
                            <ProfileRecentTripsSection viajes={data.ultimosViajes} />
                        ) : null}
                    </Stack>
                </Box>
            </Stack>

            <SelfChangePasswordModal
                open={openChangePassword}
                onClose={() => setOpenChangePassword(false)}
                usuarioNombre={data.colaborador?.nombreCompleto ?? data.usuario.nombreUsuario}
                onSuccess={() => undefined}
            />
        </Box>
    );
}
