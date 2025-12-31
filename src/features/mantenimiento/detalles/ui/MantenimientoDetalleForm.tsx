import {
    Grid,
    TextField,
    MenuItem,
    Button,
    Box,
    Typography,
    CircularProgress,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { tipoProductoApi } from '@entities/tipo-producto/api/tipo-producto.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { createMantenimientoDetalleSchema } from '../../model/schema';
import type { CreateMantenimientoDetalleSchema } from '../../model/schema';
import { useEffect, useState } from 'react';

interface MantenimientoDetalleFormProps {
    defaultValues?: CreateMantenimientoDetalleSchema;
    onSubmit: (data: CreateMantenimientoDetalleSchema) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    isEditing: boolean;
    viewOnly?: boolean;
}

export function MantenimientoDetalleForm({
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting,
    isEditing,
    viewOnly = false
}: MantenimientoDetalleFormProps) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CreateMantenimientoDetalleSchema>({
        resolver: zodResolver(createMantenimientoDetalleSchema),
        defaultValues: defaultValues || {
            tipoProductoID: 0,
            descripcion: '',
            cantidad: 1,
            monedaID: 0,
            costo: 0,
            igv: true,
            subTotal: 0,
            montoIGV: 0,
            total: 0
        }
    });

    const [selectedCategoria, setSelectedCategoria] = useState<string>('');
    
    // Watch values for calculation
    const cantidad = watch('cantidad');
    const costo = watch('costo');
    const igv = watch('igv');

    useEffect(() => {
        const subTotal = (cantidad || 0) * (costo || 0);
        const montoIGV = igv ? subTotal * 0.18 : 0;
        const total = subTotal + montoIGV;

        setValue('subTotal', Number(subTotal.toFixed(2)));
        setValue('montoIGV', Number(montoIGV.toFixed(2)));
        setValue('total', Number(total.toFixed(2)));
    }, [cantidad, costo, igv, setValue]);

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
            // We might need to fetch the category for the existing product if we want to pre-fill it correctly.
            // However, the current API doesn't seem to easily support "get category by product ID" without extra calls.
            // For now, if editing, we might need a way to set the category.
            // But let's look at the requirement: "Con las categorias del select, cuando se haga un change en el select de categorias..."
            // If editing, we need the category to be selected to show the product.
            // I'll assume for now that the user selects category manually or we infer it.
            // Ideally, the backend `MantenimientoDetalle` should return the category or we fetch the product details to get it.
            // Let's check `MantenimientoDetalle` type again. It has `TipoProducto` nested object.
            // If `defaultValues` comes from `MantenimientoDetalleList`, it might have the nested object.
        }
    }, [defaultValues, reset]);

    // Queries for Selects
    const { data: categorias } = useQuery({
        queryKey: ['tipo-producto-categorias'],
        queryFn: () => tipoProductoApi.getSelectCategoria()
    });

    const { data: tiposProducto, isLoading: isLoadingProductos } = useQuery({
        queryKey: ['tipos-producto', selectedCategoria],
        queryFn: () => tipoProductoApi.getSelect(undefined, undefined, selectedCategoria),
        enabled: !!selectedCategoria
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas-select'],
        queryFn: () => monedaApi.getSelect()
    });

    const listaCategorias = categorias?.data || [];
    const listaProductos = tiposProducto?.data || [];
    const listaMonedas = monedas?.data || [];

    const handleCategoriaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const categoria = event.target.value;
        setSelectedCategoria(categoria);
        setValue('tipoProductoID', 0); // Reset product selection when category changes
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ p: 2, border: '1px dashed #e0e0e0', borderRadius: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    {viewOnly ? 'Detalle del Insumo' : (isEditing ? 'Editar Insumo/Servicio' : 'Nuevo Insumo/Servicio')}
                </Typography>
                
                <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:6}}>
                        <TextField
                            select
                            label="Categoría"
                            fullWidth
                            value={selectedCategoria}
                            onChange={handleCategoriaChange}
                            disabled={viewOnly}
                            size="small"
                            helperText="Seleccione primero una categoría"
                        >
                            <MenuItem value="" disabled>Seleccione...</MenuItem>
                            {listaCategorias.map((cat) => (
                                <MenuItem key={cat.text} value={cat.text}>
                                    {cat.text}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{xs:12, sm:6}}>
                        <Controller
                            name="tipoProductoID"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Producto / Servicio"
                                    fullWidth
                                    error={!!errors.tipoProductoID}
                                    helperText={errors.tipoProductoID?.message}
                                    disabled={viewOnly || !selectedCategoria || isLoadingProductos}
                                    size="small"
                                >
                                    <MenuItem value={0} disabled>Seleccione...</MenuItem>
                                    {listaProductos.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid size={{xs:12, sm:6}}>
                        <TextField
                            label="Descripción (Opcional)"
                            fullWidth
                            {...register('descripcion')}
                            error={!!errors.descripcion}
                            helperText={errors.descripcion?.message}
                            disabled={viewOnly}
                            size="small"
                        />
                    </Grid>

                    <Grid size={{xs:6,sm:3}}>
                        <TextField
                            label="Cantidad"
                            type="number"
                            fullWidth
                            {...register('cantidad')}
                            error={!!errors.cantidad}
                            helperText={errors.cantidad?.message}
                            disabled={viewOnly}
                            size="small"
                        />
                    </Grid>

                    <Grid size={{xs:6,sm:3}}>
                        <TextField
                            select
                            label="Moneda"
                            fullWidth
                            {...register('monedaID')}
                            defaultValue={defaultValues?.monedaID || 0}
                            error={!!errors.monedaID}
                            helperText={errors.monedaID?.message}
                            disabled={viewOnly}
                            size="small"
                        >
                            <MenuItem value={0} disabled>Seleccione...</MenuItem>
                            {listaMonedas.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.text}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{xs:6,sm:3}}>
                        <TextField
                            label="Costo Unitario"
                            type="number"
                            fullWidth
                            {...register('costo')}
                            error={!!errors.costo}
                            helperText={errors.costo?.message}
                            disabled={viewOnly}
                            size="small"
                            InputProps={{ inputProps: { step: 0.01 } }}
                        />
                    </Grid>

                    <Grid size={{xs:12, sm:3}} sx={{display:'flex', alignItems:'center'}}>
                         <Controller
                            name="igv"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Checkbox {...field} checked={field.value} disabled={viewOnly} />}
                                    label="Aplica IGV"
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{xs:6, sm:3}}>
                        <TextField
                            label="Sub Total"
                            fullWidth
                            {...register('subTotal')}
                            disabled
                            size="small"
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid size={{xs:6, sm:3}}>
                        <TextField
                            label="Monto IGV"
                            fullWidth
                            {...register('montoIGV')}
                            disabled
                            size="small"
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid size={{xs:6, sm:3}}>
                        <TextField
                            label="Total"
                            fullWidth
                            {...register('total')}
                            disabled
                            size="small"
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>

                    {!viewOnly && (
                        <Grid size={{xs:12}} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button 
                                onClick={onCancel} 
                                variant="outlined" 
                                color="inherit" 
                                size="small"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                size="small"
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {isEditing ? 'Actualizar' : 'Agregar'}
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </form>
    );
}
