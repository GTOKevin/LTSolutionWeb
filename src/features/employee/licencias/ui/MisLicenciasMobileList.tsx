import { Box, Stack, Typography } from '@mui/material';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { formatDateOnly } from '@shared/utils/date-utils';
import type { PagedResponse } from '@shared/model/types';
import type { MiLicenciaDto } from '@entities/employee/model/types';

interface MisLicenciasMobileListProps {
    data?: PagedResponse<MiLicenciaDto>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function resolveStatusLabel(estadoRevision: string) {
    if (estadoRevision === 'aprobada') {
        return 'Aprobada';
    }

    if (estadoRevision === 'rechazada') {
        return 'Rechazada';
    }

    return 'Pendiente';
}

function resolveStatusColor(estadoRevision: string) {
    if (estadoRevision === 'aprobada') {
        return 'success';
    }

    if (estadoRevision === 'rechazada') {
        return 'error';
    }

    return 'warning';
}

export function MisLicenciasMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: MisLicenciasMobileListProps) {
    if (isLoading) {
        return <Box sx={{ display: { xs: 'block', md: 'none' }, p: 4, textAlign: 'center' }}>Cargando licencias...</Box>;
    }

    return (
        <MobileListShell
            items={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            emptyMessage="No se encontraron licencias con los filtros seleccionados."
            keyExtractor={(item) => item.colaboradorLicenciaId}
            renderHeader={(item) => {
                const statusColor = resolveStatusColor(item.estadoRevision);

                return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {item.tipoLicenciaNombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDateOnly(item.fechaInicial)}
                                {item.fechaFinal ? ` al ${formatDateOnly(item.fechaFinal)}` : ''}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1.25,
                                py: 0.5,
                                borderRadius: 99,
                                bgcolor: `${statusColor}.50`,
                                color: `${statusColor}.dark`,
                                height: 'fit-content',
                            }}
                        >
                            <Typography variant="caption" fontWeight={700}>
                                {resolveStatusLabel(item.estadoRevision)}
                            </Typography>
                        </Box>
                    </Box>
                );
            }}
            renderBody={(item) => (
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        Descripción: {item.descripcion || 'Sin descripción'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Resolución: {item.fechaAceptacion ? formatDateOnly(item.fechaAceptacion) : 'Sin resolución'}
                    </Typography>
                </Stack>
            )}
        />
    );
}
