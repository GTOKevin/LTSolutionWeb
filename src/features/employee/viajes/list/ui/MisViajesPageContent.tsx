import { Box, Chip, Pagination, Stack, Typography } from '@mui/material';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { formatDateOnly } from '@shared/utils/date-utils';
import type { MiViajeListItemDto } from '@entities/employee/model/types';
import { MisViajesFilters } from '../../ui/MisViajesFilters';
import { MisViajesGrid } from '../../ui/MisViajesGrid';
import { MisViajesKPIs } from '../../ui/MisViajesKPIs';
import type { useMisViajesPageController } from '../hooks/useMisViajesPageController';

function buildStatusColor(item: MiViajeListItemDto): 'default' | 'success' | 'warning' {
    if (item.cerrado) return 'success';
    return 'warning';
}

interface MisViajesPageContentProps {
    controller: ReturnType<typeof useMisViajesPageController>;
}

export function MisViajesPageContent({ controller }: MisViajesPageContentProps) {
    const isRefreshing = controller.isFetching && !controller.isLoading;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: '100%', flex: '1 0 auto' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'flex-end' }, gap: 4 }}>
                <Box>
                    <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                        Mis Viajes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión operativa de rutas y despachos asignados.
                    </Typography>
                </Box>
                <MisViajesKPIs
                    total={controller.totals.totalVisible}
                    abiertos={controller.totals.abiertos}
                    cerrados={controller.totals.cerrados}
                    isRefreshing={isRefreshing}
                />
            </Box>

            <MisViajesFilters
                search={controller.search}
                desde={controller.desde}
                hasta={controller.hasta}
                onSearchChange={controller.setSearch}
                onDesdeChange={controller.setDesde}
                onHastaChange={controller.setHasta}
                onSearch={controller.handleSearch}
            />

            {isRefreshing ? (
                <Box sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}>
                    Actualizando viajes segun los filtros aplicados...
                </Box>
            ) : null}

            <MisViajesGrid
                items={controller.data?.items ?? []}
                onNavigate={controller.handleNavigate}
            />

            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <MobileListShell
                    items={controller.data?.items ?? []}
                    total={controller.data?.total ?? 0}
                    page={controller.page}
                    rowsPerPage={controller.rowsPerPage}
                    onPageChange={controller.handleChangePage}
                    onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    keyExtractor={(item) => item.viajeId}
                    emptyMessage="No tienes viajes registrados con los filtros seleccionados."
                    onView={(item) => controller.handleNavigate(item.viajeId)}
                    getCardStyle={(item, theme) => ({
                        borderRadius: 4,
                        borderColor: item.cerrado ? theme.palette.success.light : theme.palette.warning.light,
                    })}
                    renderHeader={(item) => (
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                {item.codigo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDateOnly(item.fechaCarga)}
                            </Typography>
                        </Stack>
                    )}
                    renderBody={(item) => (
                        <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={700}>{item.clienteRazonSocial}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.origenDescripcion}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.destinoDescripcion}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Unidad: {item.tractoPlaca} {item.carretaPlaca ? `/ ${item.carretaPlaca}` : ''}
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip label={item.estadoNombre} size="small" variant="outlined" />
                                <Chip label={item.cerrado ? 'Cerrado' : 'En curso'} size="small" color={buildStatusColor(item)} />
                            </Stack>
                        </Stack>
                    )}
                />
            </Box>

            {controller.totals.total === 0 && !controller.isLoading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No tienes viajes registrados con los filtros seleccionados.
                    </Typography>
                </Box>
            ) : null}

            {controller.totals.total > 0 ? (
                <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {isRefreshing
                            ? 'Actualizando resultados de la consulta...'
                            : `Mostrando ${(controller.data?.items ?? []).length} de ${controller.totals.total} registros encontrados`}
                    </Typography>
                    <Pagination
                        count={Math.ceil(controller.totals.total / controller.rowsPerPage)}
                        page={controller.page + 1}
                        onChange={(_, newPage) => controller.handleChangePage(_, newPage - 1)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            ) : null}
        </Box>
    );
}
