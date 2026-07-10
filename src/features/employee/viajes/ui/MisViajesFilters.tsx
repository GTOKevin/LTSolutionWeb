import { Box, Button, TextField, Typography } from '@mui/material';

interface MisViajesFiltersProps {
    search: string;
    desde: string;
    hasta: string;
    onSearchChange: (value: string) => void;
    onDesdeChange: (value: string) => void;
    onHastaChange: (value: string) => void;
    onSearch: () => void;
}

export function MisViajesFilters({
    search,
    desde,
    hasta,
    onSearchChange,
    onDesdeChange,
    onHastaChange,
    onSearch,
}: MisViajesFiltersProps) {
    return (
        <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 3, display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 } }}> 
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>FILTRO RÁPIDO</Typography>
                <TextField
                    fullWidth
                    placeholder="Código, Cliente o Placa..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && onSearch()}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 3, '& fieldset': { border: 'none' } } }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ width: { xs: '100%', sm: 160 } }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>DESDE</Typography>
                    <TextField
                        fullWidth
                        type="date"
                        value={desde}
                        onChange={(e) => onDesdeChange(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 3, '& fieldset': { border: 'none' } } }}
                    />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 160 } }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>HASTA</Typography>
                    <TextField
                        fullWidth
                        type="date"
                        value={hasta}
                        onChange={(e) => onHastaChange(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 3, '& fieldset': { border: 'none' } } }}
                    />
                </Box>
            </Box>
            <Button 
                variant="contained"
                onClick={onSearch} 
                sx={{ px: 4, py: 2, borderRadius: 3, fontWeight: 700, bgcolor: 'action.selected', color: 'text.primary', '&:hover': { bgcolor: 'action.disabledBackground' }, boxShadow: 'none' }}
            >
                Aplicar Filtros
            </Button>
        </Box>
    );
}
