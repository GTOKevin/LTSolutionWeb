import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
    useTheme,
    alpha,
    MenuItem,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Tabs,
    Tab
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useUsuarioForm } from '../../hooks/useUsuarioForm';
import { SectionHeader } from '@shared/components/ui/SectionHeader';
import { TabPanel } from '@shared/components/ui/TabPanel';
import type { Usuario } from '@entities/usuario/model/types';
import { Visibility, VisibilityOff, LockReset, Info, Close as CloseIcon } from '@mui/icons-material';
import { handleNoSpacesKeyDown } from '@shared/utils/input-validators';

interface CreateEditUsuarioModalProps {
    open: boolean;
    onClose: () => void;
    usuarioToEdit?: Usuario | null;
    onSuccess: (id: number) => void;
    viewOnly?: boolean;
}

export function CreateEditUsuarioModal({ open, onClose, usuarioToEdit, onSuccess, viewOnly = false }: CreateEditUsuarioModalProps) {
    const theme = useTheme();
    
    const {
        form: {
            register,
            handleSubmit,
            control,
            formState: { errors, isSubmitting }
        },
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        
        // Lists
        listaRoles,
        listaEstados,
        listaColaboradores,
        
        // Password helpers
        showPassword,
        handleTogglePasswordVisibility,
        generateSecurePassword,
        
        isEdit
    } = useUsuarioForm({
        usuarioToEdit,
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
                sx: { 
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none',
                    minHeight: '60vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 0,
                bgcolor: alpha(theme.palette.background.default, 0.5)
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {viewOnly ? 'Detalle del Usuario' : (isEdit ? 'Editar Usuario' : 'Nuevo Usuario')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Gestión de accesos y permisos del sistema
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Datos de Cuenta" />
                    <Tab label="Vinculación" />
                </Tabs>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
                {errorMessage && (
                    <Box sx={{ p: 3, pb: 0 }}>
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    </Box>
                )}

                <form id="usuario-form" onSubmit={(e) => {
                    e.stopPropagation();
                    handleSubmit(onSubmit)(e);
                }} noValidate style={{ height: '100%' }}>
                    
                    {/* Tab 0: Datos de Cuenta */}
                    <TabPanel value={activeTab} index={0}>
                        <Box sx={{ px: 3 }}>
                            {/* Credenciales */}
                            <Box sx={{ mb: 4 }}>
                                <SectionHeader number="1" title="Credenciales" themeColor={theme.palette.primary.main} />
                                <Grid container spacing={2}>
                                    <Grid size={{xs:12, md:6}}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                            Nombre de Usuario
                                        </Typography>
                                        <TextField
                                            placeholder="ej: jdoe_logistica"
                                            fullWidth
                                            {...register('nombre')}
                                            onKeyDown={handleNoSpacesKeyDown}
                                            error={!!errors.nombre}
                                            helperText={errors.nombre?.message}
                                            disabled={viewOnly}
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, md:6}}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                            Email Corporativo
                                        </Typography>
                                        <TextField
                                            placeholder="usuario@logisegura.com"
                                            fullWidth
                                            {...register('email')}
                                            onKeyDown={handleNoSpacesKeyDown}
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            disabled={viewOnly}
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    </Grid>
                                    {!isEdit && (
                                        <Grid size={{xs:12}}>
                                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                                Contraseña
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Box sx={{ flex: 1, position: 'relative' }}>
                                                    <TextField
                                                        type={showPassword ? 'text' : 'password'}
                                                        fullWidth
                                                        placeholder="••••••••"
                                                        {...register('clave')}
                                                        onKeyDown={handleNoSpacesKeyDown}
                                                        error={!!errors.clave}
                                                        helperText={errors.clave?.message}
                                                        disabled={viewOnly}
                                                        InputProps={{
                                                            sx: { borderRadius: 2 },
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handleTogglePasswordVisibility}
                                                                        edge="end"
                                                                    >
                                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Box>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={generateSecurePassword}
                                                    startIcon={<LockReset />}
                                                    disabled={viewOnly}
                                                    sx={{ 
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 'bold',
                                                        whiteSpace: 'nowrap',
                                                        px: 2,
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    Generar Segura
                                                </Button>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>

                            {/* Permisos */}
                            <Box>
                                <SectionHeader number="2" title="Permisos y Estado" themeColor={theme.palette.primary.main} />
                                <Grid container spacing={3} alignItems="flex-end">
                                    <Grid size={{xs:12, md:6}}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                            Rol del Usuario
                                        </Typography>
                                        <Controller
                                            name="rolUsuarioID"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    fullWidth
                                                    error={!!errors.rolUsuarioID}
                                                    helperText={errors.rolUsuarioID?.message}
                                                    disabled={viewOnly}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                >
                                                    <MenuItem value={0} disabled>Seleccione un rol</MenuItem>
                                                    {listaRoles.map((role) => (
                                                        <MenuItem key={role.id} value={role.id}>
                                                            {role.text}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, md:6}}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                            Estado de la cuenta
                                        </Typography>
                                        <Controller
                                            name="estadoID"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    fullWidth
                                                    error={!!errors.estadoID}
                                                    helperText={errors.estadoID?.message}
                                                    disabled={viewOnly}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                >
                                                    <MenuItem value={0} disabled>Seleccione un estado</MenuItem>
                                                    {listaEstados.map((estado) => (
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
                        </Box>
                    </TabPanel>

                    {/* Tab 1: Vinculación */}
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ px: 3 }}>
                            <SectionHeader number="3" title="Vinculación de Personal" themeColor={theme.palette.primary.main} />
                            <Grid container spacing={2}>
                                <Grid size={{xs:12}}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                        Vincular a Colaborador (ID)
                                    </Typography>
                                    <Controller
                                        name="colaboradorID"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                error={!!errors.colaboradorID}
                                                helperText={errors.colaboradorID?.message}
                                                disabled={viewOnly || (isEdit && !!usuarioToEdit?.colaboradorID)}
                                                InputProps={{
                                                    sx: { borderRadius: 2 }
                                                }}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            >
                                                <MenuItem value={0}>Ninguno</MenuItem>
                                                {listaColaboradores.map((colab) => (
                                                    <MenuItem key={colab.id} value={colab.id}>
                                                        {colab.text}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{xs:12}}>
                                    <Alert 
                                        icon={<Info fontSize="inherit" />} 
                                        severity="info"
                                        sx={{ 
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                            color: theme.palette.info.dark,
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                                        }}
                                    >
                                        <strong>Nota importante:</strong> Al vincular, el usuario heredará automáticamente los permisos y datos del colaborador seleccionado.
                                    </Alert>
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5), borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button 
                    onClick={onClose} 
                    disabled={isSubmitting}
                    sx={{ 
                        color: 'text.primary',
                        fontWeight: 'bold',
                        px: 3
                    }}
                >
                    Cancelar
                </Button>
                {!viewOnly && (
                    <Button 
                        type="submit" 
                        form="usuario-form" 
                        variant="contained" 
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}></span>}
                        sx={{ 
                            px: 4, 
                            fontWeight: 'bold', 
                            boxShadow: 'none',
                            borderRadius: 2
                        }}
                    >
                        Guardar Usuario
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
