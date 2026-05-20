import { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Grid, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ubigeoApi } from '@/shared/api/ubigeo.api';
import type { SelectItem } from '@/shared/model/types';
import { useDebounce } from '@/shared/hooks/useDebounce';

// Helper to format "DEPARTAMENTO, PROVINCIA, DISTRITO" to "Distrito, Provincia (Departamento)"
// Title Case saves horizontal space compared to ALL CAPS
const formatUbigeoName = (rawText: string) => {
    if (!rawText) return '';
    const parts = rawText.split(',').map(p => p.trim());
    if (parts.length === 3) {
        const toTitleCase = (str: string) => str.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase());
        return `${toTitleCase(parts[2])}, ${toTitleCase(parts[1])} (${toTitleCase(parts[0])})`;
    }
    return rawText;
};

interface Props {
    label: string;
    value?: number;
    onChange: (ubigeoId: number) => void;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
    direction?: 'row' | 'column';
}

export function UbigeoSelect({ label, value, onChange, error, helperText, disabled, direction = 'row' }: Props) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<SelectItem[]>([]);
    
    // Custom debounce hook for search input
    const debouncedSearchTerm = useDebounce(inputValue, 500);

    // Load selected value details if present and not in options
    useEffect(() => {
        if (value && value > 0) {
            const selectedOption = options.find(o => o.id === value);
            if (!selectedOption) {
                ubigeoApi.getById(value).then(res => {
                    if (res.data) {
                        const newOption: SelectItem = {
                            id: res.data.ubigeoID,
                            text: formatUbigeoName(`${res.data.departamento}, ${res.data.provincia}, ${res.data.distrito}`)
                        };
                        setOptions(prev => [...prev, newOption]);
                    }
                }).catch(console.error);
            }
        }
    }, [value, options]);

    // Query to search ubigeos
    const { isFetching } = useQuery({
        queryKey: ['ubigeo-search', debouncedSearchTerm],
        queryFn: async () => {
            if (debouncedSearchTerm.length < 3) return [];
            // Send search term in uppercase to match typical LATAM DB structures
            const response = await ubigeoApi.getSelect(debouncedSearchTerm.toUpperCase());
            const newOptions = (response.data || []).map(opt => ({
                ...opt,
                text: formatUbigeoName(opt.text)
            }));
            setOptions(newOptions);
            return newOptions;
        },
        enabled: open && debouncedSearchTerm.length >= 3,
    });

    const selectedValue = options.find(o => o.id === value) || null;
    const gridSize = direction === 'column' ? { xs: 12 } : { xs: 12 };

    return (
        <Grid container spacing={1}>
            <Grid size={gridSize}>
                <Tooltip title={selectedValue?.text || ''} placement="top" arrow disableHoverListener={!selectedValue || open}>
                    <Autocomplete
                        id={`ubigeo-select-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        sx={{ width: '100%' }}
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        isOptionEqualToValue={(option, val) => option.id === val.id}
                        getOptionLabel={(option) => option.text}
                        options={options}
                        loading={isFetching}
                        value={selectedValue}
                        disabled={disabled}
                        onChange={(_, newValue) => {
                            onChange(newValue ? (newValue.id as number) : 0);
                        }}
                        inputValue={inputValue}
                        onInputChange={(_, newInputValue) => {
                            setInputValue(newInputValue);
                        }}
                        noOptionsText={debouncedSearchTerm.length < 3 ? "Escriba al menos 3 letras..." : "No se encontraron resultados"}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label || "Buscar Distrito, Provincia o Dep."}
                                size="small"
                                error={error}
                                helperText={helperText}
                                placeholder="Ej. La Punta, Callao..."
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isFetching ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' },
                                    '& .MuiInputBase-input': { 
                                        textOverflow: 'ellipsis', 
                                        overflow: 'hidden', 
                                        whiteSpace: 'nowrap' 
                                    }
                                }}
                            />
                        )}
                    />
                </Tooltip>
            </Grid>
        </Grid>
    );
}
