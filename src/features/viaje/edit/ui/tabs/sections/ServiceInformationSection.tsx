import { Box, Typography, Grid, Paper, Chip, alpha, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import RvHookupOutlinedIcon from '@mui/icons-material/RvHookupOutlined';
import type { Viaje } from '@/entities/viaje/model/types';
import { VIAJE_RECURSO_LABELS } from '@/features/viaje/model/viaje-resource-labels';

interface ServiceInformationSectionProps {
    viaje: Viaje;
}

const getConductorNombre = (viaje: Viaje) => {
    if (viaje.esConductorTercero) {
        return viaje.nombreConductorTercero?.trim() || VIAJE_RECURSO_LABELS.conductorTerceroSinRegistrar;
    }
    const nombre = [viaje.colaborador?.nombres, viaje.colaborador?.primerApellido, viaje.colaborador?.segundoApellido]
        .filter(Boolean)
        .join(' ')
        .trim();
    return nombre || VIAJE_RECURSO_LABELS.sinConductor;
};


const getTractoPlaca = (viaje: Viaje) =>
    viaje.esTractoTercero ? (viaje.placaTractoTercero ?? VIAJE_RECURSO_LABELS.sinPlaca) : (viaje.tracto?.placa ?? VIAJE_RECURSO_LABELS.sinPlaca);

const getCarretaPlaca = (viaje: Viaje) => {
    if (viaje.esCarretaTercero) {
        return viaje.placaCarretaTercero ?? VIAJE_RECURSO_LABELS.sinPlaca
    } else if (!viaje.esCarretaTercero && viaje.sinCarreta) {
        return VIAJE_RECURSO_LABELS.sinCarreta
    }
    return (viaje.carreta?.placa ?? VIAJE_RECURSO_LABELS.sinPlaca)
}

const getUbigeoDescripcion = (ubigeo?: Viaje['origen']) =>
    [ubigeo?.departamento, ubigeo?.provincia, ubigeo?.distrito]
        .filter(Boolean)
        .join(', ')
        .trim();

const getTercero = (viaje: Viaje) => {
    return viaje.esTractoTercero || viaje.esCarretaTercero || viaje.esConductorTercero;
}

export function ServiceInformationSection({ viaje }: ServiceInformationSectionProps) {
    const theme = useTheme();

    const esTerceroTotal = Boolean(viaje.esTractoTercero && viaje.esCarretaTercero && viaje.esConductorTercero);
    const esPropioTotal = Boolean(!viaje.esTractoTercero && !viaje.esCarretaTercero && !viaje.esConductorTercero);
    const esHibrido = !esTerceroTotal && !esPropioTotal;

    const conductorNombre = getConductorNombre(viaje);
    const tractoPlaca = getTractoPlaca(viaje);
    const carretaPlaca = getCarretaPlaca(viaje);
    const origenDescripcion = getUbigeoDescripcion(viaje.origen) || VIAJE_RECURSO_LABELS.origenNoRegistrado;
    const destinoDescripcion = getUbigeoDescripcion(viaje.destino) || VIAJE_RECURSO_LABELS.destinoNoRegistrado;

    const tractoConfig = viaje.ejesTracto ? `${viaje.ejesTracto} Ejes` : 'Unidad de Transporte';
    const carretaConfig = viaje.ejesCarreta ? `Plataforma ${viaje.ejesCarreta} Ejes` : 'Semirremolque';

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <InfoOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.primary' }}>
                            Información del Servicio
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Modalidad y Recursos Asignados
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    label={esPropioTotal ? 'Flota Propia' : esHibrido ? 'Servicio Híbrido' : 'Tercerizado'}
                    size="small"
                    color={esPropioTotal ? 'primary' : esHibrido ? 'warning' : 'default'}
                    sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}
                />
            </Box>

            {/* Desglose Modular de Recursos Asignados */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
                        Desglose Modular de Recursos Asignados
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Identificación individual de pertenencia
                    </Typography>
                </Box>

                <Grid container spacing={2.5}>
                    {/* Recurso 1: Tracto */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: viaje.esTractoTercero ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.primary.main, 0.3),
                                bgcolor: viaje.esTractoTercero ? alpha(theme.palette.warning.main, 0.04) : alpha(theme.palette.primary.main, 0.03),
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocalShippingOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
                                            Unidad Tracto
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={viaje.esTractoTercero ? 'Tercero Alquilado' : VIAJE_RECURSO_LABELS.tractoPropio}
                                        size="small"
                                        color={viaje.esTractoTercero ? 'warning' : 'primary'}
                                        sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: 0.5, color: 'text.primary' }}>
                                        {tractoPlaca}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                        {tractoConfig}
                                    </Typography>
                                </Box>

                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.8 }}>
                                    Pertenencia: {viaje.esTractoTercero ? (viaje.empresaTransporte || VIAJE_RECURSO_LABELS.proveedorExterno) : VIAJE_RECURSO_LABELS.flotaPropia}
                                </Typography>
                            </Box>

                            <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Origen de unidad:
                                </Typography>
                                <Chip
                                    label={viaje.esTractoTercero ? 'Alquilado / Tercero' : 'Flota Propia'}
                                    size="small"
                                    variant="outlined"
                                    color={viaje.esTractoTercero ? 'warning' : 'default'}
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Recurso 2: Carreta / Semirremolque */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: viaje.esCarretaTercero ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.primary.main, 0.3),
                                bgcolor: viaje.esCarretaTercero ? alpha(theme.palette.warning.main, 0.04) : alpha(theme.palette.primary.main, 0.03),
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <RvHookupOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
                                            Carreta / Semirremolque
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={viaje.esCarretaTercero ? 'Tercero Alquilado' : VIAJE_RECURSO_LABELS.carretaPropia}
                                        size="small"
                                        color={viaje.esCarretaTercero ? 'warning' : 'primary'}
                                        sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: 0.5, color: 'text.primary' }}>
                                        {carretaPlaca}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                        {carretaConfig}
                                    </Typography>
                                </Box>

                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.8 }}>
                                    Proveedor: {viaje.esCarretaTercero ? (viaje.empresaTransporte || VIAJE_RECURSO_LABELS.proveedorExterno) : VIAJE_RECURSO_LABELS.flotaPropia}
                                </Typography>
                            </Box>

                            <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Origen de carreta:
                                </Typography>
                                <Chip
                                    label={viaje.esCarretaTercero ? 'Alquilado / Tercero' : 'Flota Propia'}
                                    size="small"
                                    variant="outlined"
                                    color={viaje.esCarretaTercero ? 'warning' : 'default'}
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Recurso 3: Conductor Asignado */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: viaje.esConductorTercero ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.primary.main, 0.3),
                                bgcolor: viaje.esConductorTercero ? alpha(theme.palette.warning.main, 0.04) : alpha(theme.palette.primary.main, 0.03),
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
                                            Conductor Asignado
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={viaje.esConductorTercero ? 'Tercero' : 'Propio'}
                                        size="small"
                                        color={viaje.esConductorTercero ? 'warning' : 'primary'}
                                        sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                                    />
                                </Box>

                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {conductorNombre}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                    {viaje.esConductorTercero ? VIAJE_RECURSO_LABELS.contratistaTransporte : VIAJE_RECURSO_LABELS.personalPropio}
                                </Typography>
                            </Box>

                            <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Vínculo conductor:
                                </Typography>
                                <Chip
                                    label={viaje.esConductorTercero ? 'Chofer Tercero' : 'Personal Propio'}
                                    size="small"
                                    variant="outlined"
                                    color={viaje.esConductorTercero ? 'warning' : 'default'}
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Cliente & Empresa Transporte */}
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: (getTercero(viaje) ? 6 : 12) }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                        Cliente
                    </Typography>
                    <Box
                        sx={{
                            width: '100%',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            px: 2,
                            py: 1.25,
                            bgcolor: alpha(theme.palette.text.primary, 0.02),
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {viaje.cliente?.razonSocial || VIAJE_RECURSO_LABELS.sinCliente}
                        </Typography>
                    </Box>
                </Grid>
                {getTercero(viaje) ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                            Empresa Transporte (Subcontratista / Razón Social)
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                px: 2,
                                py: 1.25,
                                bgcolor: alpha(theme.palette.text.primary, 0.02),
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {viaje.empresaTransporte || VIAJE_RECURSO_LABELS.sinEmpresaRegistrada}
                            </Typography>
                        </Box>
                    </Grid>) : (<></>)}
            </Grid>

            {/* Punto de Origen & Destino */}
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: '1px dashed',
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette.text.primary, 0.015),
                        }}
                    >
                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', lineHeight: 1, mb: 0.8 }}>
                            PUNTO DE ORIGEN
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {origenDescripcion}
                        </Typography>
                        {viaje.direccionOrigen && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                {viaje.direccionOrigen}
                            </Typography>
                        )}
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: '1px dashed',
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette.text.primary, 0.015),
                        }}
                    >
                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', lineHeight: 1, mb: 0.8 }}>
                            PUNTO DE DESTINO
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {destinoDescripcion}
                        </Typography>
                        {viaje.direccionDestino && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                {viaje.direccionDestino}
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
