import {
    Box,
    Button,
    Typography,
    TableCell,
    useTheme,
    useMediaQuery,
    Tooltip,
    Card,
    CardContent,
    Divider,
    Grid,
    alpha,
    Paper,
    Collapse,
    IconButton
} from '@mui/material';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { useMemo } from 'react';
import {
    Add as AddIcon,
    MonetizationOn as MonetizationOnIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { Mantenimiento, MantenimientoDetalle } from '@entities/mantenimiento/model/types';
import type { CreateMantenimientoDetalleSchema } from '../../model/schema';
import { useState, useRef } from 'react';
import { MantenimientoDetalleForm } from './MantenimientoDetalleForm';
import { TableActions } from '@shared/components/ui/TableActions';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { useCreateMantenimientoDetalle, useUpdateMantenimientoDetalle, useDeleteMantenimientoDetalle } from '../../hooks/useMantenimientoDetalleCrud';


interface MantenimientoDetalleListProps {
    mantenimientoId: number;
    viewOnly?: boolean;
    mantenimientoInfo?: Mantenimiento | null;
}

export function MantenimientoDetalleList({ mantenimientoId, viewOnly = false, mantenimientoInfo }: MantenimientoDetalleListProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isFormExpanded, setIsFormExpanded] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<CreateMantenimientoDetalleSchema | undefined>(undefined);
    const [editingCategoria, setEditingCategoria] = useState<string>('');

    const isCompleted = mantenimientoInfo?.estado?.nombre?.toUpperCase() === 'FINALIZADO' || mantenimientoInfo?.estado?.nombre?.toUpperCase() === 'COMPLETADO';
    const isClosed = mantenimientoInfo?.cerrado;
    const showActions = !viewOnly && !(isCompleted && isClosed);

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

    const createMutation = useCreateMantenimientoDetalle();
    const updateMutation = useUpdateMantenimientoDetalle();
    const deleteMutation = useDeleteMantenimientoDetalle();


    const handleEdit = (item: MantenimientoDetalle) => {
        setEditingId(item.mantenimientoDetalleID);
        setEditingCategoria(item.tipoProducto?.categoria || '');
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
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingItem(undefined);
        setEditingCategoria('');
        setIsFormExpanded(false);
    };

    const handleCreate = () => {
        setEditingId(null);
        setEditingItem(undefined);
        setEditingCategoria('');
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSubmit = (data: CreateMantenimientoDetalleSchema) => {
        if (editingId) {
            updateMutation.mutate(
                { id: editingId, data },
                { onSuccess: handleCancel }
            );
        } else {
            createMutation.mutate(
                { mantenimientoId, data },
                { onSuccess: handleCancel }
            );
        }
    };

    const columns: Column[] = useMemo(() => {
        const cols: Column[] = [
            { id: 'producto', label: 'Producto/Servicio' },
            { id: 'descripcion', label: 'Descripción', width: 200 },
            { id: 'cantidad', label: 'Cant.', align: 'right' },
            { id: 'costo', label: 'Costo Unit.', align: 'right' },
            { id: 'subtotal', label: 'SubTotal', align: 'right' },
            { id: 'igv', label: 'IGV', align: 'right' },
            { id: 'total', label: 'Total', align: 'right' },
        ];
        if (showActions) {
            cols.push({ id: 'acciones', label: 'Acciones', align: 'right' });
        }
        return cols;
    }, [showActions]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            {showActions && (
                <Paper
                    ref={formRef}
                    elevation={0}
                    sx={{
                        p: 0,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: alpha(editingId ? theme.palette.warning.main : theme.palette.primary.main, 0.02),
                        overflow: 'hidden',
                        mb: 2
                    }}
                >
                    <Box
                        onClick={() => {
                            if (isFormExpanded && editingId) {
                                handleCancel();
                            } else if (!isFormExpanded && !editingId) {
                                handleCreate();
                            } else {
                                setIsFormExpanded((prev) => !prev);
                            }
                        }}
                        sx={{
                            px: 3,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: isFormExpanded ? `1px solid ${theme.palette.divider}` : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                                bgcolor: editingId ? theme.palette.warning.main : theme.palette.primary.main, 
                                color: 'white', 
                                p: 0.5, 
                                borderRadius: '50%', 
                                display: 'flex' 
                            }}>
                                {editingId ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                {editingId ? 'Editar Insumo/Servicio' : 'Agregar Insumo/Servicio'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {editingId && (
                                <Button 
                                    size="small" 
                                    color="inherit" 
                                    startIcon={<CancelIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel();
                                    }}
                                >
                                    Cancelar Edición
                                </Button>
                            )}
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsFormExpanded((prev) => !prev);
                                }}
                            >
                                {isFormExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    </Box>
                    <Collapse in={isFormExpanded} unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            <MantenimientoDetalleForm
                                defaultValues={editingItem}
                                initialCategoria={editingCategoria}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isSubmitting={createMutation.isPending || updateMutation.isPending}
                                isEditing={!!editingId}
                                viewOnly={viewOnly}
                            />
                        </Box>
                    </Collapse>
                </Paper>
            )}

            {/* Header & Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Insumos y Servicios Utilizados
                </Typography>
            </Box>

            <>
                    {/* Desktop Table View */}
                    {!isMobile && (
                        <SharedTable<MantenimientoDetalle>
                            data={data}
                            isLoading={isLoading}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={(_, p) => setPage(p)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            columns={columns}
                            keyExtractor={(item) => item.mantenimientoDetalleID}
                            emptyMessage="No hay insumos registrados"
                            containerSx={{ width: '100%', minHeight: 400 }}
                            renderRow={(item) => (
                                <>
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
                                </>
                            )}
                        />
                    )}

                    {/* Mobile Card View */}
                    {isMobile && (
                        <Box sx={{ width: '100%' }}>
                             {isLoading ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>Cargando...</Box>
                             ) : (
                                <MobileListShell
                                    items={data?.items || []}
                                    total={data?.total || 0}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    onPageChange={(_, p) => setPage(p)}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPage(parseInt(e.target.value, 10));
                                        setPage(0);
                                    }}
                                    emptyMessage="No hay insumos"
                                    keyExtractor={(item) => item.mantenimientoDetalleID}
                                    viewOnly={!showActions}
                                    onEdit={handleEdit}
                                    onDelete={(item) => deleteMutation.mutate(item.mantenimientoDetalleID)}
                                    renderHeader={(item) => (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, width: '100%' }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {(item as any).tipoProducto?.nombre || `Item #${item.mantenimientoDetalleID}`}
                                            </Typography>
                                            <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ ml: 2 }}>
                                                {item.moneda?.simbolo} {item.total.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    )}
                                    renderBody={(item) => (
                                        <>
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
                                        </>
                                    )}
                                />
                             )}
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
        </Box>
    );
}
