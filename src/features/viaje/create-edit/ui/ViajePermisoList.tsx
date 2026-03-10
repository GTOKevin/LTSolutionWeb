import { 
    Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Typography, Paper, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField 
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import type { CreateViajePermisoDto } from '@/entities/viaje/model/types';

interface Props {
    viewOnly?: boolean;
}

export function ViajePermisoList({ viewOnly }: Props) {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "viajePermisos"
    });

    const [open, setOpen] = useState(false);
    const [newItem, setNewItem] = useState<CreateViajePermisoDto>({
        fechaVigencia: new Date().toISOString().split('T')[0],
        fechaVencimiento: new Date().toISOString().split('T')[0],
        rutaArchivo: ''
    });

    const handleAdd = () => {
        append(newItem);
        setOpen(false);
        setNewItem({
            fechaVigencia: new Date().toISOString().split('T')[0],
            fechaVencimiento: new Date().toISOString().split('T')[0],
            rutaArchivo: ''
        });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">Permisos Especiales</Typography>
                {!viewOnly && (
                    <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => setOpen(true)}>
                        Agregar Permiso
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha Vigencia</TableCell>
                            <TableCell>Fecha Vencimiento</TableCell>
                            <TableCell>Archivo</TableCell>
                            {!viewOnly && <TableCell align="right">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((item: any, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.fechaVigencia}</TableCell>
                                <TableCell>{item.fechaVencimiento}</TableCell>
                                <TableCell>{item.rutaArchivo || 'Sin archivo'}</TableCell>
                                {!viewOnly && (
                                    <TableCell align="right">
                                        <IconButton size="small" color="error" onClick={() => remove(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {fields.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography variant="body2" color="textSecondary">No hay permisos registrados</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Agregar Permiso</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Fecha Vigencia"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newItem.fechaVigencia}
                            onChange={e => setNewItem({...newItem, fechaVigencia: e.target.value})}
                        />
                        <TextField
                            label="Fecha Vencimiento"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newItem.fechaVencimiento}
                            onChange={e => setNewItem({...newItem, fechaVencimiento: e.target.value})}
                        />
                        <TextField
                            label="Ruta Archivo (URL o Referencia)"
                            fullWidth
                            value={newItem.rutaArchivo}
                            onChange={e => setNewItem({...newItem, rutaArchivo: e.target.value})}
                            helperText="Posteriormente se implementará la carga de archivos"
                        />
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
