import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Grid,
    FormControlLabel,
    Switch,
    IconButton,
    Autocomplete,
    Alert,
    Box,
    Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import { useTipoMaestroForm } from '../../hooks/useTipoMaestroForm';

interface CreateEditTipoMaestroModalProps {
    open: boolean;
    onClose: () => void;
    maestroToEdit: TipoMaestro | null;
    onSuccess: (id?: number) => void;
    viewOnly?: boolean;
}

export function CreateEditTipoMaestroModal({
    open,
    onClose,
    maestroToEdit,
    onSuccess,
    viewOnly = false,
}: CreateEditTipoMaestroModalProps) {
    
    const {
        form,
        errorMessage,
        setErrorMessage,
        secciones,
        onSubmit,
        isEdit,
        isSubmitting,
        seccionResumen
    } = useTipoMaestroForm({ open, onClose, onSuccess, maestroToEdit });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = form;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle component="div" sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant="h6" fontWeight="bold">
                    {viewOnly ? 'Detalle de Maestro' : isEdit ? 'Editar Maestro' : 'Nuevo Maestro'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid size={{xs:12}}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                                Información General
                            </Typography>
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="tipoMaestroID"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value || ''}
                                        onChange={(event) => {
                                            const nextValue = event.target.value;
                                            field.onChange(nextValue === '' ? 0 : Number(nextValue));
                                        }}
                                        label="ID Maestro *"
                                        fullWidth
                                        type="number"
                                        error={!!errors.tipoMaestroID}
                                        helperText={
                                            errors.tipoMaestroID?.message
                                            || (isEdit
                                                ? 'El ID del maestro se define en la creación y no se edita.'
                                                : 'El ID es manual. Puedes ajustar el valor sugerido antes de guardar.')
                                        }
                                        disabled={viewOnly || isEdit}
                                        slotProps={{
                                            htmlInput: {
                                                min: 1,
                                                step: 1,
                                                inputMode: 'numeric'
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="seccion"
                                control={control}
                                render={({ field: { onChange, value, ref, ...field } }) => (
                                    <Autocomplete
                                        {...field}
                                        freeSolo
                                        options={secciones || []}
                                        value={value || null}
                                        onChange={(_, newValue) => onChange(newValue)}
                                        onInputChange={(_, newInputValue) => {
                                            onChange(newInputValue);
                                        }}
                                        disabled={viewOnly}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                label="Sección *" 
                                                placeholder="Seleccione o escriba una sección (Ej: VEHICULO)"
                                                error={!!errors.seccion}
                                                helperText={errors.seccion?.message || "La sección define el grupo y el rango de IDs"}
                                                inputRef={ref}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>

                        {!viewOnly && !isEdit && seccionResumen?.seccion ? (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                        Referencia de IDs para la sección {seccionResumen.seccion}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {seccionResumen.siguienteIdSugerido
                                            ? `Siguiente ID sugerido por backend: ${seccionResumen.siguienteIdSugerido}`
                                            : 'Aún no hay IDs registrados para esta sección.'}
                                    </Typography>
                                    {seccionResumen.ultimosIds.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                                            {seccionResumen.ultimosIds.map((id) => (
                                                <Chip key={id} label={`ID ${id}`} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    ) : null}
                                </Alert>
                            </Grid>
                        ) : null}

                        <Grid size={{xs:12}}>
                            <Controller
                                name="nombre"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nombre *"
                                        fullWidth
                                        error={!!errors.nombre}
                                        helperText={errors.nombre?.message}
                                        disabled={viewOnly}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="codigo"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Código"
                                        fullWidth
                                        placeholder="Código opcional"
                                        error={!!errors.codigo}
                                        helperText={errors.codigo?.message}
                                        disabled={viewOnly}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="activo"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                color="primary"
                                                disabled={viewOnly}
                                            />
                                        )}
                                    />
                                }
                                label="Activo"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        {viewOnly ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {!viewOnly ? (
                        <Button 
                            type="submit" 
                            variant="contained"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
                        </Button>
                    ) : null}
                </DialogActions>
            </form>
        </Dialog>
    );
}
