import { useRef } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, IconButton, useTheme, Alert } from '@mui/material';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { Add, Delete, Inventory2, Straighten, Scale, LibraryAdd, WarningAmber } from '@mui/icons-material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeWizardFormData } from '../../../model/schema';

interface Props {
    options: {
        mercaderias?: SelectItem[];
        tiposMedida?: SelectItem[];
        tiposPeso?: SelectItem[];
        defaultTipoMedidaId?: number;
        defaultTipoPesoId?: number;
    };
}

export function Step4DetallesCarga({ options }: Props) {
    const theme = useTheme();
    const autoDescriptionByFieldIdRef = useRef<Record<string, string>>({});
    const {
        control,
        register,
        getValues,
        setValue,
        formState: { errors },
    } = useFormContext<ViajeWizardFormData>();
    const {
        mercaderias,
        tiposMedida,
        tiposPeso,
        defaultTipoMedidaId = 0,
        defaultTipoPesoId = 0,
    } = options;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'mercaderias'
    });

    const handleMercaderiaChange = (fieldId: string, index: number, mercaderiaId: number) => {
        const mercaderiaBase = mercaderias?.find((item) => item.id === mercaderiaId)?.text ?? '';
        const descriptionPath = `mercaderias.${index}.descripcion` as const;
        const currentDescription = getValues(descriptionPath)?.trim() ?? '';
        const previousAutoDescription = autoDescriptionByFieldIdRef.current[fieldId]?.trim() ?? '';
        const shouldAutofill = currentDescription.length === 0 || currentDescription === previousAutoDescription;

        autoDescriptionByFieldIdRef.current[fieldId] = mercaderiaBase;

        if (!shouldAutofill) {
            return;
        }

        setValue(descriptionPath, mercaderiaBase, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleAddMercaderia = () => {
        append({
            mercaderiaID: 0,
            descripcion: '',
            tipoMedidaID: defaultTipoMedidaId,
            largo: 0,
            ancho: 0,
            alto: 0,
            tipoPesoID: defaultTipoPesoId,
            peso: 0
        });
    };

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
                <Typography variant="subtitle2" fontWeight={700}>Registro de Mercaderías</Typography>
                <Typography variant="body2">Debe registrar al menos una mercadería para completar el viaje. Especifique las dimensiones y el peso para un cálculo correcto.</Typography>
            </Alert>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: (currentTheme) => `${currentTheme.palette.success.main}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                            <Inventory2 />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>Detalles de la Carga</Typography>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Mercaderías a Transportar</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddMercaderia}
                        sx={{
                            borderRadius: 3,
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            boxShadow: theme.shadows[2],
                            '&:hover': { transform: 'translateY(-1px)', boxShadow: theme.shadows[4] },
                            transition: 'all 0.2s'
                        }}
                    >
                        Agregar Mercadería
                    </Button>
                </Box>
            </Paper>

            {fields.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                        <LibraryAdd fontSize="large" />
                    </Box>
                    <Box>
                        <Typography color="text.primary" variant="h6" fontWeight={700}>
                            Lista de Carga Vacía
                        </Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
                            No se han agregado mercaderías a este viaje. Haga clic en "Agregar Mercadería" para comenzar el registro.
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddMercaderia}
                        sx={{ mt: 2, borderRadius: 2, fontWeight: 600, px: 4 }}
                    >
                        Agregar la Primera
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {fields.map((field, index) => (
                        <Paper key={field.id} elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'relative', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4], borderColor: 'primary.light' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                                        {index + 1}
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                                        Registro de Mercadería
                                    </Typography>
                                </Box>
                                <IconButton
                                    color="error"
                                    onClick={() => remove(index)}
                                    size="small"
                                    sx={{ bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>

                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Tipo de Mercadería <Typography component="span" color="error">*</Typography>
                                    </Typography>
                                    {(() => {
                                        const mercaderiaRegistration = register(`mercaderias.${index}.mercaderiaID`, { valueAsNumber: true });

                                        return (
                                    <FormSelect
                                        label=""
                                        registration={mercaderiaRegistration}
                                        options={mercaderias || []}
                                        defaultValue={0}
                                        onChange={(event) => {
                                            handleMercaderiaChange(field.id, index, Number(event.target.value));
                                        }}
                                        error={!!errors.mercaderias?.[index]?.mercaderiaID}
                                        helperText={errors.mercaderias?.[index]?.mercaderiaID?.message as string}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, py: 1 } }}
                                    />
                                        );
                                    })()}
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Descripción Detallada <Typography component="span" color="text.disabled" sx={{ textTransform: 'none', fontWeight: 400 }}>(Opcional)</Typography>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Ej: Repuestos frágiles para maquinaria pesada"
                                        {...register(`mercaderias.${index}.descripcion`)}
                                        error={!!errors.mercaderias?.[index]?.descripcion}
                                        helperText={errors.mercaderias?.[index]?.descripcion?.message as string}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'info.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'info.main' }}>
                                                <Straighten fontSize="small" />
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">Dimensiones Físicas</Typography>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Unidad de Medida <Typography component="span" color="error">*</Typography></Typography>
                                                <FormSelect
                                                    label=""
                                                    registration={register(`mercaderias.${index}.tipoMedidaID`, { valueAsNumber: true })}
                                                    options={tiposMedida || []}
                                                    defaultValue={defaultTipoMedidaId}
                                                    error={!!errors.mercaderias?.[index]?.tipoMedidaID}
                                                    helperText={errors.mercaderias?.[index]?.tipoMedidaID?.message as string}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 4 }}>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Largo</Typography>
                                                <TextField
                                                    type="number"
                                                    fullWidth
                                                    placeholder="0.00"
                                                    {...register(`mercaderias.${index}.largo`, { valueAsNumber: true })}
                                                    error={!!errors.mercaderias?.[index]?.largo}
                                                    helperText={errors.mercaderias?.[index]?.largo?.message as string}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 4 }}>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Ancho</Typography>
                                                <TextField
                                                    type="number"
                                                    fullWidth
                                                    placeholder="0.00"
                                                    {...register(`mercaderias.${index}.ancho`, { valueAsNumber: true })}
                                                    error={!!errors.mercaderias?.[index]?.ancho}
                                                    helperText={errors.mercaderias?.[index]?.ancho?.message as string}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 4 }}>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Alto</Typography>
                                                <TextField
                                                    type="number"
                                                    fullWidth
                                                    placeholder="0.00"
                                                    {...register(`mercaderias.${index}.alto`, { valueAsNumber: true })}
                                                    error={!!errors.mercaderias?.[index]?.alto}
                                                    helperText={errors.mercaderias?.[index]?.alto?.message as string}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'warning.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main' }}>
                                                <Scale fontSize="small" />
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">Peso de la Carga</Typography>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Unidad de Peso <Typography component="span" color="error">*</Typography></Typography>
                                                <FormSelect
                                                    label=""
                                                    registration={register(`mercaderias.${index}.tipoPesoID`, { valueAsNumber: true })}
                                                    options={tiposPeso || []}
                                                    defaultValue={defaultTipoPesoId}
                                                    error={!!errors.mercaderias?.[index]?.tipoPesoID}
                                                    helperText={errors.mercaderias?.[index]?.tipoPesoID?.message as string}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Peso Total Estimado</Typography>
                                                <TextField
                                                    type="number"
                                                    fullWidth
                                                    placeholder="0.00"
                                                    {...register(`mercaderias.${index}.peso`, { valueAsNumber: true })}
                                                    error={!!errors.mercaderias?.[index]?.peso}
                                                    helperText={errors.mercaderias?.[index]?.peso?.message as string}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
}
