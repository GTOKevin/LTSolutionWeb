import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
    useTheme,
    Alert,
    IconButton,
    FormControlLabel,
    Switch,
    DialogActions
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import { handleLettersOnlyKeyDown } from '@shared/utils/input-validators';
import { useRolColaboradorForm } from '../../hooks/useRolColaboradorForm';

interface CreateEditRolColaboradorModalProps {
    open: boolean;
    onClose: () => void;
    rolToEdit?: RolColaborador | null;
    onSuccess: (id: number) => void;
}

export function CreateEditRolColaboradorModal({ open, onClose, rolToEdit, onSuccess }: CreateEditRolColaboradorModalProps) {
    const theme = useTheme();
    
    const {
        form,
        errorMessage,
        setErrorMessage,
        onSubmit,
        isEdit,
        isSubmitting
    } = useRolColaboradorForm({ open, onClose, onSuccess, rolToEdit });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = form;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { 
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none'
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 2
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {isEdit ? 'Editar Rol de Colaborador' : 'Crear Rol de Colaborador'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3, mt: 2 }}>
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                        {errorMessage}
                    </Alert>
                )}

                <form id="rol-colaborador-form" onSubmit={(e) => {
                    e.stopPropagation();
                    handleSubmit(onSubmit)(e);
                }} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12}}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                Nombre del Rol
                            </Typography>
                            <TextField
                                placeholder="ej: Conductor"
                                fullWidth
                                {...register('nombre')}
                                onKeyDown={handleLettersOnlyKeyDown}
                                error={!!errors.nombre}
                                helperText={errors.nombre?.message}
                                disabled={isEdit}
                                InputProps={{
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{xs:12}}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                Descripción
                            </Typography>
                            <TextField
                                placeholder="Descripción breve..."
                                fullWidth
                                multiline
                                rows={3}
                                {...register('descripcion')}
                                error={!!errors.descripcion}
                                helperText={errors.descripcion?.message}
                                InputProps={{
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{xs:12}}>
                            <Controller
                                name="activo"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        }
                                        label={field.value ? "Activo" : "Inactivo"}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2 }}>
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    form="rol-colaborador-form"
                    variant="contained" 
                    disabled={isSubmitting}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {isEdit ? 'Guardar Cambios' : 'Crear Rol'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}