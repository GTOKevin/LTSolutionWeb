import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery,
    Tooltip,
    Stack,
    Card,
    CardContent,
    Divider,
    Grid,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Delete,
    EditNotifications,
    MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { Mantenimiento, MantenimientoDetalle } from '@entities/mantenimiento/model/types';
import type { CreateMantenimientoDetalleSchema } from '../../model/schema';
import { useState } from 'react';
import { MantenimientoDetalleForm } from './MantenimientoDetalleForm';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { TableActions } from '@shared/components/ui/TableActions';


interface MantenimientoDetalleListProps {
    mantenimientoId: number;
    viewOnly?: boolean;
    mantenimientoInfo?: Mantenimiento | null;
}

export function MantenimientoDetalleList({ mantenimientoId, viewOnly = false, mantenimientoInfo }: MantenimientoDetalleListProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<CreateMantenimientoDetalleSchema | undefined>(undefined);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const isCompleted = mantenimientoInfo?.estado?.nombre?.toUpperCase() === 'FINALIZADO' || mantenimientoInfo?.estado?.nombre?.toUpperCase() === 'COMPLETADO';
    const showActions = !viewOnly && !isCompleted;
    const colSpan = showActions ? 8 : 7;

    // Query for all details (uses updated backend response which includes totals)
    const { data, isLoading } = useQuery({
        queryKey: ['mantenimiento-detalles', mantenimientoId, page, rowsPerPage],
        queryFn: () => mantenimientoApi.getDetalles({
            mantenimientoID: mantenimientoId,
            page: page + 1,
            size: rowsPerPage
        }),
        enabled: !!mantenimientoId
    });

    // Use totals from backend response
    const totalsByCurrency = data?.totalsByCurrency || {};

    const createMutation = useMutation({
        mutationFn: (data: CreateMantenimientoDetalleSchema) => 
            mantenimientoApi.addDetalle(mantenimientoId, {
                ...data,
                descripcion: data.descripcion ?? undefined
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mantenimiento-detalles', mantenimientoId] });
            handleCancel();
            setSnackbar({ open: true, message: 'Insumo agregado correctamente', severity: 'success' });
        },
        onError: () => {
            setSnackbar({ open: true, message: 'Error al agregar insumo', severity: 'error' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateMantenimientoDetalleSchema) => 
            editingId ? mantenimientoApi.updateDetalle(editingId, {
                ...data,
                descripcion: data.descripcion ?? undefined
            }) : Promise.reject('No ID'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mantenimiento-detalles', mantenimientoId] });
            handleCancel();
            setSnackbar({ open: true, message: 'Insumo actualizado correctamente', severity: 'success' });
        },
        onError: () => {
            setSnackbar({ open: true, message: 'Error al actualizar insumo', severity: 'error' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => mantenimientoApi.removeDetalle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mantenimiento-detalles', mantenimientoId] });
            setSnackbar({ open: true, message: 'Insumo eliminado correctamente', severity: 'success' });
        },
        onError: () => {
            setSnackbar({ open: true, message: 'Error al eliminar insumo', severity: 'error' });
        }
    });

    const handleCreate = () => {
        setEditingId(null);
        setEditingItem(undefined);
        setShowForm(true);
    };

    const handleEdit = (item: MantenimientoDetalle) => {
        setEditingId(item.mantenimientoDetalleID);
        setEditingItem({
            tipoProductoID: item.tipoProductoID,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            monedaID: item.monedaID,
            costo: item.costo,
            igv: item.igv,
            subTotal: item.subTotal,
            montoIGV: item.montoIGV,
            total: item.total
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setEditingItem(undefined);
    };

    const handleSubmit = (data: CreateMantenimientoDetalleSchema) => {
        if (editingId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%',minHeight: 650 }}>
            {/* Header & Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Insumos y Servicios Utilizados
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>

                    {showActions && !showForm && (
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            size="small"
                            onClick={handleCreate}
                        >
                            Agregar
                        </Button>
                    )}
                </Box>
            </Box>

            {showForm ? (
                <MantenimientoDetalleForm
                    defaultValues={editingItem}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                    isEditing={!!editingId}
                    viewOnly={viewOnly}
                />
            ) : (
                <>
                    {/* Desktop Table View */}
                    {!isMobile && (
                        <Paper sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 3,
                            boxShadow: theme.shadows[1]
                        }}>
                            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Producto/Servicio</TableCell>
                                            <TableCell width={200}>Descripción</TableCell>
                                            <TableCell align="right">Cant.</TableCell>
                                            <TableCell align="right">Costo Unit.</TableCell>
                                            <TableCell align="right">SubTotal</TableCell>
                                            <TableCell align="right">IGV</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                            {showActions && <TableCell align="right">Acciones</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={colSpan} align="center">Cargando...</TableCell>
                                            </TableRow>
                                        ) : data?.items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={colSpan} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                    No hay insumos registrados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data?.items.map((item) => (
                                                <TableRow 
                                                    key={item.mantenimientoDetalleID} 
                                                    hover
                                                    sx={{ 
                                                        '&:hover .actions-group': { opacity: 1 },
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <TableCell>
                                                        {(item as any).tipoProducto?.nombre || `ID: ${item.tipoProductoID}`}
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 200 }}>
                                                        <Tooltip title={item.descripcion || ''}>
                                                            <Typography variant="body2" noWrap sx={{ display: 'block' }}>
                                                                {item.descripcion || '-'}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="right">{item.cantidad}</TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        {item.moneda?.simbolo} {item.costo.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        {item.moneda?.simbolo} {item.subTotal.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        {item.moneda?.simbolo} {item.montoIGV.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        {item.moneda?.simbolo} {item.total.toFixed(2)}
                                                    </TableCell>
                                                    {showActions && (
                                                        <TableCell align="right">
                                                            <TableActions 
                                                                onEdit={() => handleEdit(item)}
                                                                onDelete={() => deleteMutation.mutate(item.mantenimientoDetalleID)}
                                                            />
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={data?.total || 0}
                                page={page}
                                onPageChange={(_, p) => setPage(p)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                            />
                        </Paper>
                    )}

                    {/* Mobile Card View */}
                    {isMobile && (
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                             {isLoading ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>Cargando...</Box>
                             ) : data?.items.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No hay insumos</Box>
                             ) : (
                                <Stack spacing={2}>
                                    {data?.items.map((item) => (
                                        <Card 
                                            key={item.mantenimientoDetalleID} 
                                            elevation={0}
                                            sx={{ 
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 3,
                                                position: 'relative'
                                            }}
                                        >
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {(item as any).tipoProducto?.nombre || `Item #${item.mantenimientoDetalleID}`}
                                                    </Typography>
                                                    <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                                        {item.moneda?.simbolo} {item.total.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                {item.descripcion && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                                                        {item.descripcion}
                                                    </Typography>
                                                )}
                                                <Divider sx={{ my: 1 }} />
                                                <Grid container spacing={1}>
                                                    <Grid size={{xs:6}}>
                                                        <Typography variant="caption" display="block" color="text.secondary">Cantidad</Typography>
                                                        <Typography variant="body2">{item.cantidad}</Typography>
                                                    </Grid>
                                                    <Grid size={{xs:6}}>
                                                        <Typography variant="caption" display="block" color="text.secondary">Unitario</Typography>
                                                        <Typography variant="body2">{item.moneda?.simbolo} {item.costo.toFixed(2)}</Typography>
                                                    </Grid>
                                                    <Grid size={{xs:6}}>
                                                        <Typography variant="caption" display="block" color="text.secondary">SubTotal</Typography>
                                                        <Typography variant="body2">{item.moneda?.simbolo} {item.subTotal.toFixed(2)}</Typography>
                                                    </Grid>
                                                    <Grid size={{xs:6}}>
                                                        <Typography variant="caption" display="block" color="text.secondary">IGV</Typography>
                                                        <Typography variant="body2">{item.moneda?.simbolo} {item.montoIGV.toFixed(2)}</Typography>
                                                    </Grid>
                                                </Grid>
                                                {!viewOnly && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                                        <Button size="small" variant="outlined" onClick={() => handleEdit(item)} startIcon={<EditNotifications />}>
                                                            Editar
                                                        </Button>
                                                        <Button size="small" variant="outlined" color="error" onClick={() => deleteMutation.mutate(item.mantenimientoDetalleID)} startIcon={<Delete />}>
                                                            Eliminar
                                                        </Button>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                             )}
                             <TablePagination
                                component="div"
                                count={data?.total || 0}
                                page={page}
                                onPageChange={(_, p) => setPage(p)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                            />
                        </Box>
                    )}

                    {/* Totals Section */}
                    {Object.keys(totalsByCurrency).length > 0 && (
                        <Box sx={{ mt: 2, mb:3  }}>
                            <Card variant="elevation" elevation={0} sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                borderRadius: 3
                            }}>
                                <CardContent sx={{ p: 2}}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <MonetizationOnIcon color="primary" />
                                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                            Resumen Económico
                                        </Typography>
                                    </Box>
                                    
                                    <Grid container spacing={2}>
                                        {Object.entries(totalsByCurrency).map(([symbol, total]) => (
                                            <Grid key={symbol} size={{ xs: 12, sm: 'auto' }}>
                                                <Paper elevation={0} sx={{ 
                                                    p: 2, 
                                                    minWidth: 180,
                                                    bgcolor: 'background.paper',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 2
                                                }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                                                            TOTAL {symbol === 'S/' ? 'SOLES' : 'DÓLARES'}
                                                        </Typography>
                                                        <Typography variant="h5" fontWeight="800" color="text.primary">
                                                            {symbol} {total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ 
                                                        p: 1, 
                                                        borderRadius: '50%', 
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main
                                                    }}>
                                                        {symbol === 'S/' ? <Typography fontWeight="bold">S/</Typography> : <Typography fontWeight="bold">$</Typography>}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
