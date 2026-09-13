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

    // Sincronización automática con tabla de ítems
    const [sincronizado, setSincronizado] = useState(true);
    const [unidadPeso, setUnidadPeso] = useState<'kg' | 'Tn'>('kg');

    // Consulta de mercaderías del viaje
    const { data: mercaderiasPaged, isLoading: isLoadingMercaderias } = useViajeMercaderias(viaje.viajeID, 1, 50);
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

    // Modal de confirmación de eliminación
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // Lista consolidada de mercaderías (del query o del viaje si el query aún carga)
    const items: ViajeMercaderia[] = useMemo(() => {
        if (mercaderiasPaged?.items && mercaderiasPaged.items.length > 0) {
            return mercaderiasPaged.items;
        }
        return viaje.viajeMercaderia || [];
    }, [mercaderiasPaged, viaje.viajeMercaderia]);

    // Totales calculados a partir de los ítems de la tabla
    const totalsFromItems = useMemo(() => {
        if (items.length === 0) return null;

        const maxLargo = Math.max(...items.map(m => Number(m.largo) || 0));
        const maxAncho = Math.max(...items.map(m => Number(m.ancho) || 0));
        const maxAlto = Math.max(...items.map(m => Number(m.alto) || 0));
        const totalPeso = items.reduce((acc, m) => acc + (Number(m.peso) || 0), 0);

        const result: {
            largo: number | '';
            ancho: number | '';
            alto: number | '';
            peso: number | '';
            requiereEscolta: boolean;
        } = {
            largo: maxLargo > 0 ? maxLargo : '',
            ancho: maxAncho > 0 ? maxAncho : '',
            alto: maxAlto > 0 ? maxAlto : '',
            peso: totalPeso > 0 ? totalPeso : '',
            requiereEscolta: maxAncho >= 3.00,
        };
        return result;
    }, [items]);

    const handleToggleSincronizado = (checked: boolean) => {
        setSincronizado(checked);
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

    // Validación de sobredimensión
    const esSobredimension = anchoNum > 2.60 || altoNum > 4.20 || largoNum > 20.50;

    // Capacidad útil estimada
    const capacidadMaxCarreta = 32000;
    const porcentajeUtil = pesoNum > 0 ? ((pesoNum / capacidadMaxCarreta) * 100).toFixed(1) : '0';

    // Manejador para agregar mercadería
    const handleAddMercaderia = async () => {
        if (!selectedMercaderiaId) {
            showToast({ entity: 'Mercadería', action: 'create', isError: true, message: 'Seleccione un producto o mercadería del catálogo.' });
            return;
        }

        const payload: CreateViajeMercaderiaDto = {
            mercaderiaID: Number(selectedMercaderiaId),
            descripcion: itemDescripcion.trim() || undefined,
            tipoMedidaID: viaje.tipoMedidaID || 1, // Medida en Metros
            tipoPesoID: viaje.tipoPesoID || 1,     // Peso en Kilogramos
            largo: itemLargo === '' ? undefined : Number(itemLargo),
            ancho: itemAncho === '' ? undefined : Number(itemAncho),
            alto: itemAlto === '' ? undefined : Number(itemAlto),
            peso: itemPeso === '' ? undefined : Number(itemPeso),
        };

        try {
            await createMercaderiaMutation.mutateAsync({ viajeId: viaje.viajeID, data: payload });
            showToast({ entity: 'Mercadería', action: 'create' });
            // Limpiar formulario de entrada rápida
            setSelectedMercaderiaId('');
            setItemDescripcion('');
            setItemPeso('');
            setItemLargo('');
            setItemAncho('');
            setItemAlto('');
        } catch {
            showToast({ entity: 'Mercadería', action: 'create', isError: true });
        }
    };

    // Manejador para eliminar mercadería
    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await deleteMercaderiaMutation.mutateAsync({ id: deleteTargetId, viajeId: viaje.viajeID });
            showToast({ entity: 'Mercadería', action: 'delete' });
            setDeleteTargetId(null);
        } catch {
            showToast({ entity: 'Mercadería', action: 'delete', isError: true });
        }
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
                        <Chip
                            label="Edición Directa Activa"
                            size="small"
                            color="success"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
                        />
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
                                    value={formData.peso === '' ? '' : (unidadPeso === 'Tn' ? (Number(formData.peso) / 1000) : formData.peso)}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === '') {
                                            onChange({ peso: '' });
                                        } else {
                                            const num = Number(raw);
                                            onChange({ peso: unidadPeso === 'Tn' ? num * 1000 : num });
                                        }
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
                                        onChange={(e) => setUnidadPeso(e.target.value as 'kg' | 'Tn')}
                                        sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                                    >
                                        <MenuItem value="kg">kg</MenuItem>
                                        <MenuItem value="Tn">Tn</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', mt: 'auto' }}>
                                Capacidad máx. carreta: <strong>32,000 kg</strong> ({porcentajeUtil}% útil)
                            </Typography>
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
                                    <Typography variant="caption" sx={{ color: anchoNum > 2.60 ? 'warning.dark' : 'text.secondary', fontWeight: anchoNum > 2.60 ? 700 : 500, display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                                        Ancho (m) {anchoNum > 2.60 ? '*' : ''}
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
                                                    bgcolor: anchoNum > 2.60 ? alpha(theme.palette.warning.main, 0.1) : 'inherit',
                                                    color: anchoNum > 2.60 ? 'warning.dark' : 'inherit',
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
                                    Volumen Total
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

                    {esSobredimension && (
                        <Chip
                            icon={<WarningAmberRoundedIcon fontSize="small" />}
                            label="Ancho excedente (> 2.60 m) o altura especial detectados"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                        />
                    )}
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
                                    onChange={(e) => setSelectedMercaderiaId(e.target.value as number)}
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

            {/* Tabla Interactiva de Ítems */}
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
                                const itemRequiereEscolta = a >= 3.00;

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
                                                        onClick={() => setDeleteTargetId(item.viajeMercaderiaID)}
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

            {/* Modal de confirmación de eliminación */}
            <Dialog open={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)}>
                <DialogTitle sx={{ fontWeight: 800 }}>Eliminar Mercadería</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        ¿Está seguro de que desea eliminar este ítem del manifiesto de mercadería?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteTargetId(null)} color="inherit">
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
