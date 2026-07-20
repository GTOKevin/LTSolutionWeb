import {
    Box,
    Divider,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { TabPanel } from '@shared/components/ui/TabPanel';
import { ClienteContactosList } from '@features/cliente/contactos/ui/ClienteContactosModal';
import { handleLettersOnlyKeyDown, handleNumbersOnlyKeyDown } from '@shared/utils/input-validators';
import type { CreateClienteSchema } from '@features/cliente/model/schema';
import type { useClienteForm } from '@features/cliente/hooks/useClienteForm';

interface ClienteCrudPageContentProps {
    activeTab: number;
    form: ReturnType<typeof useClienteForm>['form'];
    onSubmit: (data: CreateClienteSchema) => void;
    effectiveClienteId: number | null;
    isEdit: boolean;
    viewOnly?: boolean;
}

export function ClienteCrudPageContent({
    activeTab,
    form,
    onSubmit,
    effectiveClienteId,
    isEdit,
    viewOnly = false,
}: ClienteCrudPageContentProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = form;

    return (
        <>
            <TabPanel value={activeTab} index={0} name="cliente">
                <form id="cliente-form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ px: 3 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                    Datos Generales
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="RUC"
                                    fullWidth
                                    {...register('ruc')}
                                    error={!!errors.ruc}
                                    helperText={errors.ruc?.message}
                                    disabled={viewOnly || isEdit || !!effectiveClienteId}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Razón Social"
                                    fullWidth
                                    {...register('razonSocial')}
                                    error={!!errors.razonSocial}
                                    helperText={errors.razonSocial?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Dirección Legal"
                                    fullWidth
                                    {...register('direccionLegal')}
                                    error={!!errors.direccionLegal}
                                    helperText={errors.direccionLegal?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Dirección Fiscal"
                                    fullWidth
                                    {...register('direccionFiscal')}
                                    error={!!errors.direccionFiscal}
                                    helperText={errors.direccionFiscal?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 1 }}>
                                    Información de Contacto
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Contacto Principal (Nombre)"
                                    fullWidth
                                    {...register('contactoPrincipal')}
                                    error={!!errors.contactoPrincipal}
                                    helperText={errors.contactoPrincipal?.message}
                                    disabled={viewOnly}
                                    onKeyDown={handleLettersOnlyKeyDown}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Email Corporativo"
                                    fullWidth
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Teléfono"
                                    fullWidth
                                    {...register('telefono')}
                                    error={!!errors.telefono}
                                    helperText={errors.telefono?.message}
                                    disabled={viewOnly}
                                    onKeyDown={handleNumbersOnlyKeyDown}
                                />
                            </Grid>
                            {isEdit ? (
                                <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center">
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
                                                        disabled={viewOnly}
                                                    />
                                                )}
                                                label="Cliente Activo"
                                            />
                                        )}
                                    />
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </form>
            </TabPanel>

            <TabPanel value={activeTab} index={1} name="cliente">
                <Box sx={{ px: 3, height: '100%' }}>
                    {effectiveClienteId ? (
                        <ClienteContactosList clienteId={effectiveClienteId} viewOnly={viewOnly} />
                    ) : null}
                </Box>
            </TabPanel>
        </>
    );
}
