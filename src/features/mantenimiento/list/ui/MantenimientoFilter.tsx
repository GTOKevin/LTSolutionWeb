import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Button,
    InputAdornment,
    Paper,
    Divider,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import { 
    Search as SearchIcon, 
    FilterList as FilterListIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { SelectItem } from '@/shared/model/types';

interface MantenimientoFilterProps {
    onSearch: (query: string) => void;
    onFilter: (filters: MantenimientoFilters) => void;
    onClear: () => void;
    flotas: SelectItem[];
    estados: SelectItem[];
    initialFilters: MantenimientoFilters;
}

export interface MantenimientoFilters {
    flotaID: number;
    estadoID: number;
    desde: string;
    hasta: string;
}

export function MantenimientoFilter({
    onSearch,
    onFilter,
    onClear,
    flotas,
    estados,
    initialFilters
}: MantenimientoFilterProps) {
    const theme = useTheme();
    
    // --- Search State (Debounced) ---
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // --- Filters State (Manual) ---
    const [draftFilters, setDraftFilters] = useState<MantenimientoFilters>(initialFilters);

    const handleFilterChange = (field: keyof MantenimientoFilters, value: any) => {
        setDraftFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        onFilter(draftFilters);
    };

    const handleClear = () => {
        setSearchTerm('');
        setDraftFilters({
            flotaID: 0,
            estadoID: 0,
            desde: '',
            hasta: ''
        });
        onClear();
    };

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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                value={draftFilters.flotaID}
                                onChange={(e) => handleFilterChange('flotaID', e.target.value)}
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
                                value={draftFilters.estadoID}
                                onChange={(e) => handleFilterChange('estadoID', e.target.value)}
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
                                value={draftFilters.desde}
                                onChange={(e) => handleFilterChange('desde', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                label="Hasta"
                                type="date"
                                size="small"
                                fullWidth
                                value={draftFilters.hasta}
                                onChange={(e) => handleFilterChange('hasta', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="contained" 
                                onClick={handleApplyFilters}
                                fullWidth
                                sx={{ height: 40 }}
                            >
                                Buscar
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="inherit"
                                onClick={handleClear}
                                sx={{ minWidth: 40, px: 1 }}
                            >
                                <ClearIcon />
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Paper>
    );
}
