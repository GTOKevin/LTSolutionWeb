import {
    Button,
    Collapse,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Switch,
    TextField,
    Typography,
    Box,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Cancel as CancelIcon,
    Edit as EditIcon,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import { handleLettersOnlyKeyDown, handleNumbersOnlyKeyDown } from '@shared/utils/input-validators';
import type { ClienteContactosController } from '../hooks/useClienteContactosController';

interface ClienteContactosFormCardProps {
    controller: ClienteContactosController;
}

export function ClienteContactosFormCard({ controller }: ClienteContactosFormCardProps) {
    const theme = useTheme();
    const {
        formRef,
        form,
        editingId,
        isFormExpanded,
        createMutation,
        updateMutation,
        onSubmit,
        resetForm,
        handleCreate,
        toggleFormExpanded,
    } = controller;
    const {
        register,
        control,
        formState: { errors, isSubmitting, isDirty },
    } = form;

    return (
        <Paper
            ref={formRef}
            elevation={0}
            sx={{
                p: 0,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                bgcolor: alpha(editingId ? theme.palette.warning.main : theme.palette.primary.main, 0.02),
                overflow: 'hidden',
                mb: 2,
            }}
        >
            <Box
                onClick={() => {
                    if (isFormExpanded && editingId) {
                        resetForm();
                    } else if (!isFormExpanded && !editingId) {
                        handleCreate();
                    } else {
                        toggleFormExpanded();
                    }
                }}
                sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: isFormExpanded ? `1px solid ${theme.palette.divider}` : 'none',
                    cursor: 'pointer',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            bgcolor: editingId ? theme.palette.warning.main : theme.palette.primary.main,
                            color: 'white',
                            p: 0.5,
                            borderRadius: '50%',
                            display: 'flex',
                        }}
                    >
                        {editingId ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {editingId ? 'Editar Contacto' : 'Agregar Contacto'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {editingId ? (
                        <Button
                            size="small"
                            color="inherit"
                            startIcon={<CancelIcon />}
                            onClick={(event) => {
                                event.stopPropagation();
                                resetForm();
                            }}
                        >
                            Cancelar Edicion
                        </Button>
                    ) : null}
                    <IconButton
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            toggleFormExpanded();
                        }}
                    >
                        {isFormExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={isFormExpanded} unmountOnExit>
                <Box sx={{ p: 3 }}>
                    <Box component="form" onSubmit={onSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Nombre Completo"
                                    fullWidth
                                    size="small"
                                    {...register('nombreCompleto')}
                                    error={!!errors.nombreCompleto}
                                    helperText={errors.nombreCompleto?.message}
                                    onKeyDown={handleLettersOnlyKeyDown}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Rol / Cargo"
                                    fullWidth
                                    size="small"
                                    {...register('rol')}
                                    error={!!errors.rol}
                                    helperText={errors.rol?.message}
                                    onKeyDown={handleLettersOnlyKeyDown}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Telefono Principal"
                                    fullWidth
                                    size="small"
                                    {...register('telefonoPrincipal')}
                                    error={!!errors.telefonoPrincipal}
                                    helperText={errors.telefonoPrincipal?.message}
                                    onKeyDown={handleNumbersOnlyKeyDown}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Telefono Secundario"
                                    fullWidth
                                    size="small"
                                    {...register('telefonoSecundario')}
                                    error={!!errors.telefonoSecundario}
                                    helperText={errors.telefonoSecundario?.message}
                                    onKeyDown={handleNumbersOnlyKeyDown}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    size="small"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            </Grid>
                            {editingId ? (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="activo"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={(
                                                    <Switch
                                                        checked={field.value}
                                                        onChange={(event) => field.onChange(event.target.checked)}
                                                        color="success"
                                                    />
                                                )}
                                                label="Contacto Activo"
                                            />
                                        )}
                                    />
                                </Grid>
                            ) : null}
                            <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end" gap={1}>
                                <Button onClick={resetForm} color="inherit">
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting || createMutation.isPending || updateMutation.isPending || (!!editingId && !isDirty)}
                                >
                                    Guardar
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
}
