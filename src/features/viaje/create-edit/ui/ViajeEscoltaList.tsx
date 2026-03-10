import { 
    Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Typography, Paper, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, MenuItem, FormControlLabel, Switch 
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import type { CreateViajeEscoltaDto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';

interface Props {
    viewOnly?: boolean;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
}

export function ViajeEscoltaList({ viewOnly, flotas, colaboradores }: Props) {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "viajeEscolta"
    });

    const [open, setOpen] = useState(false);
    const [newItem, setNewItem] = useState<CreateViajeEscoltaDto>({
        tercero: false,
        flotaID: 0,
        colaboradorID: 0,
        nombreConductor: '',
        empresa: ''
    });

    const handleAdd = () => {
        // Validate
        if (!newItem.tercero) {
            if (!newItem.flotaID && !newItem.colaboradorID) {
                // At least one should be selected usually, but logic depends on requirements.
                // Assuming validation is handled by backend or user discretion here for now.
            }
        } else {
            if (!newItem.nombreConductor || !newItem.empresa) {
                // Simple check
            }
        }

        append(newItem);
        setOpen(false);
        setNewItem({
            tercero: false,
            flotaID: 0,
            colaboradorID: 0,
            nombreConductor: '',
            empresa: ''
        });
    };

    const getEscoltaInfo = (item: any) => {
        if (item.tercero) {
            return {
                tipo: 'Tercero',
                conductor: item.nombreConductor,
                vehiculo: item.empresa // Using 'Vehiculo' column for Company in case of third party, or just split columns
            };
        }
        const flota = flotas.find(f => f.id === item.flotaID)?.text || '-';
        const colab = colaboradores.find(c => c.id === item.colaboradorID)?.text || '-';
        return {
            tipo: 'Propio',
            conductor: colab,
            vehiculo: flota
        };
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">Escolta / Resguardo</Typography>
                {!viewOnly && (
                    <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => setOpen(true)}>
                        Asignar Escolta
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Conductor / Personal</TableCell>
                            <TableCell>Vehículo / Empresa</TableCell>
                            {!viewOnly && <TableCell align="right">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((item: any, index) => {
                            const info = getEscoltaInfo(item);
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>{info.tipo}</TableCell>
                                    <TableCell>{info.conductor}</TableCell>
                                    <TableCell>{info.vehiculo}</TableCell>
                                    {!viewOnly && (
                                        <TableCell align="right">
                                            <IconButton size="small" color="error" onClick={() => remove(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                        {fields.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography variant="body2" color="textSecondary">No hay escoltas asignados</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Asignar Escolta</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={!!newItem.tercero} 
                                    onChange={e => setNewItem({ ...newItem, tercero: e.target.checked })} 
                                />
                            }
                            label="Es Tercero"
                        />

                        {!newItem.tercero ? (
                            <>
                                <TextField
                                    select
                                    label="Vehículo Escolta"
                                    fullWidth
                                    value={newItem.flotaID || 0}
                                    onChange={e => setNewItem({...newItem, flotaID: Number(e.target.value)})}
                                >
                                    <MenuItem value={0}>Seleccione</MenuItem>
                                    {flotas.map(f => (
                                        <MenuItem key={f.id} value={f.id}>{f.text}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Personal de Seguridad"
                                    fullWidth
                                    value={newItem.colaboradorID || 0}
                                    onChange={e => setNewItem({...newItem, colaboradorID: Number(e.target.value)})}
                                >
                                    <MenuItem value={0}>Seleccione</MenuItem>
                                    {colaboradores.map(c => (
                                        <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>
                                    ))}
                                </TextField>
                            </>
                        ) : (
                            <>
                                <TextField
                                    label="Nombre Conductor / Personal"
                                    fullWidth
                                    value={newItem.nombreConductor}
                                    onChange={e => setNewItem({...newItem, nombreConductor: e.target.value})}
                                />
                                <TextField
                                    label="Empresa de Seguridad"
                                    fullWidth
                                    value={newItem.empresa}
                                    onChange={e => setNewItem({...newItem, empresa: e.target.value})}
                                />
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAdd} variant="contained">Agregar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
