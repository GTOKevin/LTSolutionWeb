import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Chip,
    Stack,
    Pagination,
    Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { APP_PATHS, buildAppDetailPath } from '@app/router/model/navigation';
import { useLayoutStore } from '@shared/store/layout.store';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@/entities/employee/api/employee-portal.api';
import type { MiViajeFilters, MiViajeListItemDto } from '@entities/employee/model/types';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO, formatDateOnly } from '@shared/utils/date-utils';
import { ROWS_PER_PAGE_OPTIONS } from '@shared/constants/constantes';
import { MisViajesKPIs } from '@/features/employee/viajes/ui/MisViajesKPIs';
import { MisViajesFilters } from '@/features/employee/viajes/ui/MisViajesFilters';
import { MisViajesGrid } from '@/features/employee/viajes/ui/MisViajesGrid';

function buildStatusColorFunc(item: MiViajeListItemDto): 'default' | 'success' | 'warning' {
    if (item.cerrado) return 'success';
    return 'warning';
}

export function MisViajesPage() {
    const navigate = useNavigate();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
    const [search, setSearch] = useState('');
    const [desde, setDesde] = useState(getFirstDayOfCurrentMonthISO());
    const [hasta, setHasta] = useState(getLastDayOfCurrentMonthISO());
    const [filters, setFilters] = useState<Omit<MiViajeFilters, 'page' | 'size'>>({
        search: '',
        desde: getFirstDayOfCurrentMonthISO(),
        hasta: getLastDayOfCurrentMonthISO(),
    });

    useEffect(() => {
        setPageTitle('Mis Viajes');
    }, [setPageTitle]);

    const queryFilters = useMemo<MiViajeFilters>(() => ({
        ...filters,
        page: page + 1,
        size: rowsPerPage,
    }), [filters, page, rowsPerPage]);

    const { data, isLoading } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajes(queryFilters),
        queryFn: () => employeePortalApi.getMyViajes(queryFilters),
        placeholderData: (previousData) => previousData,
    });

    const totals = useMemo(() => {
        const items = data?.items ?? [];
        return {
            total: data?.total ?? 0,
            totalVisible: items.length,
            cerrados: items.filter((item) => item.cerrado).length,
            abiertos: items.filter((item) => !item.cerrado).length,
        };
    }, [data]);

    const handleSearch = () => {
        setPage(0);
        setFilters({
            search: search.trim() || undefined,
            desde: desde || undefined,
            hasta: hasta || undefined,
        });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: '100%', flex: '1 0 auto' }}>
            {/* Page Heading & KPIs */}
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
                    total={totals.totalVisible}
                    abiertos={totals.abiertos}
                    cerrados={totals.cerrados}
                />
            </Box>

            {/* Filters Section */}
            <MisViajesFilters 
                search={search}
                desde={desde}
                hasta={hasta}
                onSearchChange={setSearch}
                onDesdeChange={setDesde}
                onHastaChange={setHasta}
                onSearch={handleSearch}
            />

            {/* Trips Grid */}
            <MisViajesGrid 
                items={data?.items ?? []} 
                onNavigate={(id) => navigate(buildAppDetailPath(APP_PATHS.misViajes, id))}
            />

            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <MobileListShell
                    items={data?.items ?? []}
                    total={data?.total ?? 0}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    keyExtractor={(item) => item.viajeId}
                    emptyMessage="No tienes viajes registrados con los filtros seleccionados."
                    onView={(item) => navigate(buildAppDetailPath(APP_PATHS.misViajes, item.viajeId))}
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
                                <Chip label={item.cerrado ? 'Cerrado' : 'En curso'} size="small" color={buildStatusColorFunc(item)} />
                            </Stack>
                        </Stack>
                    )}
                />
            </Box>

            {totals.total === 0 && !isLoading && (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">No tienes viajes registrados con los filtros seleccionados.</Typography>
                </Box>
            )}

            {(totals.total ?? 0) > 0 && (
                <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Mostrando {(data?.items ?? []).length} de {totals.total} registros encontrados
                    </Typography>
                    <Pagination 
                        count={Math.ceil((totals.total ?? 0) / rowsPerPage)} 
                        page={page + 1} 
                        onChange={(_, newPage) => setPage(newPage - 1)} 
                        color="primary" 
                        shape="rounded"
                    />
                </Box>
            )}
        </Box>
    );
}
