import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    useTheme,
    alpha,
    Tabs,
    Tab,
    Alert,
    Snackbar,
    MenuItem,
    CircularProgress,
    Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import { maestroApi } from '@entities/maestro/api/maestro.api';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { createColaboradorSchema } from '../../model/schema';
import type { CreateColaboradorSchema } from '../../model/schema';
import { useEffect, useState } from 'react';
import type { Colaborador } from '@entities/colaborador/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import { LicenciaList } from '../../licencias/ui/LicenciaList';
import { ColaboradorDocumentoList } from '../../documentos/ui/ColaboradorDocumentoList';

interface CreateEditColaboradorModalProps {
    open: boolean;
    onClose: () => void;
    colaboradorToEdit?: Colaborador | null;
    onSuccess: (id: number) => void;
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
            id={`colab-tabpanel-${index}`}
            aria-labelledby={`colab-tab-${index}`}
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

export function CreateEditColaboradorModal({ open, onClose, colaboradorToEdit, onSuccess, viewOnly = false }: CreateEditColaboradorModalProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0);
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const isEdit = !!colaboradorToEdit;
    const effectiveId = colaboradorToEdit?.colaboradorID || createdId;
    const canEditDetails = !!effectiveId;

    // Queries for Selects
    const { data: roles } = useQuery({
        queryKey: ['roles-colaborador'],
        queryFn: () => rolColaboradorApi.getSelect(undefined, 100),
        enabled: open
    });

    const { data: generos } = useQuery({
        queryKey: ['tipos-genero'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_SEXO),
        enabled: open
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect(undefined, 100),
        enabled: open
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        setError,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<CreateColaboradorSchema>({
        resolver: zodResolver(createColaboradorSchema),
        defaultValues: {
            activo: true
        }
    });

    useEffect(() => {
        if (open) {
            setActiveTab(0);
            setCreatedId(null);
            setErrorMessage(null);
            if (colaboradorToEdit) {
                reset({
                    rolColaboradorID: colaboradorToEdit.rolColaboradorID,
                    tipoGeneroID: colaboradorToEdit.tipoGeneroID,
                    nombres: colaboradorToEdit.nombres,
                    primerApellido: colaboradorToEdit.primerApellido,
                    segundoApellido: colaboradorToEdit.segundoApellido || '',
                    direccion: colaboradorToEdit.direccion || '',
                    telefono: colaboradorToEdit.telefono || '',
                    email: colaboradorToEdit.email || '',
                    fechaNacimiento: colaboradorToEdit.fechaNacimiento || '',
                    fechaIngreso: colaboradorToEdit.fechaIngreso || '',
                    monedaID: colaboradorToEdit.monedaID,
                    salario: colaboradorToEdit.salario,
                    activo: colaboradorToEdit.activo
                });
            } else {
                reset({
                    rolColaboradorID: 0,
                    tipoGeneroID: 0,
                    nombres: '',
                    primerApellido: '',
                    segundoApellido: '',
                    direccion: '',
                    telefono: '',
                    email: '',
                    fechaNacimiento: '',
                    fechaIngreso: new Date().toISOString().split('T')[0],
                    monedaID: 0,
                    salario: 0,
                    activo: true
                });
            }
        }
    }, [open, colaboradorToEdit, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateColaboradorSchema) => {
            if (isEdit && colaboradorToEdit) {
                return colaboradorApi.update(colaboradorToEdit.colaboradorID, data).then(() => colaboradorToEdit.colaboradorID);
            }
            if (createdId) {
                return colaboradorApi.update(createdId, data).then(() => createdId);
            }
            return colaboradorApi.create(data);
        },
        onSuccess: (id:number) => {
            queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
            onSuccess(id);
            
            if (!isEdit && !createdId) {
                setCreatedId(id);
                // Move to next tab or just enable them
                // setActiveTab(1); 
            } else {
                onClose();
            }
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<CreateColaboradorSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
                setOpenSnackbar(true);
            }
        }
    });

    const onSubmit = (data: CreateColaboradorSchema) => {
        mutation.mutate(data);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <>
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
                        {viewOnly ? 'Detalle del Colaborador' : (isEdit || createdId ? 'Gestión de Colaborador' : 'Nuevo Colaborador')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Gestión de información personal, licencias y documentos
                    </Typography>
                </Box>
                
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Datos Personales" />
                    <Tab label="Licencias" disabled={!canEditDetails} />
                    <Tab label="Documentos" disabled={!canEditDetails} />
                    <Tab label="Pagos" disabled={!canEditDetails} />
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
                    <form id="colab-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ px: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                        Información Básica
                                    </Typography>
                                </Grid>
                                
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Nombres"
                                        fullWidth
                                        {...register('nombres')}
                                        error={!!errors.nombres}
                                        helperText={errors.nombres?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Primer Apellido"
                                        fullWidth
                                        {...register('primerApellido')}
                                        error={!!errors.primerApellido}
                                        helperText={errors.primerApellido?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Segundo Apellido"
                                        fullWidth
                                        {...register('segundoApellido')}
                                        error={!!errors.segundoApellido}
                                        helperText={errors.segundoApellido?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="tipoGeneroID"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                label="Género"
                                                fullWidth
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                value={field.value || 0}
                                                error={!!errors.tipoGeneroID}
                                                helperText={errors.tipoGeneroID?.message}
                                                disabled={viewOnly}
                                            >
                                                <MenuItem value={0} disabled>Seleccione</MenuItem>
                                                {generos?.data?.map((g) => (
                                                    <MenuItem key={g.id} value={g.id}>{g.text}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Fecha Nacimiento"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        {...register('fechaNacimiento')}
                                        error={!!errors.fechaNacimiento}
                                        helperText={errors.fechaNacimiento?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>

                                <Grid size={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 1 }}>
                                        Contacto y Dirección
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Teléfono"
                                        fullWidth
                                        {...register('telefono')}
                                        error={!!errors.telefono}
                                        helperText={errors.telefono?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Email"
                                        fullWidth
                                        {...register('email')}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Dirección"
                                        fullWidth
                                        {...register('direccion')}
                                        error={!!errors.direccion}
                                        helperText={errors.direccion?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>

                                <Grid size={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 1 }}>
                                        Datos Laborales
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="rolColaboradorID"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                label="Rol / Cargo"
                                                fullWidth
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                value={field.value || 0}
                                                error={!!errors.rolColaboradorID}
                                                helperText={errors.rolColaboradorID?.message}
                                                disabled={viewOnly}
                                            >
                                                <MenuItem value={0} disabled>Seleccione</MenuItem>
                                                {roles?.data?.map((r) => (
                                                    <MenuItem key={r.id} value={r.id}>{r.text}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Fecha Ingreso"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        {...register('fechaIngreso')}
                                        error={!!errors.fechaIngreso}
                                        helperText={errors.fechaIngreso?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="monedaID"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                label="Moneda Pago"
                                                fullWidth
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                value={field.value || 0}
                                                error={!!errors.monedaID}
                                                helperText={errors.monedaID?.message}
                                                disabled={viewOnly}
                                            >
                                                <MenuItem value={0} disabled>Seleccione</MenuItem>
                                                {monedas?.data?.map((r) => (
                                                    <MenuItem key={r.id} value={r.id}>{r.text}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />

                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Salario Base"
                                        type="number"
                                        fullWidth
                                        {...register('salario', { valueAsNumber: true })}
                                        disabled={viewOnly}
                                    />
                                </Grid>

                                {isEdit && (
                                    <Grid size={{ xs: 12 }} display="flex" alignItems="center">
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
                                                            disabled={viewOnly}
                                                        />
                                                    }
                                                    label="Colaborador Activo"
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </form>
                </CustomTabPanel>

                <CustomTabPanel value={activeTab} index={1}>
                    <Box sx={{ px: 3 }}>
                        {effectiveId ? (
                            <LicenciaList colaboradorId={effectiveId} viewOnly={viewOnly} />
                        ) : (
                            <Box p={3} textAlign="center" color="text.secondary">
                                Guarde el colaborador para agregar licencias
                            </Box>
                        )}
                    </Box>
                </CustomTabPanel>
                
                <CustomTabPanel value={activeTab} index={2}>
                    <Box sx={{ px: 3 }}>
                        {effectiveId ? (
                            <ColaboradorDocumentoList colaboradorId={effectiveId} viewOnly={viewOnly} />
                        ) : (
                            <Box p={3} textAlign="center" color="text.secondary">
                                Guarde el colaborador para agregar documentos
                            </Box>
                        )}
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={activeTab} index={3}>
                    <Box p={3} textAlign="center" color="text.secondary">
                        Funcionalidad de Pagos en construcción...
                    </Box>
                </CustomTabPanel>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} color="inherit">
                    {activeTab === 0 ? (viewOnly ? 'Cerrar' : 'Cancelar') : 'Cerrar'}
                </Button>
                {activeTab === 0 && !viewOnly && (
                    <Button 
                        type="submit" 
                        form="colab-form"
                        variant="contained" 
                        disabled={isSubmitting || mutation.isPending || (isEdit && !isDirty)}
                        startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEdit || createdId ? 'Guardar Cambios' : 'Registrar'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
        <Snackbar 
            open={openSnackbar} 
            autoHideDuration={6000} 
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
            </Alert>
        </Snackbar>
        </>
    );
}
