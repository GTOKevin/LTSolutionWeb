import {
    Box,
    Button,
    Grid,
    Tooltip,
    MenuItem,
    Paper,
    TextField,
    Typography,
    IconButton,
    useTheme,
    alpha,
    Collapse,
} from '@mui/material';
import {
    CleaningServices as CleaningServicesIcon,
    FilterList,
    Search as SearchIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useViajeListFilterOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { VIAJE_SELECT_KEYS, viajeResourceLoaders } from '@features/viaje/options/hooks/useViajeResourceSearch';
import { AsyncAutocomplete } from '@shared/components/ui/AsyncAutocomplete';
import type { ViajeListDraftFilters } from '../model/filters';

interface Props {
    filters: ViajeListDraftFilters;
    onFilterChange: <K extends keyof ViajeListDraftFilters>(field: K, value: ViajeListDraftFilters[K]) => void;
    onSearch: () => void;
    onReset: () => void;
    isSearching?: boolean;
}

export function ViajesFilters({ filters, onFilterChange, onSearch, onReset, isSearching = false }: Props) {
    const theme = useTheme();
    const [showFilters, setShowFilters] = useState(true);
    const { clientes, tractos, carretas, colaboradores, estados } = useViajeListFilterOptions();
    const { loadClientes, loadColaboradores, loadTractos, loadCarretas } = viajeResourceLoaders;

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden'
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        size="medium"
                        color="primary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FilterList fontSize="medium" />
                    </IconButton>
                    Filtros de Búsqueda
                </Typography>
            </Box>

            <Collapse in={showFilters}>
                <Grid container spacing={2} columns={12} sx={{ p: 2.5, alignItems: 'flex-end' }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Fecha Inicial (Partida)
                        </Typography>
                        <TextField
                            type="date"
                            fullWidth
                            size="small"
                            value={filters.fechaInicio}
                            onChange={(e) => onFilterChange('fechaInicio', e.target.value)}
                            inputProps={{ 'aria-label': 'Fecha Inicial (Partida)' }}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Fecha Final (Partida)
                        </Typography>
                        <TextField
                            type="date"
                            fullWidth
                            size="small"
                            value={filters.fechaFin}
                            onChange={(e) => onFilterChange('fechaFin', e.target.value)}
                            inputProps={{ 'aria-label': 'Fecha Final (Partida)' }}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Cliente
                        </Typography>
                        <AsyncAutocomplete
                            resourceKey={VIAJE_SELECT_KEYS.clientes}
                            label=""
                            ariaLabel="Cliente"
                            placeholder="Todos"
                            value={filters.clienteID}
                            onChange={(value) => onFilterChange('clienteID', value)}
                            loadOptions={loadClientes}
                            initialOptions={clientes}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Conductor
                        </Typography>
                        <AsyncAutocomplete
                            resourceKey={VIAJE_SELECT_KEYS.colaboradores}
                            label=""
                            ariaLabel="Conductor"
                            placeholder="Todos"
                            value={filters.colaboradorID}
                            onChange={(value) => onFilterChange('colaboradorID', value)}
                            loadOptions={loadColaboradores}
                            initialOptions={colaboradores}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Tracto
                        </Typography>
                        <AsyncAutocomplete
                            resourceKey={VIAJE_SELECT_KEYS.tractos}
                            label=""
                            ariaLabel="Tracto"
                            placeholder="Todos"
                            value={filters.tractoID}
                            onChange={(value) => onFilterChange('tractoID', value)}
                            loadOptions={loadTractos}
                            initialOptions={tractos}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Carreta
                        </Typography>
                        <AsyncAutocomplete
                            resourceKey={VIAJE_SELECT_KEYS.carretas}
                            label=""
                            ariaLabel="Carreta"
                            placeholder="Todas"
                            value={filters.carretaID}
                            onChange={(value) => onFilterChange('carretaID', value)}
                            loadOptions={loadCarretas}
                            initialOptions={carretas}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Estado
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={filters.estadoID}
                            onChange={(e) => onFilterChange('estadoID', Number(e.target.value))}
                            SelectProps={{ inputProps: { 'aria-label': 'Estado' } }}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                        >
                            <MenuItem value={0}>Todos</MenuItem>
                            {estados?.map(e => <MenuItem key={e.id} value={e.id}>{e.text}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SearchIcon />}
                            onClick={onSearch}
                            disabled={isSearching}
                            fullWidth
                            sx={{ borderRadius: 2, py: 1 }}
                        >
                            {isSearching ? 'Buscando...' : 'Buscar'}
                        </Button>
                        <Tooltip title="Restablecer filtros al estado inicial">
                            <Button
                                variant="contained"
                                color="info"
                                onClick={onReset}
                                sx={{ minWidth: 40, height: 40, px: 1 }}
                            >
                                <CleaningServicesIcon />
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Collapse>
        </Paper>
    );
}
