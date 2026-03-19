import {
    Button,
    TextField,
    Grid,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    useTheme,
    alpha,
    Chip,
    TableCell
} from '@mui/material';
import {
    Add as AddIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { createContactoSchema, type CreateContactoSchema } from '../../model/schema';
import { useState } from 'react';
import type { ClienteContacto } from '@entities/cliente/model/types';
import { useCreateClienteContacto, useUpdateClienteContacto, useDeleteClienteContacto } from '../../hooks/useClienteContactosCrud';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { SharedTable } from '@shared/components/ui/SharedTable';
import { TableActions } from '@shared/components/ui/TableActions';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';

interface ClienteContactosListProps {
    clienteId: number;
    viewOnly?: boolean;
}

export function ClienteContactosList({ clienteId, viewOnly = false }: ClienteContactosListProps) {
    const theme = useTheme();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDelete, setOpenDelete] = useState(false);
    const [contactoToDelete, setContactoToDelete] = useState<ClienteContacto | null>(null);

    const { data: data, isLoading } = useQuery({
        queryKey: ['cliente-contactos', clienteId, page, rowsPerPage],
        queryFn: () => clienteApi.getContactos(clienteId, undefined, undefined, page + 1, rowsPerPage),
        enabled: !!clienteId
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isSubmitting, isDirty }
    } = useForm({
        resolver: zodResolver(createContactoSchema),
        defaultValues: {
            activo: true
        }
    });

    const createMutation = useCreateClienteContacto();
    const updateMutation = useUpdateClienteContacto();
    const deleteMutation = useDeleteClienteContacto();

    const resetForm = () => {
        reset({
            nombreCompleto: '',
            email: '',
            telefonoPrincipal: '',
            telefonoSecundario: '',
            rol: '',
            activo: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (contacto: ClienteContacto) => {
        setEditingId(contacto.clienteContactoID);
        setValue('nombreCompleto', contacto.nombreCompleto);
        setValue('email', contacto.email || '');
        setValue('telefonoPrincipal', contacto.telefonoPrincipal);
        setValue('telefonoSecundario', contacto.telefonoSecundario || '');
        setValue('rol', contacto.rol || '');
        setValue('activo', contacto.activo);
        setShowForm(true);
    };

    const onSubmit = (data: CreateContactoSchema) => {
        if (editingId) {
            
            console.log('clienteId:', editingId);
            updateMutation.mutate(
                { id: editingId, data },
                { onSuccess: resetForm }
            );
        } else {
            console.log('clienteId:', clienteId);
            createMutation.mutate(
                { clienteId, data },
                { onSuccess: resetForm }
            );
        }
    };

    const handleDeleteConfirm = () => {
        if (contactoToDelete) {
            deleteMutation.mutate(contactoToDelete.clienteContactoID, {
                onSuccess: () => {
                    setOpenDelete(false);
                    setContactoToDelete(null);
                }
            });
        }
    };

    const handleDeleteRequest = (contacto: ClienteContacto) => {
        setContactoToDelete(contacto);
        setOpenDelete(true);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Lista de Contactos
                </Typography>
                {!showForm && !viewOnly && (
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        size="small"
                        onClick={() => setShowForm(true)}
                    >
                        Agregar
                    </Button>
                )}
            </Box>
            
            {showForm ? (
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                        {editingId ? 'Editar Contacto' : 'Nuevo Contacto'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Nombre Completo"
                                fullWidth
                                size="small"
                                {...register('nombreCompleto')}
                                error={!!errors.nombreCompleto}
                                helperText={errors.nombreCompleto?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Rol / Cargo"
                                fullWidth
                                size="small"
                                {...register('rol')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Teléfono Principal"
                                fullWidth
                                size="small"
                                {...register('telefonoPrincipal')}
                                error={!!errors.telefonoPrincipal}
                                helperText={errors.telefonoPrincipal?.message}
                            />
                        </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Teléfono Secundario"
                                fullWidth
                                size="small"
                                {...register('telefonoSecundario')}
                                error={!!errors.telefonoSecundario}
                                helperText={errors.telefonoSecundario?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12}}>
                            <TextField
                                label="Email"
                                fullWidth
                                size="small"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        {editingId && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="activo"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                color="success"
                                            />
                                        }
                                        label="Contacto Activo"
                                    />
                                )}
                            />
                        </Grid>)}
                        <Grid size={{ xs: 12}} display="flex" justifyContent="flex-end" gap={1}>
                            <Button onClick={resetForm} color="inherit">
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained"
                                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending || (!!editingId && !isDirty)}
                            >
                                Guardar
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                <Box sx={{ flex: 1, overflow: 'auto', p: 0.5 }}>
                    <MobileListShell
                        items={data?.data.items || []}
                        total={data?.data.total || 0}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        emptyMessage="No hay contactos registrados."
                        keyExtractor={(item) => item.clienteContactoID}
                        viewOnly={viewOnly}
                        onEdit={handleEdit}
                        onDelete={handleDeleteRequest}
                        renderHeader={(contacto) => (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {contacto.nombreCompleto}
                                </Typography>
                                {contacto.rol && (
                                    <Chip label={contacto.rol} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                                )}
                                {!contacto.activo && (
                                    <Chip label="Inactivo" size="small" color="error" sx={{ height: 20, fontSize: 10 }} />
                                )}
                            </Box>
                        )}
                        renderBody={(contacto) => (
                            <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
                                <Typography variant="body2" color="text.secondary">
                                    <PersonIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                    {contacto.telefonoPrincipal} • {contacto.email || 'Sin email'}
                                </Typography>
                            </Box>
                        )}
                    />
                    
                    <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 2 }}>
                        <SharedTable<ClienteContacto>
                            columns={[
                                { id: 'nombreCompleto', label: 'Nombre Completo' },
                                { id: 'rol', label: 'Rol / Cargo' },
                                { id: 'telefonoPrincipal', label: 'Teléfono' },
                                { id: 'email', label: 'Email' },
                                { id: 'activo', label: 'Estado', align: 'center' },
                                ...(!viewOnly ? [{ id: 'acciones', label: 'Acciones', align: 'right' as const }] : [])
                            ]}
                            data={data?.data}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={(_, p) => setPage(p)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            isLoading={isLoading}
                            keyExtractor={(item) => item.clienteContactoID}
                            renderRow={(item) => (
                                <>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>{item.nombreCompleto}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{item.rol || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{item.telefonoPrincipal}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{item.email || '-'}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={item.activo ? "Activo" : "Inactivo"} 
                                            size="small" 
                                            color={item.activo ? "success" : "error"} 
                                            sx={{ height: 24 }} 
                                        />
                                    </TableCell>
                                    {!viewOnly && (
                                        <TableCell align="right">
                                            <TableActions 
                                                onEdit={() => handleEdit(item)}
                                                onDelete={() => handleDeleteRequest(item)}
                                            />
                                        </TableCell>
                                    )}
                                </>
                            )}
                        />
                    </Box>
                </Box>
            )}

            <ConfirmDialog
                open={openDelete}
                title="Eliminar Contacto"
                content={`¿Está seguro que desea eliminar a ${contactoToDelete?.nombreCompleto}?`}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
