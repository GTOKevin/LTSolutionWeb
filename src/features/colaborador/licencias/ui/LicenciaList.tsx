import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Button,
    useTheme,
    alpha,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { licenciaApi } from '@entities/licencia/api/licencia.api';
import type { Licencia } from '@entities/licencia/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { useState } from 'react';
import { LicenciaForm } from './LicenciaForm';

interface LicenciaListProps {
    colaboradorId: number;
    viewOnly?: boolean;
}

export function LicenciaList({ colaboradorId, viewOnly = false }: LicenciaListProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [openForm, setOpenForm] = useState(false);
    const [licenciaToEdit, setLicenciaToEdit] = useState<Licencia | null>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [licenciaToDelete, setLicenciaToDelete] = useState<Licencia | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['licencias', colaboradorId],
        queryFn: () => licenciaApi.getAll({ colaboradorID: colaboradorId, size: 100 })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => licenciaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licencias', colaboradorId] });
            setOpenDelete(false);
            setLicenciaToDelete(null);
        }
    });

    const handleCreate = () => {
        setLicenciaToEdit(null);
        setOpenForm(true);
    };

    const handleEdit = (licencia: Licencia) => {
        setLicenciaToEdit(licencia);
        setOpenForm(true);
    };

    const handleDelete = (licencia: Licencia) => {
        setLicenciaToDelete(licencia);
        setOpenDelete(true);
    };

    if (isLoading) {
        return <Box p={3} textAlign="center">Cargando ausencias/licencias...</Box>;
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Registro de Ausencias y Licencias
                </Typography>
                {!viewOnly && (
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        size="small"
                        onClick={handleCreate}
                    >
                        Registrar Ausencia
                    </Button>
                )}
            </Box>

            {/* Desktop Table */}
            <Paper sx={{ 
                display: { xs: 'none', md: 'block' },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Desde</TableCell>
                                <TableCell>Hasta</TableCell>
                                <TableCell>Detalle</TableCell>
                                {!viewOnly && <TableCell align="right">Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.data?.items.map((licencia) => (
                                <TableRow key={licencia.licenciaID} hover>
                                    <TableCell>{licencia.tipoLicencia?.nombre || '-'}</TableCell>
                                    <TableCell>{new Date(licencia.fechaInicial).toLocaleDateString()}</TableCell>
                                    <TableCell>{licencia.fechaFinal ? new Date(licencia.fechaFinal).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>
                                        {licencia.descripcion || '-'}
                                    </TableCell>
                                    {!viewOnly && (
                                        <TableCell align="right">
                                            <IconButton size="small" color="primary" onClick={() => handleEdit(licencia)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(licencia)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {data?.data?.items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No hay ausencias o licencias registradas
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Mobile List */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                {data?.data?.items.map((licencia) => (
                    <Card key={licencia.licenciaID} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {licencia.tipoLicencia?.nombre || 'Ausencia'}
                                </Typography>
                            </Box>
                            
                            <Stack spacing={1} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        {new Date(licencia.fechaInicial).toLocaleDateString()} 
                                        {licencia.fechaFinal ? ` - ${new Date(licencia.fechaFinal).toLocaleDateString()}` : ''}
                                    </Typography>
                                </Box>
                                {licencia.descripcion && (
                                    <Typography variant="body2" color="text.secondary">
                                        {licencia.descripcion}
                                    </Typography>
                                )}
                            </Stack>

                            {!viewOnly && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: `1px solid ${theme.palette.divider}`, pt: 1, mt: 1 }}>
                                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(licencia)}>
                                        Editar
                                    </Button>
                                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(licencia)}>
                                        Eliminar
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))}
                 {data?.data?.items.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', bgcolor: 'background.paper', borderRadius: 2 }}>
                        No hay registros
                    </Box>
                )}
            </Box>

            <LicenciaForm 
                open={openForm}
                onClose={() => setOpenForm(false)}
                colaboradorId={colaboradorId}
                licenciaToEdit={licenciaToEdit}
            />

            <ConfirmDialog
                open={openDelete}
                title="Eliminar Registro"
                content={`¿Está seguro que desea eliminar este registro?`}
                onClose={() => setOpenDelete(false)}
                onConfirm={() => licenciaToDelete && deleteMutation.mutate(licenciaToDelete.licenciaID)}
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
