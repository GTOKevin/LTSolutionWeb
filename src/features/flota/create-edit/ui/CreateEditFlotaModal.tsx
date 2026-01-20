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
import type { Flota } from '@entities/flota/model/types';
import { FlotaDocumentosList } from '../../documentos/ui/FlotaDocumentosList';
import { TIPOS_COMBUSTIBLE } from '@/shared/constants/constantes';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { useFlotaForm } from '../../hooks/useFlotaForm';

interface CreateEditFlotaModalProps {
    open: boolean;
    onClose: () => void;
    flotaToEdit?: Flota | null;
    onSuccess: (flotaId: number) => void;
    viewOnly?: boolean;
}

export function CreateEditFlotaModal({ open, onClose, flotaToEdit, onSuccess, viewOnly = false }: CreateEditFlotaModalProps) {
    const theme = useTheme();

    const {
        form: {
            register,
            handleSubmit,
            formState: { errors, isDirty }
        },
        mutation,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveFlotaId,
        canEditDocs,
        isEdit,
        createdFlotaId,
        listaFlota,
        listaPeso,
        listaMedida
    } = useFlotaForm({
        flotaToEdit,
        onSuccess,
        onClose,
        open
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
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
                <TabPanel value={activeTab} index={0} name="flota">
                    <form id="flota-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ px: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                        Identificación
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        label="Placa"
                                        fullWidth
                                        {...register('placa')}
                                        error={!!errors.placa}
                                        helperText={errors.placa?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
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
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Marca"
                                        fullWidth
                                        {...register('marca')}
                                        error={!!errors.marca}
                                        helperText={errors.marca?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Modelo"
                                        fullWidth
                                        {...register('modelo')}
                                        error={!!errors.modelo}
                                        helperText={errors.modelo?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 2 }}>
                                        Especificaciones Técnicas
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
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
                                <Grid size={{ xs: 12, md: 4 }}>
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
                </TabPanel>
                
                <TabPanel value={activeTab} index={1} name="flota">
                    {effectiveFlotaId && (
                        <Box sx={{ px: 3, height: 500 }}>
                            <FlotaDocumentosList flotaId={effectiveFlotaId} viewOnly={viewOnly} />
                        </Box>
                    )}
                </TabPanel>
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
