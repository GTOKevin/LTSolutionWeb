import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Typography,
    Box,
    useTheme,
    alpha,
    Tabs,
    Tab,
    Alert,
    Button,
    CircularProgress,
    MenuItem
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { maestroApi } from '@shared/api/maestro.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import { createFlotaSchema } from '../../model/schema';
import type { CreateFlotaSchema } from '../../model/schema';
import { useEffect, useState } from 'react';
import type { Flota } from '@entities/flota/model/types';
import { FlotaDocumentosList } from '../../documentos/ui/FlotaDocumentosList';
import { handleBackendErrors } from '@shared/utils/form-validation';
import {TIPO_MAESTRO,TIPOS_COMBUSTIBLE} from '@/shared/constants/constantes';
interface CreateEditFlotaModalProps {
    open: boolean;
    onClose: () => void;
    flotaToEdit?: Flota | null;
    onSuccess: (flotaId: number) => void;
    viewOnly?: boolean;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`flota-tabpanel-${index}`}
            aria-labelledby={`flota-tab-${index}`}
            {...other}
            style={{ height: '100%' }}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function CreateEditFlotaModal({ open, onClose, flotaToEdit, onSuccess, viewOnly = false }: CreateEditFlotaModalProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0);
    const [createdFlotaId, setCreatedFlotaId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const isEdit = !!flotaToEdit;
    const effectiveFlotaId = flotaToEdit?.flotaID || createdFlotaId;
    const canEditDocs = !!effectiveFlotaId;

    const { data: tiposFlota } = useQuery({
        queryKey: ['tipos-flota'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_FLOTA),
        enabled: open
    });

    const { data: tiposPeso } = useQuery({
        queryKey: ['tipos-peso'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_PESO),
        enabled: open
    });

    const { data: tiposMedida } = useQuery({
        queryKey: ['tipos-medida'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_MEDIDA),
        enabled: open
    });

    // Derived state - Clean Code pattern
    const listaFlota = tiposFlota?.data || [];
    const listaPeso = tiposPeso?.data || [];
    const listaMedida = tiposMedida?.data || [];


    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isDirty }
    } = useForm<CreateFlotaSchema>({
        resolver: zodResolver(createFlotaSchema),
        defaultValues: {
            activo: true
        }
    });

    useEffect(() => {
        if (open) {
            setActiveTab(0);
            setCreatedFlotaId(null);
            setErrorMessage(null);
            if (flotaToEdit) {
                reset({
                    tipoFlota: flotaToEdit.tipoFlota,
                    marca: flotaToEdit.marca || '',
                    modelo: flotaToEdit.modelo || '',
                    placa: flotaToEdit.placa,
                    anio: flotaToEdit.anio,
                    color: flotaToEdit.color || '',
                    ejes: flotaToEdit.ejes,
                    tipoPesoID: flotaToEdit.tipoPesoID,
                    pesoBruto: flotaToEdit.pesoBruto,
                    pesoNeto: flotaToEdit.pesoNeto,
                    cargaUtil: flotaToEdit.cargaUtil,
                    tipoMedidaID: flotaToEdit.tipoMedidaID,
                    largo: flotaToEdit.largo,
                    alto: flotaToEdit.alto,
                    ancho: flotaToEdit.ancho,
                    tipoCombustible: flotaToEdit.tipoCombustible,
                    activo: flotaToEdit.estado
                });
            } else {
                reset({
                    tipoFlota: 0,
                    marca: '',
                    modelo: '',
                    placa: '',
                    anio: new Date().getFullYear(),
                    color: '',
                    ejes: 0,
                    tipoPesoID: 0,
                    pesoBruto: 0,
                    pesoNeto: 0,
                    cargaUtil: 0,
                    tipoMedidaID: 0,
                    largo: 0,
                    alto: 0,
                    ancho: 0,
                    tipoCombustible: '',
                    activo: true,
                });
            }
        }
    }, [open, flotaToEdit, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateFlotaSchema) => {
            if (isEdit && flotaToEdit) {
                return flotaApi.update(flotaToEdit.flotaID, data).then(() => flotaToEdit.flotaID);
            }
            if (createdFlotaId) {
                return flotaApi.update(createdFlotaId, data).then(() => createdFlotaId);
            }
            return flotaApi.create(data);
        },
        onSuccess: (id:number) => {
            queryClient.invalidateQueries({ queryKey: ['flotas'] });
            onSuccess(id);
            
            if (!isEdit && !createdFlotaId) {
                setCreatedFlotaId(id);
                setActiveTab(1); 
            } else {
                onClose();
            }
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<CreateFlotaSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
            }
        }
    });

    const onSubmit = (data: CreateFlotaSchema) => {
        mutation.mutate(data);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, minHeight: '80vh' }
            }}
        >
            <DialogTitle component="div" sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                pb: 0
            }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {viewOnly ? 'Detalle del Vehículo' : (isEdit || createdFlotaId ? 'Gestión de Vehículo' : 'Nuevo Vehículo')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {viewOnly ? 'Información del vehículo' : 'Administre la información técnica y documentos del vehículo'}
                    </Typography>
                </Box>
                
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Datos Técnicos" />
                    <Tab label="Documentos" disabled={!canEditDocs} />
                </Tabs>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
                {activeTab === 0 && errorMessage && (
                     <Box sx={{ p: 3, pb: 0 }}>
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                     </Box>
                )}
                <CustomTabPanel value={activeTab} index={0}>
                    <form id="flota-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ px: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                        Identificación
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12,md:4 }}>
                                    <TextField
                                        label="Placa"
                                        fullWidth
                                        {...register('placa')}
                                        error={!!errors.placa}
                                        helperText={errors.placa?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12,md:4 }}>
                                    <TextField
                                        select
                                        label="Tipo Unidad"
                                        fullWidth
                                        {...register('tipoFlota')}
                                        value={activeTab === 0 ? (register('tipoFlota').name ? undefined : 0) : 0} 
                                        defaultValue={isEdit && flotaToEdit ? flotaToEdit.tipoFlota : 0}
                                        error={!!errors.tipoFlota}
                                        helperText={errors.tipoFlota?.message}
                                        disabled={viewOnly}
                                    >
                                        <MenuItem value={0} disabled>Seleccione un tipo</MenuItem>
                                        {listaFlota.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>
                                                {tipo.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Color"
                                        fullWidth
                                        {...register('color')}
                                        error={!!errors.color}
                                        helperText={errors.color?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Ejes"
                                        type="number"
                                        fullWidth
                                        {...register('ejes')}
                                        error={!!errors.ejes}
                                        helperText={errors.ejes?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Año"
                                        type="number"
                                        fullWidth
                                        {...register('anio')}
                                        error={!!errors.anio}
                                        helperText={errors.anio?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12,md:6 }}>
                                    <TextField
                                        label="Marca"
                                        fullWidth
                                        {...register('marca')}
                                        error={!!errors.marca}
                                        helperText={errors.marca?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12,md:6 }}>
                                    <TextField
                                        label="Modelo"
                                        fullWidth
                                        {...register('modelo')}
                                        error={!!errors.modelo}
                                        helperText={errors.modelo?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12}}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 2 }}>
                                        Especificaciones Técnicas
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12,md:4 }}>
                                    <TextField
                                        select
                                        label="Tipo Peso"
                                        fullWidth
                                        {...register('tipoPesoID')}
                                        defaultValue={isEdit && flotaToEdit ? flotaToEdit.tipoPesoID : 0}
                                        error={!!errors.tipoPesoID}
                                        helperText={errors.tipoPesoID?.message}
                                        disabled={viewOnly}
                                    >
                                        <MenuItem value={0} disabled>Seleccione un tipo</MenuItem>
                                        {listaPeso.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>
                                                {tipo.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Peso Bruto"
                                        type="number"
                                        fullWidth
                                        {...register('pesoBruto')}
                                        error={!!errors.pesoBruto}
                                        helperText={errors.pesoBruto?.message}
                                        disabled={viewOnly}
                                        slotProps={{ htmlInput: { step: "0.01" } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Peso Neto"
                                        type="number"
                                        fullWidth
                                        {...register('pesoNeto')}
                                        error={!!errors.pesoNeto}
                                        helperText={errors.pesoNeto?.message}
                                        disabled={viewOnly}
                                        slotProps={{ htmlInput: { step: "0.01" } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Carga Útil"
                                        type="number"
                                        fullWidth
                                        {...register('cargaUtil')}
                                        error={!!errors.cargaUtil}
                                        helperText={errors.cargaUtil?.message}
                                        disabled={viewOnly}
                                        slotProps={{ htmlInput: { step: "0.01" } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12,md:4 }}>
                                    <TextField
                                        select
                                        label="Tipo Medida"
                                        fullWidth
                                        {...register('tipoMedidaID')}
                                        defaultValue={isEdit && flotaToEdit ? flotaToEdit.tipoMedidaID : 0}
                                        error={!!errors.tipoMedidaID}
                                        helperText={errors.tipoMedidaID?.message}
                                        disabled={viewOnly}
                                    >
                                        <MenuItem value={0} disabled>Seleccione un tipo</MenuItem>
                                        {listaMedida.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>
                                                {tipo.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Alto (m)"
                                        type="number"
                                        fullWidth
                                        {...register('alto')}
                                        error={!!errors.alto}
                                        helperText={errors.alto?.message}
                                        disabled={viewOnly}
                                        slotProps={{ htmlInput: { step: "0.01" } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Ancho (m)"
                                        type="number"
                                        fullWidth
                                        {...register('ancho')}
                                        error={!!errors.ancho}
                                        helperText={errors.ancho?.message}
                                        disabled={viewOnly}
                                        slotProps={{ htmlInput: { step: "0.01" } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Largo (m)"
                                        type="number"
                                        fullWidth
                                        {...register('largo')}
                                        error={!!errors.largo}
                                        helperText={errors.largo?.message}
                                        disabled={viewOnly}
                                        slotProps={{ htmlInput: { step: "0.01" } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        select
                                        label="Combustible"
                                        fullWidth
                                        {...register('tipoCombustible')}
                                        defaultValue={isEdit && flotaToEdit ? flotaToEdit.tipoCombustible : ''}
                                        error={!!errors.tipoCombustible}
                                        helperText={errors.tipoCombustible?.message}
                                        disabled={viewOnly}
                                    >
                                        {TIPOS_COMBUSTIBLE.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>
                    </form>
                </CustomTabPanel>
                
                <CustomTabPanel value={activeTab} index={1}>
                    {effectiveFlotaId && (
                        <Box sx={{ px: 3, height: 500 }}>
                            <FlotaDocumentosList flotaId={effectiveFlotaId} viewOnly={viewOnly} />
                        </Box>
                    )}
                </CustomTabPanel>
            </DialogContent>

            <DialogActions sx={{ 
                p: 3, 
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                gap: 2
            }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    disabled={mutation.isPending}
                >
                    {viewOnly || activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                </Button>
                
                {!viewOnly && activeTab === 0 && (
                    <Button 
                        type="submit"
                        form="flota-form"
                        variant="contained" 
                        disabled={mutation.isPending || (isEdit && !isDirty)}
                        startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEdit || createdFlotaId ? 'Guardar Cambios' : 'Crear Vehículo'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
