import {
    Box,
    InputAdornment,
    MenuItem,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    TableRows as TableIcon,
    ViewModule as CardsIcon,
} from '@mui/icons-material';
import {
    ESTADO_DOCUMENTAL_FILTER_OPTIONS,
    ESTADO_OPERATIVO_FILTER_OPTIONS,
} from '@entities/flota/model/constants';
import type { FlotasViewMode } from '../hooks/useFlotasPageController';

interface FlotaFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    estadoOperativo: string;
    onEstadoOperativoChange: (value: string) => void;
    estadoDocumental: string;
    onEstadoDocumentalChange: (value: string) => void;
    viewMode: FlotasViewMode;
    onViewModeChange: (mode: FlotasViewMode) => void;
}

export function FlotaFilters({
    searchTerm,
    onSearchChange,
    estadoOperativo,
    onEstadoOperativoChange,
    estadoDocumental,
    onEstadoDocumentalChange,
    viewMode,
    onViewModeChange,
}: FlotaFiltersProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                bgcolor: theme.palette.background.paper,
                p: 2,
                borderRadius: 3,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`,
                flexWrap: 'wrap',
                alignItems: 'center',
            }}
        >
            <Box sx={{ flex: 1, minWidth: '220px' }}>
                <TextField
                    placeholder="Buscar por placa, marca, modelo o VIN..."
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 },
                    }}
                />
            </Box>

            <TextField
                select
                size="small"
                label="Estado Operativo"
                value={estadoOperativo}
                onChange={(event) => onEstadoOperativoChange(event.target.value)}
                sx={{ minWidth: 190 }}
            >
                {ESTADO_OPERATIVO_FILTER_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                size="small"
                label="Estado Documental"
                value={estadoDocumental}
                onChange={(event) => onEstadoDocumentalChange(event.target.value)}
                sx={{ minWidth: 210 }}
            >
                {ESTADO_DOCUMENTAL_FILTER_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>

            <ToggleButtonGroup
                value={viewMode}
                exclusive
                size="small"
                onChange={(_, next: FlotasViewMode | null) => {
                    if (next) onViewModeChange(next);
                }}
                aria-label="Modo de vista"
            >
                <ToggleButton value="table" aria-label="Vista de tabla">
                    <Tooltip title="Tabla">
                        <TableIcon fontSize="small" />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="cards" aria-label="Vista de tarjetas">
                    <Tooltip title="Tarjetas">
                        <CardsIcon fontSize="small" />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
