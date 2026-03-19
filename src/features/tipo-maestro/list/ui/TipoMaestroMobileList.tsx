import { Box, Typography, Chip, useTheme } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface TipoMaestroMobileListProps {
    data?: PagedResponse<TipoMaestro>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (maestro: TipoMaestro) => void;
}

export function TipoMaestroMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit
}: TipoMaestroMobileListProps) {
    const theme = useTheme();

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando registros...</Box>;
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
                emptyMessage="No se encontraron registros"
                keyExtractor={(item) => item.tipoMaestroID}
                onEdit={onEdit}
                renderHeader={(item) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: 2, 
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.main,
                            display: 'flex'
                        }}>
                            <CategoryIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {item.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                ID: {item.tipoMaestroID}
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderBody={(item) => (
                    <>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {item.seccion && (
                                <Chip 
                                    label={item.seccion} 
                                    size="small" 
                                    sx={{ borderRadius: 1 }} 
                                />
                            )}
                            {item.codigo && (
                                <Chip 
                                    label={`COD: ${item.codigo}`} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ borderRadius: 1, fontFamily: 'monospace' }} 
                                />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                            <StatusChip active={item.activo} />
                        </Box>
                    </>
                )}
            />
        </Box>
    );
}
