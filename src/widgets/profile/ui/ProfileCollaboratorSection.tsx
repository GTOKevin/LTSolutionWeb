import { AccountCircleOutlined } from '@mui/icons-material';
import { Card, CardContent, Chip, Stack, Typography, useTheme } from '@mui/material';
import { Field, SectionTitle } from './ProfileShared';
import { cardSx } from './ProfileShared.helpers';

interface ProfileCollaboratorSectionProps {
    nombreCompleto: string;
    rolColaborador: string;
    telefono: string | null;
    activo: boolean;
}

export function ProfileCollaboratorSection({ nombreCompleto, rolColaborador, telefono, activo }: ProfileCollaboratorSectionProps) {
    const theme = useTheme();

    return (
        <Card sx={cardSx(theme.palette.mode)}>
            <CardContent sx={{ p: 3 }}>
                <SectionTitle
                    icon={<AccountCircleOutlined sx={{ color: 'primary.main', fontSize: 20 }} />}
                    title="Datos Personales"
                />
                <Stack spacing={2.25}>
                    <Field label="Nombre completo" value={nombreCompleto} />
                    <Field label="Rol de colaborador" value={rolColaborador || '—'} />
                    <Field label="Teléfono" value={telefono ?? '—'} />
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Estado:
                        </Typography>
                        <Chip size="small" color={activo ? 'success' : 'default'} label={activo ? 'Activo' : 'Inactivo'} />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
