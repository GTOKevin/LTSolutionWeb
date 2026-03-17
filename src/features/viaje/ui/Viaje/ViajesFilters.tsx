import { 
    Box, 
    Button, 
    TextField, 
    MenuItem, 
    Paper, 
    Typography, 
    IconButton,
    useTheme,
    alpha,
    Collapse,
    Grid,
    useMediaQuery
} from '@mui/material';
import { 
    FilterList,
    Search as SearchIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeFilters } from '@entities/viaje/model/types';
import { useViajeOptions } from '@features/viaje/hooks/useViajeOptions';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';

interface Props {
    onSearch: (filters: ViajeFilters) => void;
}

export function ViajesFilters({ onSearch }: Props) {
    const theme = useTheme();
    const [showFilters, setShowFilters] = useState(true);
    const { clientes, tractos, carretas, colaboradores, estados } = useViajeOptions();

    const [filters, setFilters] = useState<ViajeFilters>({
        page: 1,
        size: 10,
        fechaInicio: getFirstDayOfCurrentMonthISO(),
        fechaFin: getLastDayOfCurrentMonthISO(),
        clienteID: 0,
        colaboradorID: 0,
        tractoID: 0,
        carretaID: 0,
        estadoID: 0
    });

    const handleChange = (field: keyof ViajeFilters, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        onSearch({
            ...filters,
            clienteID: filters.clienteID === 0 ? undefined : filters.clienteID,
            colaboradorID: filters.colaboradorID === 0 ? undefined : filters.colaboradorID,
            tractoID: filters.tractoID === 0 ? undefined : filters.tractoID,
            carretaID: filters.carretaID === 0 ? undefined : filters.carretaID,
            estadoID: filters.estadoID === 0 ? undefined : filters.estadoID,
            fechaInicio: filters.fechaInicio || undefined,
            fechaFin: filters.fechaFin || undefined
        });
    };

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
                        size='medium'
                        color='primary'
                        onClick={() => setShowFilters(!showFilters)}
                        >
                        <FilterList fontSize="medium" />
                    </IconButton>
                    Filtros de Búsqueda
                </Typography>
            </Box>

            <Collapse in={showFilters}>
                <Grid container spacing={2} columns={12} sx={{ p: 2.5, alignItems: 'flex-end' }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg:3}}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Fecha Inicial (Partida)
                        </Typography>
                        <TextField
                            type="date"
                            fullWidth
                            size="small"
                            value={filters.fechaInicio}
                            onChange={(e) => handleChange('fechaInicio', e.target.value)}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3}}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Fecha Final (Partida)
                        </Typography>
                        <TextField
                            type="date"
                            fullWidth
                            size="small"
                            value={filters.fechaFin}
                            onChange={(e) => handleChange('fechaFin', e.target.value)}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3}}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Cliente
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={filters.clienteID}
                            onChange={(e) => handleChange('clienteID', Number(e.target.value))}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                        >
                            <MenuItem value={0}>Todos</MenuItem>
                            {clientes?.map(c => <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3}} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Conductor
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={filters.colaboradorID}
                            onChange={(e) => handleChange('colaboradorID', Number(e.target.value))}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                        >
                            <MenuItem value={0}>Todos</MenuItem>
                            {colaboradores?.map(c => <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3}} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Tracto
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={filters.tractoID}
                            onChange={(e) => handleChange('tractoID', Number(e.target.value))}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                        >
                            <MenuItem value={0}>Todos</MenuItem>
                            {tractos?.map(t => <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3}} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Carreta
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={filters.carretaID}
                            onChange={(e) => handleChange('carretaID', Number(e.target.value))}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                        >
                            <MenuItem value={0}>Todas</MenuItem>
                            {carretas?.map(c => <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3}} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                            Estado
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={filters.estadoID}
                            onChange={(e) => handleChange('estadoID', Number(e.target.value))}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                        >
                            <MenuItem value={0}>Todos</MenuItem>
                            {estados?.map(e => <MenuItem key={e.id} value={e.id}>{e.text}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3}} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            fullWidth
                            sx={{ borderRadius: 2, py: 1 }}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
            </Collapse>
        </Paper>
    );
}
