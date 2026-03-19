import { Box, Typography, useTheme } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import type { RolUsuario } from '@entities/rol-usuario/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface RolUsuarioMobileListProps {
    data?: PagedResponse<RolUsuario>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (rol: RolUsuario) => void;
}

export function RolUsuarioMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit
}: RolUsuarioMobileListProps) {
    const theme = useTheme();

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando roles...</Box>;
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
                emptyMessage="No se encontraron roles"
                keyExtractor={(item) => item.rolUsuarioID}
                onEdit={onEdit}
                renderHeader={(rol) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: 2, 
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.main,
                            display: 'flex'
                        }}>
                            <SecurityIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {rol.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                ID: {rol.rolUsuarioID}
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderBody={(rol) => (
                    <>
                        {rol.descripcion && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {rol.descripcion}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                            <StatusChip active={rol.estado} />
                        </Box>
                    </>
                )}
            />
        </Box>
    );
}
