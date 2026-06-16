import { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField, Box, CircularProgress, Paper } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

export function LocationSearch({ onSelectLocation }: { onSelectLocation: (lat: number, lng: number, name: string) => void }) {
    const map = useMap();
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current);
            L.DomEvent.disableScrollPropagation(containerRef.current);
        }
    }, []);

    useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions(options.length > 0 ? [] : options);
            return undefined;
        }

        const fetchPlaces = async () => {
            setLoading(true);
            try {
                // Rate limit 1 request per second as per OSM policy
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5&countrycodes=pe`);
                const data = await response.json();
                if (active) {
                    setOptions(data);
                }
            } catch (err) {
                console.error('Nominatim search error', err);
            } finally {
                if (active) setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPlaces, 600); // debounce 600ms
        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [inputValue]);

    return (
        <Box 
            ref={containerRef}
            sx={{ 
                position: 'absolute', 
                top: 16, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '80%', 
                maxWidth: 400,
                zIndex: 1000 
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <Paper elevation={4} sx={{ borderRadius: 2 }}>
                <Autocomplete
                    id="location-search"
                    sx={{ width: '100%' }}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    isOptionEqualToValue={(option, value) => option.place_id === value.place_id}
                    getOptionLabel={(option) => option.display_name}
                    options={options}
                    loading={loading}
                    filterOptions={(x) => x} // Disable built-in filtering, we use server-side
                    onInputChange={(_event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    onChange={(_event, newValue) => {
                        if (newValue && typeof newValue !== 'string') {
                            const lat = parseFloat(newValue.lat);
                            const lng = parseFloat(newValue.lon);
                            map.flyTo([lat, lng], 15);
                            onSelectLocation(lat, lng, newValue.display_name.split(',')[0]);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Buscar lugar (Ej: Grifo Primax, Lima...)"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                sx: { bgcolor: 'white', borderRadius: 2 },
                                startAdornment: <LocationOnIcon color="action" sx={{ ml: 1, mr: -1 }} />,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </Paper>
        </Box>
    );
}
