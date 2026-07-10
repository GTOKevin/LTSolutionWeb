import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';

interface SelectItem {
    id: number;
    text: string;
}

interface MisPagosFiltersProps {
    tipoPagoID: number | '';
    monedaID: number | '';
    desde: string;
    hasta: string;
    tiposPago?: SelectItem[];
    monedas?: SelectItem[];
    onTipoPagoChange: (value: number | '') => void;
    onMonedaChange: (value: number | '') => void;
    onDesdeChange: (value: string) => void;
    onHastaChange: (value: string) => void;
    onSearch: () => void;
}

export function MisPagosFilters({
    tipoPagoID,
    monedaID,
    desde,
    hasta,
    tiposPago = [],
    monedas = [],
    onTipoPagoChange,
    onMonedaChange,
    onDesdeChange,
    onHastaChange,
    onSearch,
}: MisPagosFiltersProps) {
    return (
        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>TIPO DE PAGO</Typography>
                <TextField
                    select
                    fullWidth
                    value={tipoPagoID}
                    onChange={(event) => onTipoPagoChange(event.target.value === '' ? '' : Number(event.target.value))}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 3, '& fieldset': { border: 'none' } } }}
                >
                    <MenuItem value="">Todos los tipos</MenuItem>
                    {tiposPago.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                    ))}
                </TextField>
            </Box>
            <Box sx={{ flex: 1, minWidth: 140 }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>MONEDA</Typography>
                <TextField
                    select
                    fullWidth
                    value={monedaID}
                    onChange={(event) => onMonedaChange(event.target.value === '' ? '' : Number(event.target.value))}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 3, '& fieldset': { border: 'none' } } }}
                >
                    <MenuItem value="">Todas</MenuItem>
                    {monedas.map((moneda) => (
                        <MenuItem key={moneda.id} value={moneda.id}>{moneda.text}</MenuItem>
                    ))}
                </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 2, minWidth: 300 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>DESDE</Typography>
                    <TextField
                        fullWidth
                        type="date"
                        value={desde}
                        onChange={(event) => onDesdeChange(event.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 3, '& fieldset': { border: 'none' } } }}
                    />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>HASTA</Typography>
                    <TextField
                        fullWidth
                        type="date"
                        value={hasta}
                        onChange={(event) => onHastaChange(event.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', borderRadius: 3, '& fieldset': { border: 'none' } } }}
                    />
                </Box>
            </Box>
            <Button 
                variant="contained" 
                onClick={onSearch} 
                sx={{ px: 4, py: 2, borderRadius: 3, fontWeight: 700, boxShadow: '0 8px 16px rgba(0,93,168,0.2)' }}
            >
                Buscar
            </Button>
        </Box>
    );
}
