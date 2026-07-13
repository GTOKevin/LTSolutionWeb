import { BadgeOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Stack, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { Field, SectionTitle } from './ProfileShared';
import { cardSx, formatDate, formatDateTime } from './ProfileShared.helpers';

interface ProfileAccountSectionProps {
    nombreUsuario: string;
    email: string | null;
    rolUsuario: string;
    estado: string;
    ultimoAcceso: string | null;
    bloqueado: boolean;
    fechaRegistro: string;
    title?: string;
    leadingIcon?: ReactNode;
    fieldLabels?: {
        nombre?: string;
        email?: string;
        rol?: string;
        estado?: string;
        ultimoAcceso?: string;
        fechaRegistro?: string;
    };
}

export function ProfileAccountSection(props: ProfileAccountSectionProps) {
    const theme = useTheme();

    return (
        <Card sx={cardSx(theme.palette.mode)}>
            <CardContent sx={{ p: 3 }}>
                <SectionTitle
                    icon={props.leadingIcon ?? <BadgeOutlined sx={{ color: 'primary.main', fontSize: 20 }} />}
                    title={props.title ?? 'Datos de Cuenta'}
                />
                <Stack spacing={2.25}>
                    <Field label={props.fieldLabels?.nombre ?? 'Usuario'} value={props.nombreUsuario} />
                    <Field label={props.fieldLabels?.email ?? 'Email'} value={props.email ?? '—'} />
                    <Field label={props.fieldLabels?.rol ?? 'Rol'} value={props.rolUsuario} />
                    <Field label={props.fieldLabels?.estado ?? 'Estado'} value={props.estado} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Field compact label={props.fieldLabels?.ultimoAcceso ?? 'Último acceso'} value={props.ultimoAcceso ? formatDateTime(props.ultimoAcceso) : 'Sin registro'} />
                        <Field compact label={props.fieldLabels?.fechaRegistro ?? 'Miembro desde'} value={props.fechaRegistro ? formatDate(props.fechaRegistro) : '—'} />
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Seguridad:
                        </Typography>
                        <Chip size="small" color={props.bloqueado ? 'error' : 'success'} label={props.bloqueado ? 'Bloqueado' : 'Activo'} />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
