import { Box, Typography, Checkbox, FormControlLabel, CircularProgress, Alert, Paper, alpha, useTheme, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { permisoApi } from '@/entities/permiso/api/permiso.api';
import { useEffect, useMemo } from 'react';

interface PermisosMatrixProps {
    rolId?: number;
    selectedIds: number[];
    onChange: (newIds: number[]) => void;
    disabled?: boolean;
}

export function PermisosMatrix({ rolId, selectedIds, onChange, disabled }: PermisosMatrixProps) {
    const theme = useTheme();
    
    const { data: groupedPermisos, isLoading, error } = useQuery({
        queryKey: ['permisos-grouped', rolId],
        queryFn: () => rolId ? permisoApi.getGroupedByRol(rolId) : permisoApi.getGrouped(),
        staleTime: 0 // Fetch always to ensure accurate checks
    });

    const assignedIdsFromRole = useMemo(() => {
        if (!groupedPermisos || !rolId) {
            return null;
        }

        return groupedPermisos
            .flatMap(g => g.permisos)
            .filter(p => p.asignado)
            .map(p => p.permisoID)
            .sort((a, b) => a - b);
    }, [groupedPermisos, rolId]);

    const normalizedSelectedIds = useMemo(
        () => [...selectedIds].sort((a, b) => a - b),
        [selectedIds]
    );

    useEffect(() => {
        if (!assignedIdsFromRole) {
            return;
        }

        const hasDifferences =
            assignedIdsFromRole.length !== normalizedSelectedIds.length ||
            assignedIdsFromRole.some((id, index) => id !== normalizedSelectedIds[index]);

        if (hasDifferences) {
            onChange([...assignedIdsFromRole]);
        }
    }, [assignedIdsFromRole, normalizedSelectedIds, onChange]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">Error al cargar los permisos</Alert>;
    }

    const handleToggle = (permisoId: number) => {
        if (disabled) return;
        
        const isSelected = selectedIds.includes(permisoId);
        if (isSelected) {
            onChange(selectedIds.filter(id => id !== permisoId));
        } else {
            onChange([...selectedIds, permisoId]);
        }
    };

    const handleToggleModule = (modulo: string, isAllSelected: boolean) => {
        if (disabled) return;

        const modulePermisos = groupedPermisos?.find(g => g.modulo === modulo)?.permisos || [];
        const moduleIds = modulePermisos.map(p => p.permisoID);

        if (isAllSelected) {
            // Remove all from this module
            onChange(selectedIds.filter(id => !moduleIds.includes(id)));
        } else {
            // Add all from this module
            const newIds = new Set([...selectedIds, ...moduleIds]);
            onChange(Array.from(newIds));
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Configuración de Accesos
            </Typography>
            
            <Grid container spacing={3}>
                {groupedPermisos?.map((group) => {
                    const moduleIds = group.permisos.map(p => p.permisoID);
                    const isAllSelected = moduleIds.every(id => selectedIds.includes(id));
                    const isIndeterminate = !isAllSelected && moduleIds.some(id => selectedIds.includes(id));

                    return (
                        <Grid sx={{xs: 12, md: 6}} key={group.modulo}>
                            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{ 
                                    bgcolor: alpha(theme.palette.primary.main, 0.05), 
                                    px: 2, 
                                    py: 1,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                                onChange={() => handleToggleModule(group.modulo, isAllSelected)}
                                                disabled={disabled}
                                                size="small"
                                            />
                                        }
                                        label={<Typography fontWeight="bold">{group.modulo}</Typography>}
                                        sx={{ m: 0 }}
                                    />
                                </Box>
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {group.permisos.map((permiso) => (
                                        <FormControlLabel
                                            key={permiso.permisoID}
                                            control={
                                                <Checkbox
                                                    checked={selectedIds.includes(permiso.permisoID)}
                                                    onChange={() => handleToggle(permiso.permisoID)}
                                                    disabled={disabled}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2">{permiso.nombre}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {permiso.codigo}
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ m: 0, alignItems: 'flex-start' }}
                                        />
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
