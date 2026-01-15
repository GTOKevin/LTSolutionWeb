import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    Button,
    InputAdornment,
    Typography,
    useTheme,
    alpha,
    Collapse
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import type { SelestListItem } from '@/shared/model/types';

interface UsuarioFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    roleFilter: string;
    onRoleChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    roles: SelestListItem[];
    estados: SelestListItem[];
    onApplyFilters: () => void;
    showFilters: boolean;
    onToggleFilters: () => void;
}

export function UsuarioFilter({
    searchTerm,
    onSearchChange,
    roleFilter,
    onRoleChange,
    statusFilter,
    onStatusChange,
    roles,
    estados,
    onApplyFilters,
    showFilters,
    onToggleFilters
}: UsuarioFilterProps) {
    const theme = useTheme();

    return (
        <Card sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[1],
            border: `1px solid ${theme.palette.divider}`,
            mb: 3
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        display: 'flex',
                        cursor: 'pointer'
                    }} onClick={onToggleFilters}>
                        <FilterListIcon fontSize="small" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Filtros de Búsqueda
                    </Typography>
                </Box>

                <Collapse in={showFilters}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{xs:12,md:4}}>
                        <TextField
                            placeholder="Buscar por Nombre o Email..."
                            fullWidth
                            size="small"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid size={{xs:12,sm:6,md:3}}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Rol"
                            value={roleFilter}
                            onChange={(e) => onRoleChange(e.target.value)}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        >
                            <MenuItem value="0">Todos los Roles</MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id.toString()}>
                                    {role.text}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{xs:12,sm:6,md:3}}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Estado"
                            value={statusFilter}
                            onChange={(e) => onStatusChange(e.target.value)}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        >
                            <MenuItem value="0">Todos los Estados</MenuItem>
                            {estados.map((estado) => (
                                <MenuItem key={estado.id} value={estado.id.toString()}>
                                    {estado.text}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{xs:12,md:2}}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<SearchIcon />}
                            onClick={onApplyFilters}
                            sx={{ 
                                borderRadius: 2,
                                height: 40,
                                fontWeight: 'bold',
                                boxShadow: 'none'
                            }}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
                </Collapse>
            </CardContent>
        </Card>
    );
}
