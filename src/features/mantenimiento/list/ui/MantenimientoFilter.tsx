import {
    Box,
    Button,
    Divider,
    Grid,
    InputAdornment,
    MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import { 
    CleaningServices as CleaningServicesIcon,
    FilterList as FilterListIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import type { SelectItem } from '@/shared/model/types';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';
import type { MantenimientoListDraftState } from '../model/types';

interface MantenimientoFilterProps {
    draftState: MantenimientoListDraftState;
    onDraftChange: <K extends keyof MantenimientoListDraftState>(field: K, value: MantenimientoListDraftState[K]) => void;
    onSearch: () => void;
    onClear: () => void;
    flotas: SelectItem[];
    estados: SelectItem[];
    isSearching?: boolean;
}

export function MantenimientoFilter({
    draftState,
    onDraftChange,
    onSearch,
    onClear,
    flotas,
    estados,
    isSearching = false,
}: MantenimientoFilterProps) {
    const theme = useTheme();

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: 'background.paper'
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                
                {/* Section 1: Search Bar (Independent) */}
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Búsqueda Rápida
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Buscar por ID, vehículo, motivo..."
                        value={draftState.search}
                        onChange={(e) => onDraftChange('search', handleSanitizeSearchInput(e.target.value))}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { bgcolor: alpha(theme.palette.background.default, 0.5) }
                        }}
                        size="medium"
                    />
                </Box>

                <Divider />

                {/* Section 2: Advanced Filters (Manual Trigger) */}
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon fontSize="small" /> Filtros Avanzados
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                select
                                label="Vehículo"
                                size="small"
                                fullWidth
                                value={draftState.flotaID}
                                onChange={(e) => onDraftChange('flotaID', Number(e.target.value))}
                            >
                                <MenuItem value={0}>Todos</MenuItem>
                                {flotas.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>{item.text}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                select
                                label="Estado"
                                size="small"
                                fullWidth
                                value={draftState.estadoID}
                                onChange={(e) => onDraftChange('estadoID', Number(e.target.value))}
                            >
                                <MenuItem value={0}>Todos</MenuItem>
                                {estados.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>{item.text}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                label="Desde"
                                type="date"
                                size="small"
                                fullWidth
                                value={draftState.desde}
                                onChange={(e) => onDraftChange('desde', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ max: draftState.hasta || undefined }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                label="Hasta"
                                type="date"
                                size="small"
                                fullWidth
                                value={draftState.hasta}
                                onChange={(e) => onDraftChange('hasta', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: draftState.desde || undefined }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="contained" 
                                onClick={onSearch}
                                disabled={isSearching}
                                fullWidth
                                sx={{ height: 40 }}
                            >
                                {isSearching ? 'Buscando...' : 'Buscar'}
                            </Button>
                            <Tooltip title="Restablecer filtros al estado inicial">
                                <Button
                                    variant="contained"
                                    color="info"
                                    onClick={onClear}
                                    sx={{ minWidth: 40, height: 40, px: 1 }}
                                >
                                    <CleaningServicesIcon />
                                </Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Paper>
    );
}
