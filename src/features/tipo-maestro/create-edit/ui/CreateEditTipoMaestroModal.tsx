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
    Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import { useTipoMaestroForm } from '../../hooks/useTipoMaestroForm';

interface CreateEditTipoMaestroModalProps {
    open: boolean;
    onClose: () => void;
    maestroToEdit: TipoMaestro | null;
    onSuccess: (id: number) => void;
}

export function CreateEditTipoMaestroModal({
    open,
    onClose,
    maestroToEdit,
    onSuccess
}: CreateEditTipoMaestroModalProps) {
    
    const {
        form,
        errorMessage,
        setErrorMessage,
        secciones,
        onSubmit,
        isEdit,
        isSubmitting
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
                    {isEdit ? 'Editar Maestro' : 'Nuevo Maestro'}
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
                                name="seccion"
                                control={control}
                                render={({ field: { onChange, value, ref, ...field } }) => (
                                    <Autocomplete
                                        {...field}
                                        freeSolo
                                        options={secciones?.data || []}
                                        value={value || null}
                                        onChange={(_, newValue) => onChange(newValue)}
                                        onInputChange={(_, newInputValue) => {
                                            onChange(newInputValue);
                                        }}
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
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
