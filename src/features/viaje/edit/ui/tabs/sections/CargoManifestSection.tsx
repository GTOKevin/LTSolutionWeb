import { useState, useMemo } from 'react';
import {
    Box, Typography, Grid, Paper, Chip, Switch, TextField,
    Button, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Tooltip, MenuItem, Select, FormControl,
    CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, alpha, useTheme
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';
import type { Viaje, ViajeMercaderia, CreateViajeMercaderiaDto } from '@/entities/viaje/model/types';
import type { ResumenGeneralData } from '../../../model/viaje-edit-tabs';
import {
    CARGO_LIMITS,
    displayUnitToKg,
    getCargoTotalsFromItems,
    getConvoyCapacity,
    getCarretaUtilization,
    isOversizedDimension,
    kgToDisplayUnit,
    requiresEscort,
    type PesoUnit,
} from '@/features/viaje/model/cargo-limits';
import {
    useViajeMercaderias,
    useCreateViajeMercaderia,
    useDeleteViajeMercaderia
} from '@/features/viaje/hooks/useViajeMercaderias';
import { useViajeCatalogOptions } from '@/features/viaje/options/hooks/useViajeCatalogOptions';
import { useToast } from '@/shared/components/ui/Toast';

interface CargoManifestSectionProps {
    viaje: Viaje;
    formData: ResumenGeneralData;
    onChange: (data: Partial<ResumenGeneralData>) => void;
    isViewOnly?: boolean;
}

export function CargoManifestSection({
    viaje,
    formData,
    onChange,
    isViewOnly = false
}: CargoManifestSectionProps) {
    const theme = useTheme();
    const { showToast } = useToast();

    // Sincronización automática con tabla de ítems.
    // H2: la sincronizacion sobrescribe dimensiones/peso del formData cuando el
    // switch esta activo. Es una accion explicita del usuario (toggle), no un
    // efecto en render; el calculo vive en `getCargoTotalsFromItems` (testeable).
    const [sincronizado, setSincronizado] = useState(true);
    const [unidadPeso, setUnidadPeso] = useState<PesoUnit>('kg');
    // H2: borrador local del peso para no redondear el valor canonico (kg) al
    // alternar kg/Tn. Solo se confirma al formData en onChange del input.
    const [pesoDraft, setPesoDraft] = useState<string | null>(null);

    // M4: pagina amplia con aviso de truncado (ver CARGO_LIMITS.MANIFEST_PAGE_SIZE).
    const { data: mercaderiasPaged, isLoading: isLoadingMercaderias, isSuccess: isMercaderiasSuccess } =
        useViajeMercaderias(viaje.viajeID, 1, CARGO_LIMITS.MANIFEST_PAGE_SIZE);
    const { mercaderias: catalogoMercaderias } = useViajeCatalogOptions();

    // Mutaciones
    const createMercaderiaMutation = useCreateViajeMercaderia();
    const deleteMercaderiaMutation = useDeleteViajeMercaderia();

    // Estado del formulario de entrada rápida
    const [selectedMercaderiaId, setSelectedMercaderiaId] = useState<number | ''>('');
    const [itemDescripcion, setItemDescripcion] = useState('');
    const [itemPeso, setItemPeso] = useState<number | ''>('');
    const [itemLargo, setItemLargo] = useState<number | ''>('');
    const [itemAncho, setItemAncho] = useState<number | ''>('');
    const [itemAlto, setItemAlto] = useState<number | ''>('');

    // Modal de confirmación de eliminación (M4: undefined = cerrado, nunca Dialog abierto sin salida)
    const [deleteTargetId, setDeleteTargetId] = useState<number | undefined>(undefined);

    // M4: tras isSuccess la fuente es el query (aunque este vacio); el snapshot
    // `viaje.viajeMercaderia` solo se usa mientras el query aun no resuelve.
    const items: ViajeMercaderia[] = useMemo(() => {
        if (isMercaderiasSuccess) {
            return mercaderiasPaged?.items ?? [];
        }
        return viaje.viajeMercaderia || [];
    }, [isMercaderiasSuccess, mercaderiasPaged, viaje.viajeMercaderia]);

    // H2: totales derivados en `model/cargo-limits.ts` (testeable).
    const totalsFromItems = useMemo(() => getCargoTotalsFromItems(items), [items]);
    const totalRegistrado = mercaderiasPaged?.total ?? items.length;
    const isTruncado = totalRegistrado > items.length;

    const handleToggleSincronizado = (checked: boolean) => {
        setSincronizado(checked);
        // H2: al confirmar desde la tabla se invalida el borrador del peso.
        setPesoDraft(null);
        if (checked && totalsFromItems) {
            onChange({
                largo: totalsFromItems.largo !== '' ? totalsFromItems.largo : formData.largo,
                ancho: totalsFromItems.ancho !== '' ? totalsFromItems.ancho : formData.ancho,
                alto: totalsFromItems.alto !== '' ? totalsFromItems.alto : formData.alto,
                peso: totalsFromItems.peso !== '' ? totalsFromItems.peso : formData.peso,
                requiereEscolta: totalsFromItems.requiereEscolta,
            });
        }
    };

    // Cálculo de volumen
    const largoNum = Number(formData.largo) || 0;
    const anchoNum = Number(formData.ancho) || 0;
    const altoNum = Number(formData.alto) || 0;
    const pesoNum = Number(formData.peso) || 0;

    const volumenTotal = useMemo(() => {
        if (largoNum > 0 && anchoNum > 0 && altoNum > 0) {
            return (largoNum * anchoNum * altoNum).toFixed(1);
        }
        return '0.0';
    }, [largoNum, anchoNum, altoNum]);

    // H2: sobredimension y utilizacion derivadas de constantes de dominio y ejes del convoy.
    const esSobredimension = isOversizedDimension(largoNum, anchoNum, altoNum);
    const convoyCapacity = useMemo(
        () => getConvoyCapacity(viaje.ejesTracto, viaje.ejesCarreta, viaje.sinCarreta),
        [viaje.ejesTracto, viaje.ejesCarreta, viaje.sinCarreta]
    );
    const capacidadMaxCarreta = convoyCapacity.cargaUtilMaxKg;
    const porcentajeUtil = getCarretaUtilization(pesoNum, capacidadMaxCarreta);

    // M1: el feedback (success/error) lo emite el hook generico
    // (createGenericCrudHooks -> useGenericCrud). Aqui solo se valida el input
    // local y se limpia el formulario en onSuccess; sin try/catch ni toast duplicado.
    const handleAddMercaderia = () => {
        if (!selectedMercaderiaId) {
            showToast({ entity: 'Mercadería', action: 'create', isError: true, message: 'Seleccione un producto o mercadería del catálogo.' });
            return;
        }

        const payload: CreateViajeMercaderiaDto = {
            mercaderiaID: Number(selectedMercaderiaId),
            descripcion: itemDescripcion.trim() || undefined,
            tipoMedidaID: viaje.tipoMedidaID || CARGO_LIMITS.DEFAULT_TIPO_MEDIDA_ID,
            tipoPesoID: viaje.tipoPesoID || CARGO_LIMITS.DEFAULT_TIPO_PESO_ID,
            largo: itemLargo === '' ? undefined : Number(itemLargo),
            ancho: itemAncho === '' ? undefined : Number(itemAncho),
            alto: itemAlto === '' ? undefined : Number(itemAlto),
            peso: itemPeso === '' ? undefined : Number(itemPeso),
        };

        createMercaderiaMutation.mutate(
            { viajeId: viaje.viajeID, data: payload },
            {
                onSuccess: () => {
                    setSelectedMercaderiaId('');
                    setItemDescripcion('');
                    setItemPeso('');
                    setItemLargo('');
                    setItemAncho('');
                    setItemAlto('');
                },
            },
        );
    };

    // M1/M4: sin try/catch local; el hook notifica. Cierra el Dialog solo en exito
    // para no dejarlo abierto sin salida ante un id indefinido.
    const handleConfirmDelete = () => {
        if (deleteTargetId === undefined) return;
        deleteMercaderiaMutation.mutate(
            { id: deleteTargetId, viajeId: viaje.viajeID },
            { onSuccess: () => setDeleteTargetId(undefined) },
        );
    };

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
            {/* Header de Sección */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 2, gap: 1.5 }}>
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
                        <Inventory2OutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.primary' }}>
                            Especificación y Manifiesto de Mercadería
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Gestión multi-ítem con cálculo automático y configuración manual sobrescribible de dimensiones
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    icon={<CheckCircleOutlineIcon fontSize="small" />}
                    label="Carga 100% Editable (Modo Manual / Sincronizado)"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.72rem', borderColor: alpha(theme.palette.primary.main, 0.4) }}
                />
            </Box>

            {/* Panel Principal: Configuración de Carga y Dimensiones Generales (100% Editable) */}
            <Box
                sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                }}
            >
                {/* Cabecera del Panel Editable */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15), pb: 1.5, gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditNoteOutlinedIcon sx={{ color: 'primary.main' }} fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'primary.dark' }}>
                            Configuración de Carga y Dimensiones Generales
                        </Typography>
                    </Box>

                    {/* Sincronización Switch */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'background.paper',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Switch
                            size="small"
                            checked={sincronizado}
                            onChange={(e) => handleToggleSincronizado(e.target.checked)}
                            disabled={isViewOnly}
                            color="primary"
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', userSelect: 'none' }}>
                            Sincronizar automáticamente con tabla de ítems
                        </Typography>
                    </Box>
                </Box>

                {/* Grid de Métricas Principales */}
                <Grid container spacing={2.5}>
                    {/* Peso Total Declarado */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                height: '100%',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
                                Peso Total Declarado
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={pesoDraft ?? kgToDisplayUnit(formData.peso, unidadPeso)}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        setPesoDraft(raw);
                                        onChange({ peso: displayUnitToKg(raw, unidadPeso) });
                                    }}
                                    disabled={isViewOnly || (sincronizado && items.length > 0)}
                                    slotProps={{
                                        input: {
                                            sx: {
                                                fontFamily: 'monospace',
                                                fontWeight: 800,
                                                fontSize: '1rem',
                                            }
                                        }
                                    }}
                                />
                                <FormControl size="small" sx={{ width: 85 }}>
                                    <Select
                                        value={unidadPeso}
                                        onChange={(e) => {
                                            const next = e.target.value === 'Tn' ? 'Tn' : 'kg';
                                            // H2: al cambiar de unidad se descarta el borrador
                                            // para mostrar la conversion exacta del valor canonico.
                                            setPesoDraft(null);
                                            setUnidadPeso(next);
                                        }}
                                        sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                                    >
                                        <MenuItem value="kg">kg</MenuItem>
                                        <MenuItem value="Tn">Tn</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            {/* N1: los valores del convoy son estimaciones frontend no vinculantes
                                (ver TODO(backend-contract) en `model/cargo-limits.ts`). El tooltip
                                mantiene el prefijo `est.` / `~` y el aviso referencial. */}
                            <Tooltip
                                title={
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>
                                            Capacidad estimada del convoy ({convoyCapacity.totalEjes} ejes)
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                            &bull; <strong>PBV est.:</strong> ~{convoyCapacity.pesoBrutoMaximoKg.toLocaleString()} kg ({convoyCapacity.totalEjes} ejes &times; ~{CARGO_LIMITS.PESO_POR_EJE_KG.toLocaleString()} kg)
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                            &bull; <strong>Tara est. convoy:</strong> ~{convoyCapacity.taraEstimadaKg.toLocaleString()} kg (Tracto: {convoyCapacity.ejesTracto} ejes, Carreta: {convoyCapacity.ejesCarreta} ejes)
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'primary.light', fontWeight: 700 }}>
                                            &bull; <strong>Carga útil est. disponible:</strong> ~{convoyCapacity.cargaUtilMaxKg.toLocaleString()} kg
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                            Estimación referencial no vinculante; no sustituye la normativa MTC ni el contrato backend.
                                        </Typography>
                                    </Box>
                                }
                                arrow
                            >
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', mt: 'auto', cursor: 'help' }}>
                                    Capacidad est.: <strong>~{convoyCapacity.cargaUtilMaxKg.toLocaleString()} kg</strong> ({porcentajeUtil}% útil ref.) &bull; PBV est.: <strong>~{convoyCapacity.pesoBrutoMaximoKg.toLocaleString()} kg</strong>
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Grid>

                    {/* Dimensiones Generales (m) */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: esSobredimension ? alpha(theme.palette.warning.main, 0.6) : 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                height: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
                                    Dimensiones Generales (m)
                                </Typography>
                                {esSobredimension && (
                                    <Chip
                                        icon={<WarningAmberRoundedIcon fontSize="inherit" />}
                                        label="Alerta de sobredimensión"
                                        size="small"
                                        color="warning"
                                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                                    />
                                )}
                            </Box>

                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 4 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                                        Largo (m)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.largo}
                                        onChange={(e) => onChange({ largo: e.target.value === '' ? '' : Number(e.target.value) })}
                                        disabled={isViewOnly || (sincronizado && items.length > 0)}
                                        slotProps={{
                                            htmlInput: { step: '0.05' },
                                            input: {
                                                sx: {
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                    textAlign: 'center',
                                                    fontSize: '0.85rem',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 4 }}>
                                    <Typography variant="caption" sx={{ color: anchoNum > CARGO_LIMITS.MAX_NORMAL_WIDTH_M ? 'warning.dark' : 'text.secondary', fontWeight: anchoNum > CARGO_LIMITS.MAX_NORMAL_WIDTH_M ? 700 : 500, display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                                        Ancho (m) {anchoNum > CARGO_LIMITS.MAX_NORMAL_WIDTH_M ? '*' : ''}
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.ancho}
                                        onChange={(e) => onChange({ ancho: e.target.value === '' ? '' : Number(e.target.value) })}
                                        disabled={isViewOnly || (sincronizado && items.length > 0)}
                                        slotProps={{
                                            htmlInput: { step: '0.05' },
                                            input: {
                                                sx: {
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                    textAlign: 'center',
                                                    fontSize: '0.85rem',
                                                    bgcolor: anchoNum > CARGO_LIMITS.MAX_NORMAL_WIDTH_M ? alpha(theme.palette.warning.main, 0.1) : 'inherit',
                                                    color: anchoNum > CARGO_LIMITS.MAX_NORMAL_WIDTH_M ? 'warning.dark' : 'inherit',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 4 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                                        Alto (m)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.alto}
                                        onChange={(e) => onChange({ alto: e.target.value === '' ? '' : Number(e.target.value) })}
                                        disabled={isViewOnly || (sincronizado && items.length > 0)}
                                        slotProps={{
                                            htmlInput: { step: '0.05' },
                                            input: {
                                                sx: {
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                    textAlign: 'center',
                                                    fontSize: '0.85rem',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Volumen Computado */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
                                    Volumen Teórico
                                </Typography>
                                <Chip
                                    label="En Tiempo Real"
                                    size="small"
                                    color="primary"
                                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                                />
                            </Box>

                            <Box sx={{ my: 1, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>
                                    {volumenTotal}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                    m³
                                </Typography>
                            </Box>

                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                                Calculado: {largoNum || 0} × {anchoNum || 0} × {altoNum || 0}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Switches Operativos Editables */}
                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15), display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        {/* Switch Requiere Escolta */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                                checked={formData.requiereEscolta}
                                onChange={(e) => onChange({ requiereEscolta: e.target.checked })}
                                disabled={isViewOnly}
                                color="warning"
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: formData.requiereEscolta ? 'warning.dark' : 'text.primary' }}>
                                Requiere Escolta
                            </Typography>
                            <Chip
                                label={formData.requiereEscolta ? 'ACTIVO' : 'INACTIVO'}
                                size="small"
                                color={formData.requiereEscolta ? 'warning' : 'default'}
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                            />
                        </Box>

                    </Box>

                </Box>
            </Box>

            {/* Entrada Rápida de Mercadería */}
            {!isViewOnly && (
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        bgcolor: alpha(theme.palette.text.primary, 0.02),
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AddCircleOutlineIcon sx={{ color: 'primary.main' }} fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.primary' }}>
                                Entrada Rápida de Mercadería
                            </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Complete los parámetros del bulto o maquinaria
                        </Typography>
                    </Box>

                    <Grid container spacing={2} alignItems="flex-end">
                        {/* Producto / Mercadería */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                Producto / Mercadería
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedMercaderiaId}
                                    onChange={(e) => setSelectedMercaderiaId(Number(e.target.value))}
                                    displayEmpty
                                    sx={{ bgcolor: 'background.paper', fontSize: '0.85rem' }}
                                >
                                    <MenuItem value="" disabled>
                                        <em>Seleccione producto del catálogo...</em>
                                    </MenuItem>
                                    {catalogoMercaderias?.map((m) => (
                                        <MenuItem key={m.id} value={m.id}>
                                            {m.text}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Descripción / Serie */}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                Detalle / Serie
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Ej: CAT 966H"
                                value={itemDescripcion}
                                onChange={(e) => setItemDescripcion(e.target.value)}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        </Grid>

                        {/* Peso (kg) */}
                        <Grid size={{ xs: 6, md: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                Peso (kg)
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                placeholder="kg"
                                value={itemPeso}
                                onChange={(e) => setItemPeso(e.target.value === '' ? '' : Number(e.target.value))}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        </Grid>

                        {/* Medidas L x A x H */}
                        <Grid size={{ xs: 6, md: 2.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                Medidas L × A × H (m)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <TextField
                                    size="small"
                                    type="number"
                                    placeholder="L"
                                    value={itemLargo}
                                    onChange={(e) => setItemLargo(e.target.value === '' ? '' : Number(e.target.value))}
                                    slotProps={{ htmlInput: { step: '0.05' } }}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                                <TextField
                                    size="small"
                                    type="number"
                                    placeholder="A"
                                    value={itemAncho}
                                    onChange={(e) => setItemAncho(e.target.value === '' ? '' : Number(e.target.value))}
                                    slotProps={{ htmlInput: { step: '0.05' } }}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                                <TextField
                                    size="small"
                                    type="number"
                                    placeholder="H"
                                    value={itemAlto}
                                    onChange={(e) => setItemAlto(e.target.value === '' ? '' : Number(e.target.value))}
                                    slotProps={{ htmlInput: { step: '0.05' } }}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            </Box>
                        </Grid>

                        {/* Botón Agregar */}
                        <Grid size={{ xs: 12, md: 1.5 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleAddMercaderia}
                                disabled={createMercaderiaMutation.isPending}
                                startIcon={createMercaderiaMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutlineIcon />}
                                sx={{ height: 40, fontWeight: 700, fontSize: '0.82rem' }}
                            >
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tabla Interactiva de Ítems.
                L-N4 (decision documentada): tabla hand-rolled intencional. `SharedTable`
                impone paginacion MUI + `PagedResponse` y se oculta en movil (`xs: none`);
                el manifiesto usa pagina fija (1x100) con aviso de truncado propio y debe
                ser visible en todos los breakpoints, con celdas mono/chips por item.
                Reevaluar si `SharedTable` gana render personalizado por columna y modo movil. */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.text.primary, 0.03) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem', py: 1.5 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>Descripción / Mercadería</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>Cantidad</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>Peso Declarado</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>Dimensiones (L × A × H)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>Cubicación</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>Régimen / Escolta</TableCell>
                            {!isViewOnly && (
                                <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>Acciones</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoadingMercaderias ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    No hay ítems de mercadería registrados en este viaje.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, index) => {
                                const l = Number(item.largo) || 0;
                                const a = Number(item.ancho) || 0;
                                const h = Number(item.alto) || 0;
                                const itemVolumen = (l > 0 && a > 0 && h > 0) ? (l * a * h).toFixed(1) : '-';
                                const itemRequiereEscolta = requiresEscort(a);

                                return (
                                    <TableRow key={item.viajeMercaderiaID || index} hover>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>
                                            {String(index + 1).padStart(2, '0')}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {item.mercaderia?.descripcion || item.descripcion || 'Mercadería'}
                                            </Typography>
                                            {item.descripcion && item.mercaderia?.descripcion && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {item.descripcion}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label="1 Unid" size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'text.primary' }}>
                                            {Number(item.peso || 0).toLocaleString()} kg
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {l} × {a} × {h} m
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>
                                            {itemVolumen} m³
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={itemRequiereEscolta ? <SecurityIcon fontSize="inherit" /> : undefined}
                                                label={itemRequiereEscolta ? 'Requiere Escolta' : 'Carga Normal'}
                                                size="small"
                                                color={itemRequiereEscolta ? 'warning' : 'default'}
                                                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                                            />
                                        </TableCell>
                                        {!isViewOnly && (
                                            <TableCell align="right">
                                                <Tooltip title="Eliminar ítem">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            if (item.viajeMercaderiaID !== undefined) {
                                                                setDeleteTargetId(item.viajeMercaderiaID);
                                                            }
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Box>

            {isTruncado && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Mostrando {items.length} de {totalRegistrado} ítems (página 1 de {CARGO_LIMITS.MANIFEST_PAGE_SIZE}). Ajuste el tamaño de página en el modelo si el manifiesto crece.
                </Typography>
            )}

            {/* Modal de confirmación de eliminación (M4: abierto solo con id definido) */}
            <Dialog open={deleteTargetId !== undefined} onClose={() => setDeleteTargetId(undefined)}>
                <DialogTitle sx={{ fontWeight: 800 }}>Eliminar Mercadería</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        ¿Está seguro de que desea eliminar este ítem del manifiesto de mercadería?
                    </Typography>
                    {isTruncado && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                            Mostrando {items.length} de {totalRegistrado} ítems registrados.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteTargetId(undefined)} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={deleteMercaderiaMutation.isPending}
                    >
                        {deleteMercaderiaMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
