import { useState, useEffect, useRef } from 'react';
import { Grid, TextField, MenuItem } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ubigeoApi } from '@/shared/api/ubigeo.api';
import type { SelectItem } from '@/shared/model/types';

interface Props {
    label: string;
    value?: number;
    onChange: (ubigeoId: number) => void;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
}

export function UbigeoSelect({ label, value, onChange, error, helperText, disabled }: Props) {
    // State for cascading selection
    const [selectedDep, setSelectedDep] = useState<string>('');
    const [selectedProv, setSelectedProv] = useState<string>('');
    const [selectedDist, setSelectedDist] = useState<string>('');
    
    // Ref to track internal changes to avoid resetting state on internal updates
    const isInternalChange = useRef(false);

    // Load Ancestors when initial value is provided
    useEffect(() => {
        // Skip if the change was triggered internally
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        if (value && value > 0) {
            // If we have a value, try to load ancestors to populate dropdowns
            ubigeoApi.getAncestors(value)
                .then(response => {
                    const { departamentoId, provinciaId, distritoId } = response.data;
                    setSelectedDep(departamentoId);
                    setSelectedProv(provinciaId);
                    setSelectedDist(distritoId);
                })
                .catch(err => {
                    console.error("Failed to load ubigeo ancestors", err);
                });
        } else {
             // Reset if value is cleared (optional, depends on UX preference)
             if (!value) {
                setSelectedDep('');
                setSelectedProv('');
                setSelectedDist('');
             }
        }
    }, [value]);

    // Load Departments
    const { data: departamentos = [] } = useQuery({
        queryKey: ['ubigeo-departamentos'],
        queryFn: async () => {
            const response = await ubigeoApi.getDepartamentos();
            return response.data ?? [];
        }
    });

    // Load Provinces when Dept changes
    const { data: provincias = [] } = useQuery({
        queryKey: ['ubigeo-provincias', selectedDep],
        queryFn: async () => {
            if (!selectedDep) return [];
            const response = await ubigeoApi.getProvincias(selectedDep);
            return response.data ?? [];
        },
        enabled: !!selectedDep
    });

    // Load Districts when Prov changes
    const { data: distritos = [] } = useQuery({
        queryKey: ['ubigeo-distritos', selectedProv],
        queryFn: async () => {
            if (!selectedProv) return [];
            const response = await ubigeoApi.getDistritos(selectedProv);
            return response.data ?? [];
        },
        enabled: !!selectedProv
    });

    const handleDeptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        isInternalChange.current = true;
        setSelectedDep(event.target.value);
        setSelectedProv('');
        setSelectedDist('');
        onChange(0); // Clear valid selection until district is chosen
    };

    const handleProvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        isInternalChange.current = true;
        setSelectedProv(event.target.value);
        setSelectedDist('');
        onChange(0);
    };

    const handleDistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        isInternalChange.current = true;
        const distId = event.target.value;
        setSelectedDist(distId);
        // The value of district IS the ubigeoID usually, or we map it. 
        // Assuming select value corresponds to Ubigeo ID directly here.
        onChange(Number(distId)); 
    };

    return (
        <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    select
                    label={`Dep. (${label})`}
                    fullWidth
                    size="small"
                    value={selectedDep}
                    onChange={handleDeptChange}
                    disabled={disabled}
                >
                    <MenuItem value="" disabled>Seleccione</MenuItem>
                    {departamentos.map((d: SelectItem) => (
                        <MenuItem key={d.id} value={d.id}>{d.text}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    select
                    label="Provincia"
                    fullWidth
                    size="small"
                    value={selectedProv}
                    onChange={handleProvChange}
                    disabled={disabled || !selectedDep}
                >
                    <MenuItem value="" disabled>Seleccione</MenuItem>
                    {provincias.map((p: SelectItem) => (
                        <MenuItem key={p.id} value={p.id}>{p.text}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    select
                    label="Distrito"
                    fullWidth
                    size="small"
                    value={selectedDist} 
                    onChange={handleDistChange}
                    disabled={disabled || !selectedProv}
                    error={error}
                    helperText={helperText}
                >
                    <MenuItem value="" disabled>Seleccione</MenuItem>
                    {distritos.map((d: SelectItem) => (
                        <MenuItem key={d.id} value={d.id}>{d.text}</MenuItem>
                    ))}
                </TextField>
            </Grid>
        </Grid>
    );
}
