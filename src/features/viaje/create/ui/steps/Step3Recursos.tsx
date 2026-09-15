import {
    Alert,
    Box,
    FormControlLabel,
    Grid,
    Paper,
    Switch,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { ReloadIconButton } from '@/shared/components/ui/ReloadIconButton';
import { useToast } from '@/shared/components/ui/Toast';
import { Badge, Business, LocalShipping, RvHookup, WarningAmber } from '@mui/icons-material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeWizardFormData } from '../../../model/schema';

interface Props {
    options: {
        tractos?: SelectItem[];
        carretas?: SelectItem[];
        colaboradores?: SelectItem[];
        refetchTractos?: () => Promise<unknown> | unknown;
        isFetchingTractos?: boolean;
        refetchCarretas?: () => Promise<unknown> | unknown;
        isFetchingCarretas?: boolean;
        refetchColaboradores?: () => Promise<unknown> | unknown;
        isFetchingColaboradores?: boolean;
    };
}

type RecursoTerceroFlag = 'esTractoTercero' | 'esCarretaTercero' | 'esConductorTercero';

export function Step3Recursos({ options }: Props) {
    const theme = useTheme();
    const { showToast } = useToast();
    const { register, control, setValue, getValues, formState: { errors } } = useFormContext<ViajeWizardFormData>();
    const {
        tractos,
        carretas,
        colaboradores,
        refetchTractos,
        isFetchingTractos,
        refetchCarretas,
        isFetchingCarretas,
        refetchColaboradores,
        isFetchingColaboradores,
    } = options;

    const esTractoTercero = useWatch({ control, name: 'esTractoTercero' });
    const esCarretaTercero = useWatch({ control, name: 'esCarretaTercero' });
    const esConductorTercero = useWatch({ control, name: 'esConductorTercero' });
    const sinCarreta = useWatch({ control, name: 'sinCarreta' });
    const hayRecursoTercero = Boolean(esTractoTercero || esConductorTercero || (esCarretaTercero && !sinCarreta));

    // L-N5: los refetch del wizard notifican al usuario con toast (el boton solo
    // registra con `logger`; sin este handler el fallo seria invisible).
    const handleReloadError = (message: string) => {
        showToast({ entity: 'Recursos de viaje', action: 'error', isError: true, message });
    };

    const handleTractoChange = (tractoID: number, onChangeField: (value: number) => void) => {
        onChangeField(tractoID);
        if (tractoID && tractos) {
            const selectedTracto = tractos.find(t => t.id === tractoID);
            if (selectedTracto?.extraTwo) {
                setValue('ejesTracto', parseInt(selectedTracto.extraTwo, 10), { shouldValidate: true, shouldDirty: true });
            }
        }
    };

    const handleCarretaChange = (carretaID: number, onChangeField: (value: number) => void) => {
        onChangeField(carretaID);
        if (carretaID && carretas) {
            const selectedCarreta = carretas.find(c => c.id === carretaID);
            if (selectedCarreta?.extraTwo) {
                setValue('ejesCarreta', parseInt(selectedCarreta.extraTwo, 10), { shouldValidate: true, shouldDirty: true });
            }
        }
    };

    // M2: los toggles revalidan (shouldValidate) y limpian el campo espejo completo:
    // al activar tercero se resetea el ID propio y los ejes (ingreso manual
    // obligatorio por schema); al desactivar se limpian los textos de tercero y,
    // si ya no queda ningun recurso tercero, la empresa de transporte.
    const clearEmpresaIfNoTerceros = () => {
        const values = getValues();
        const quedaAlguno = Boolean(
            values.esTractoTercero
            || values.esConductorTercero
            || (values.esCarretaTercero && !values.sinCarreta),
        );
        if (!quedaAlguno) {
            setValue('empresaTransporte', '', { shouldValidate: true, shouldDirty: true });
        }
    };

    // Sin carreta (solo create): al activar se limpia todo rastro de carreta
    // (ID, placa, ejes, flag tercero); al desactivar solo se revalida.
    const handleSinCarretaToggle = (checked: boolean, onChange: (value: boolean) => void) => {
        onChange(checked);
        if (checked) {
            setValue('esCarretaTercero', false, { shouldValidate: true, shouldDirty: true });
            setValue('carretaID', 0, { shouldValidate: true, shouldDirty: true });
            setValue('placaCarretaTercero', '', { shouldValidate: true, shouldDirty: true });
            setValue('ejesCarreta', 0, { shouldValidate: true, shouldDirty: true });
            clearEmpresaIfNoTerceros();
        } else {
            setValue('carretaID', 0, { shouldValidate: true, shouldDirty: true });
            setValue('ejesCarreta', 0, { shouldValidate: true, shouldDirty: true });
        }
    };

    const handleTractoTerceroToggle = (checked: boolean, onChange: (value: boolean) => void) => {
        onChange(checked);
        if (checked) {
            setValue('tractoID', 0, { shouldValidate: true, shouldDirty: true });
            setValue('ejesTracto', 0, { shouldValidate: true, shouldDirty: true });
        } else {
            setValue('placaTractoTercero', '', { shouldValidate: true, shouldDirty: true });
            setValue('ejesTracto', 0, { shouldValidate: true, shouldDirty: true });
            clearEmpresaIfNoTerceros();
        }
    };

    const handleCarretaTerceroToggle = (checked: boolean, onChange: (value: boolean) => void) => {
        // Con sinCarreta activo el toggle tercero se ignora (la UI lo deshabilita).
        if (getValues('sinCarreta')) return;
        onChange(checked);
        if (checked) {
            setValue('carretaID', 0, { shouldValidate: true, shouldDirty: true });
            setValue('ejesCarreta', 0, { shouldValidate: true, shouldDirty: true });
        } else {
            setValue('placaCarretaTercero', '', { shouldValidate: true, shouldDirty: true });
            setValue('ejesCarreta', 0, { shouldValidate: true, shouldDirty: true });
            clearEmpresaIfNoTerceros();
        }
    };

    const handleConductorTerceroToggle = (checked: boolean, onChange: (value: boolean) => void) => {
        onChange(checked);
        if (checked) {
            setValue('colaboradorID', 0, { shouldValidate: true, shouldDirty: true });
        } else {
            setValue('nombreConductorTercero', '', { shouldValidate: true, shouldDirty: true });
            clearEmpresaIfNoTerceros();
        }
    };

    const renderTerceroToggle = (
        name: RecursoTerceroFlag,
        onToggle: (checked: boolean, onChange: (value: boolean) => void) => void,
        disabled = false,
    ) => (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            color="primary"
                            checked={!!field.value}
                            disabled={disabled}
                            onChange={(_, checked) => onToggle(checked, field.onChange)}
                        />
                    }
                    label={
                        <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                color: field.value ? 'primary.main' : 'text.secondary',
                            }}
                        >
                            {field.value ? 'Tercero' : 'Propio'}
                        </Typography>
                    }
                    sx={{ m: 0, alignSelf: 'flex-start' }}
                />
            )}
        />
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Alert
                icon={<WarningAmber fontSize="inherit" />}
                severity="info"
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'info.light',
                    '& .MuiAlert-message': { width: '100%' }
                }}
            >
                <Typography variant="subtitle2" fontWeight={700}>Verificación de Documentos</Typography>
                <Typography variant="body2">Asegúrese de que los recursos asignados no tengan notificaciones pendientes (Ej. SOAT, Revisiones Técnicas o Licencias vencidas).</Typography>
            </Alert>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: (currentTheme) => `${currentTheme.palette.primary.main}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                                    <Badge />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>Personal Asignado</Typography>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Conductor del Viaje</Typography>
                                </Box>
                            </Box>
                            {renderTerceroToggle('esConductorTercero', handleConductorTerceroToggle)}
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {esConductorTercero ? 'Nombre del Conductor' : 'Seleccione Conductor'} <Typography component="span" color="error">*</Typography>
                                    </Typography>
                                    {!esConductorTercero && refetchColaboradores && (
                                        <ReloadIconButton
                                            tooltipTitle="Actualizar conductores"
                                            onReload={refetchColaboradores}
                                            isLoading={isFetchingColaboradores}
                                            onReloadError={handleReloadError}
                                        />
                                    )}
                                </Box>
                                {esConductorTercero ? (
                                    <Controller
                                        name="nombreConductorTercero"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                value={field.value ?? ''}
                                                fullWidth
                                                size="medium"
                                                placeholder="Ej: Juan Pérez"
                                                inputProps={{ maxLength: 200 }}
                                                error={!!errors.nombreConductorTercero}
                                                helperText={errors.nombreConductorTercero?.message?.toString()}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        )}
                                    />
                                ) : (
                                    <FormSelect
                                        label=""
                                        registration={register('colaboradorID', { valueAsNumber: true })}
                                        options={colaboradores || []}
                                        defaultValue={0}
                                        error={!!errors.colaboradorID}
                                        helperText={errors.colaboradorID?.message?.toString()}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'info.light', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'info.dark' }}>
                                        <LocalShipping />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>Unidad Tractora</Typography>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Vehículo Principal</Typography>
                                    </Box>
                                </Box>
                                {renderTerceroToggle('esTractoTercero', handleTractoTerceroToggle)}
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {esTractoTercero ? 'Placa del Tracto (Tercero)' : 'Placa del Tracto'} <Typography component="span" color="error">*</Typography>
                                        </Typography>
                                        {!esTractoTercero && refetchTractos && (
                                            <ReloadIconButton
                                                tooltipTitle="Actualizar tractos"
                                                onReload={refetchTractos}
                                                isLoading={isFetchingTractos}
                                                onReloadError={handleReloadError}
                                            />
                                        )}
                                    </Box>
                                    {esTractoTercero ? (
                                        <Controller
                                            name="placaTractoTercero"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    fullWidth
                                                    size="medium"
                                                    placeholder="Ej: ABC-123"
                                                    inputProps={{ maxLength: 10 }}
                                                    error={!!errors.placaTractoTercero}
                                                    helperText={errors.placaTractoTercero?.message?.toString()}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            )}
                                        />
                                    ) : (
                                        <Controller
                                            name="tractoID"
                                            control={control}
                                            render={({ field }) => (
                                                <FormSelect
                                                    label=""
                                                    registration={{
                                                        name: field.name,
                                                        onBlur: async () => { field.onBlur(); },
                                                        onChange: async (e) => {
                                                            field.onChange(e);
                                                            handleTractoChange(Number(e.target.value), field.onChange);
                                                        },
                                                        ref: field.ref
                                                    }}
                                                    options={tractos || []}
                                                    value={field.value || 0}
                                                    error={!!errors.tractoID}
                                                    helperText={errors.tractoID?.message?.toString()}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            )}
                                        />
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Número de Ejes {esTractoTercero && <Typography component="span" color="error">*</Typography>}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        size="medium"
                                        placeholder={esTractoTercero ? 'Ingreso manual' : 'Automático'}
                                        {...register('ejesTracto', { valueAsNumber: true })}
                                        error={!!errors.ejesTracto}
                                        helperText={errors.ejesTracto?.message?.toString()}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'warning.light', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.dark' }}>
                                        <RvHookup />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>Unidad de Carga</Typography>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Remolque / Semirremolque</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Controller
                                        name="sinCarreta"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        color="warning"
                                                        checked={!!field.value}
                                                        onChange={(_, checked) => handleSinCarretaToggle(checked, field.onChange)}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        variant="caption"
                                                        fontWeight={700}
                                                        sx={{
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 1,
                                                            color: field.value ? 'warning.dark' : 'text.secondary',
                                                        }}
                                                    >
                                                        Sin carreta
                                                    </Typography>
                                                }
                                                sx={{ m: 0, alignSelf: 'flex-start' }}
                                            />
                                        )}
                                    />
                                    {renderTerceroToggle('esCarretaTercero', handleCarretaTerceroToggle, Boolean(sinCarreta))}
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {sinCarreta ? 'Placa de la Carreta' : (esCarretaTercero ? 'Placa de la Carreta (Tercero)' : 'Placa de la Carreta')} {!sinCarreta && <Typography component="span" color="error">*</Typography>}
                                        </Typography>
                                        {!sinCarreta && !esCarretaTercero && refetchCarretas && (
                                            <ReloadIconButton
                                                tooltipTitle="Actualizar carretas"
                                                onReload={refetchCarretas}
                                                isLoading={isFetchingCarretas}
                                                onReloadError={handleReloadError}
                                            />
                                        )}
                                    </Box>
                                    {sinCarreta ? (
                                        <TextField
                                            fullWidth
                                            size="medium"
                                            value="-"
                                            disabled
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    ) : esCarretaTercero ? (
                                        <Controller
                                            name="placaCarretaTercero"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    fullWidth
                                                    size="medium"
                                                    placeholder="Ej: XYZ-456"
                                                    inputProps={{ maxLength: 10 }}
                                                    error={!!errors.placaCarretaTercero}
                                                    helperText={errors.placaCarretaTercero?.message?.toString()}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            )}
                                        />
                                    ) : (
                                        <Controller
                                            name="carretaID"
                                            control={control}
                                            render={({ field }) => (
                                                <FormSelect
                                                    label=""
                                                    registration={{
                                                        name: field.name,
                                                        onBlur: async () => { field.onBlur(); },
                                                        onChange: async (e) => {
                                                            field.onChange(e);
                                                            handleCarretaChange(Number(e.target.value), field.onChange);
                                                        },
                                                        ref: field.ref
                                                    }}
                                                    options={carretas || []}
                                                    value={field.value || 0}
                                                    error={!!errors.carretaID}
                                                    helperText={errors.carretaID?.message?.toString()}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            )}
                                        />
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Número de Ejes {!sinCarreta && esCarretaTercero && <Typography component="span" color="error">*</Typography>}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        size="medium"
                                        disabled={Boolean(sinCarreta)}
                                        placeholder={sinCarreta ? 'No aplica' : (esCarretaTercero ? 'Ingreso manual' : 'Automático')}
                                        {...register('ejesCarreta', { valueAsNumber: true })}
                                        error={!!errors.ejesCarreta}
                                        helperText={errors.ejesCarreta?.message?.toString()}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>

                {hayRecursoTercero && (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'success.light', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.dark' }}>
                                    <Business />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>Empresa de Transporte</Typography>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Obligatoria con recursos terceros</Typography>
                                </Box>
                            </Box>
                            <Controller
                                name="empresaTransporte"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value ?? ''}
                                        fullWidth
                                        size="medium"
                                        placeholder="Ej: Transportes del Norte S.A.C."
                                        inputProps={{ maxLength: 200 }}
                                        error={!!errors.empresaTransporte}
                                        helperText={errors.empresaTransporte?.message?.toString()}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
