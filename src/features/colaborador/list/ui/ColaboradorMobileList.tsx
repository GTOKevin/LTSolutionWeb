import {
    Box,
    Typography,
    Stack,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import type { Colaborador } from '@entities/colaborador/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface ColaboradorMobileListProps {
    data?: PagedResponse<Colaborador>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (colaborador: Colaborador) => void;
    onEdit: (colaborador: Colaborador) => void;
    onDelete: (colaborador: Colaborador) => void;
}

export function ColaboradorMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: ColaboradorMobileListProps) {
    const theme = useTheme();

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando colaboradores...</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <MobileListShell
                items={data?.items || []}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                emptyMessage="No se encontraron colaboradores"
                keyExtractor={(item) => item.colaboradorID}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                renderHeader={(row) => (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main'
                        }}>
                            <PersonIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {row.nombres} {row.primerApellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {row.segundoApellido}
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderBody={(row) => (
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Chip 
                                    label={row.rolColaborador?.nombre || 'Sin Rol'} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ borderRadius: 1 }} 
                                />
                            </Box>
                            <StatusChip active={row.activo} />
                        </Box>

                        {(row.telefono || row.email) && (
                            <Box sx={{ 
                                p: 1.5, 
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                {row.telefono && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">{row.telefono}</Typography>
                                    </Box>
                                )}
                                {row.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{row.email}</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Stack>
                )}
            />
        </Box>
    );
}
