import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem,
    Box,
    Typography,
    Tabs,
    Tab,
    useTheme,
    alpha
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createFacturaSchema, type CreateFacturaSchema } from '../../model/schema';
import type { Factura } from '@/entities/factura/model/types';
import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { monedaApi } from '@/shared/api/moneda.api';
import { estadoApi } from '@/shared/api/estado.api';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { FacturaDetalles } from '../../detalles/ui/Index';
import { FacturaPagos } from '../../pagos/ui/Index';
import { ESTADO_SECCIONES } from '@/shared/constants/constantes';

interface CreateEditFacturaModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateFacturaSchema) => Promise<void>;
    factura?: Factura;
    isLoading?: boolean;
}

export function CreateEditFacturaModal({
    open,
    onClose,
    onSubmit,
    factura,
    isLoading
}: CreateEditFacturaModalProps) {
    const isEdit = !!factura;
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateFacturaSchema>({
        resolver: zodResolver(createFacturaSchema),
        defaultValues: {
            clienteID: 1,
            serie: '',
            numero: '',
            fechaEmision: new Date().toISOString().split('T')[0],
            fechaVencimiento: new Date().toISOString().split('T')[0],
            fechaCompromisoPago: '',
            diasCredito: null,
            monedaID: 1 ,
            estadoID: 1   
        }
    });

    useEffect(() => {
        if (open) {
            if (factura) {
                reset({
                    clienteID: factura.clienteID,
                    serie: factura.serie,
                    numero: factura.numero,
                    fechaEmision: factura.fechaEmision.split('T')[0],
                    fechaVencimiento: factura.fechaVencimiento.split('T')[0],
                    fechaCompromisoPago: factura.fechaCompromisoPago ? factura.fechaCompromisoPago.split('T')[0] : '',
                    diasCredito: factura.diasCredito || null,
                    monedaID: factura.monedaID,
                    estadoID: factura.estadoID
                });
            } else {
                setActiveTab(0);
                reset({
                    clienteID: 1,
                    serie: '',
                    numero: '',
                    fechaEmision: new Date().toISOString().split('T')[0],
                    fechaVencimiento: new Date().toISOString().split('T')[0],
                    fechaCompromisoPago: '',
                    diasCredito: null,
                    monedaID: 1 ,
                    estadoID: 1   
                });
            }
        } else {
            setActiveTab(0);
        }
    }, [open, factura, reset]);

    const { data: clientes } = useQuery({
        queryKey: ['clientes', 'select'],
        queryFn: () => clienteApi.getSelect("",50)
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas', 'select'],
        queryFn: () => monedaApi.getSelect("",50)
    });

    const { data: estados } = useQuery({
        queryKey: ['estados', 'factura'],
        queryFn: () => estadoApi.getSelect('',10,ESTADO_SECCIONES.FACTURA)
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFormSubmit = async (data: CreateFacturaSchema) => {
        await onSubmit(data);
        if (!isEdit) {
            setActiveTab(1);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={(e, reason) => {
                if (reason === 'backdropClick') return;
                onClose();
            }} 
            maxWidth="lg" 
            fullWidth
        >
            <DialogTitle component="div" sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                pb: 0
            }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {isEdit ? `Factura ${factura?.serie}-${factura?.numero}` : 'Nueva Factura'}
                    </Typography>
                </Box>
                <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab label="Datos Generales" />
                    <Tab label="Detalles" disabled={!isEdit} />
                    <Tab label="Pagos" disabled={!isEdit} />
                </Tabs>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, minHeight: '400px' }}>
                <TabPanel value={activeTab} index={0} name="factura-info">
                    <form id="factura-form" onSubmit={handleSubmit(handleFormSubmit)}>
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={2}>
                                <Grid size={{xs:12,sm:6}}>
                                    <Controller
                                        name="clienteID"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Cliente"
                                                error={!!errors.clienteID}
                                                helperText={errors.clienteID?.message}
                                            >
                                                <MenuItem value={0} disabled>Seleccione un cliente</MenuItem>
                                                {clientes?.data?.map((cliente) => (
                                                    <MenuItem key={cliente.id} value={cliente.id}>
                                                        {cliente.text }
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>
                                
                                <Grid size={{xs:12,sm:3}}>
                                    <Controller
                                        name="serie"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Serie"
                                                placeholder="F001"
                                                error={!!errors.serie}
                                                helperText={errors.serie?.message}
                                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{xs:12,sm:3}}>
                                    <Controller
                                        name="numero"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Número"
                                                placeholder="00000001"
                                                error={!!errors.numero}
                                                helperText={errors.numero?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{xs:12,sm:6}}>
                                    <Controller
                                        name="fechaEmision"
                                        control={control}
                                        render={({ field }) => (
                                            <FormDatePicker
                                                label="Fecha de Emisión"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={!!errors.fechaEmision}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{xs:12,sm:6}}>
                                    <Controller
                                        name="fechaVencimiento"
                                        control={control}
                                        render={({ field }) => (
                                            <FormDatePicker
                                                label="Fecha de Vencimiento"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={!!errors.fechaVencimiento}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{xs:12,sm:6}}>
                                    <Controller
                                        name="fechaCompromisoPago"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormDatePicker
                                                label="Fecha Compromiso Pago"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={!!error}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{xs:12,sm:6}}>
                                    <Controller
                                        name="diasCredito"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                fullWidth
                                                label="Días de Crédito"
                                                error={!!error}
                                                helperText={error?.message}
                                                inputProps={{ min: 0 }}
                                                onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{xs:12,sm:6}}>
                                    <Controller
                                        name="monedaID"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Moneda"
                                                error={!!errors.monedaID}
                                                helperText={errors.monedaID?.message}
                                                disabled={isEdit} 
                                            >
                                                <MenuItem value={0} disabled>Seleccione moneda</MenuItem>
                                                {monedas?.data?.map((moneda) => (
                                                    <MenuItem key={moneda.id} value={moneda.id}>
                                                        {moneda.text}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>

                                <Grid size={{xs:12,sm:6}}>
                                    <Controller
                                        name="estadoID"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Estado"
                                                error={!!errors.estadoID}
                                                helperText={errors.estadoID?.message}
                                            >
                                                {estados?.data?.map((estado) => (
                                                    <MenuItem key={estado.id} value={estado.id}>
                                                        {estado.text}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </form>
                </TabPanel>

                {isEdit && factura && (
                    <>
                        <TabPanel value={activeTab} index={1} name="factura-detalles">
                            <Box sx={{ p: 0 }}>
                                <FacturaDetalles factura={factura} />
                            </Box>
                        </TabPanel>
                        
                        <TabPanel value={activeTab} index={2} name="factura-pagos">
                            <Box sx={{ p: 0 }}>
                                <FacturaPagos factura={factura} />
                            </Box>
                        </TabPanel>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    {activeTab === 0 ? 'Cancelar' : 'Cerrar'}
                </Button>
                {activeTab === 0 && (
                    <Button type="submit" form="factura-form" variant="contained" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
