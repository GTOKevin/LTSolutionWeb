import { 
    Box, 
    Button, 
    IconButton, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Typography, 
    Paper, 
    TextField, 
    Grid, 
    useTheme,
    alpha,
    Tooltip
} from '@mui/material';
import { 
    AddCircle as AddCircleIcon,
    Person as PersonIcon,
    LocalShipping as LocalShippingIcon,
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    ListAlt as ListAltIcon,
    DoNotDisturb as NoFileIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import type { CreateViajeGuiaDto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';

interface Props {
    viewOnly?: boolean;
    tiposGuia: SelectItem[];
}

const API_URL = import.meta.env.VITE_IMG_URL_BASE || 'https://localhost:44332';

export function ViajeGuiaList({ viewOnly, tiposGuia }: Props) {
    const theme = useTheme();
    const { control, register, formState: { errors } } = useFormContext();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "viajeGuia"
    });

    const [newItem, setNewItem] = useState<CreateViajeGuiaDto>({
        tipoGuiaID: 0,
        serie: '',
        numero: '',
        rutaArchivo: ''
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getFullUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = API_URL.replace(/\/api\/?$/, '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handleAdd = () => {
        if (!newItem.tipoGuiaID || !newItem.serie || !newItem.numero) return;
        append(newItem);
        setNewItem({
            tipoGuiaID: 0,
            serie: '',
            numero: '',
            rutaArchivo: ''
        });
    };

    const handlePreview = (path: string) => {
        setPreviewUrl(getFullUrl(path));
    };

    const handleClosePreview = () => {
        setPreviewUrl(null);
    };

    const getGuideTypeIcon = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return <PersonIcon fontSize="small" />;
        if (text.toLowerCase().includes('transportista')) return <LocalShippingIcon fontSize="small" />;
        return <ListAltIcon fontSize="small" />;
    };

    const getGuideTypeColor = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return theme.palette.primary.main;
        if (text.toLowerCase().includes('transportista')) return theme.palette.success.main;
        return theme.palette.text.secondary;
    };

    const getGuideTypeBg = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return alpha(theme.palette.primary.main, 0.1);
        if (text.toLowerCase().includes('transportista')) return alpha(theme.palette.success.main, 0.1);
        return alpha(theme.palette.text.secondary, 0.1);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Formulario de Registro */}
            {!viewOnly && (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3, 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <AddCircleIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Registro de Nueva Guía
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid size={{xs:12,lg:6}}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Tipo de Guía */}
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                                        Tipo de Guía
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            gap: 1, 
                                            p: 0.5, 
                                            bgcolor: alpha(theme.palette.background.default, 0.5), 
                                            borderRadius: 2 
                                        }}
                                    >
                                        {tiposGuia.map((tipo) => {
                                            const isSelected = newItem.tipoGuiaID === tipo.id;
                                            const color = getGuideTypeColor(tipo.text);
                                            
                                            return (
                                                <Box 
                                                    key={tipo.id}
                                                    onClick={() => setNewItem({ ...newItem, tipoGuiaID: tipo.id })}
                                                    sx={{
                                                        flex: 1,
                                                        cursor: 'pointer',
                                                        py: 1.5,
                                                        px: 2,
                                                        borderRadius: 1.5,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 1,
                                                        bgcolor: isSelected ? 'background.paper' : 'transparent',
                                                        color: isSelected ? color : 'text.secondary',
                                                        boxShadow: isSelected ? theme.shadows[1] : 'none',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            color: isSelected ? color : 'text.primary'
                                                        }
                                                    }}
                                                >
                                                    {getGuideTypeIcon(tipo.text)}
                                                    <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'medium'}>
                                                        {tipo.text}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>

                                {/* Serie y Número */}
                                <Grid container spacing={2}>
                                    <Grid size={{xs:4}}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
                                            Serie
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="T001"
                                            value={newItem.serie}
                                            onChange={(e) => setNewItem({ ...newItem, serie: e.target.value })}
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{xs:8}}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
                                            Número
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="00000000"
                                            value={newItem.numero}
                                            onChange={(e) => setNewItem({ ...newItem, numero: e.target.value })}
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<SaveIcon />}
                                    onClick={handleAdd}
                                    disabled={!newItem.tipoGuiaID || !newItem.serie || !newItem.numero}
                                    sx={{ 
                                        mt: 1,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                >
                                    Registrar Guía
                                </Button>
                            </Box>
                        </Grid>

                        <Grid size={{xs:12,lg:6}}>
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                                    Evidencia (Ruta de Archivo)
                                </Typography>
                                <Box sx={{ flex: 1 }}>
                                    <ImageUpload
                                        value={newItem.rutaArchivo}
                                        onChange={(url) => setNewItem({ ...newItem, rutaArchivo: url })}
                                        folder="guias"
                                        label="Arrastra tu archivo aquí"
                                        helperText="O haz clic para seleccionar (PDF, JPG, PNG)"
                                    />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Listado de Guías */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ListAltIcon color="action" />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Guías Registradas
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: 'text.secondary'
                    }}>
                        <Typography variant="caption" fontWeight="bold">
                            Total: {fields.length} registros
                        </Typography>
                    </Box>
                </Box>

                <Paper 
                    elevation={0} 
                    sx={{ 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tipo de Guía</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Documento (Serie-N°)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Evidencia</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((field, index) => {
                                // Cast field to any because useFieldArray types can be tricky with DTOs
                                const item = field as unknown as CreateViajeGuiaDto;
                                const tipo = tiposGuia.find(t => t.id === item.tipoGuiaID);
                                const tipoText = tipo?.text || 'Desconocido';
                                
                                return (
                                    <TableRow key={field.id} hover>
                                        <TableCell>
                                            <Box sx={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: 1,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 10,
                                                bgcolor: getGuideTypeBg(tipoText),
                                                color: getGuideTypeColor(tipoText)
                                            }}>
                                                {getGuideTypeIcon(tipoText)}
                                                <Typography variant="caption" fontWeight="bold">
                                                    {tipoText}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontFamily="monospace">
                                                {item.serie}-{item.numero}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.rutaArchivo ? (
                                                <Tooltip title="Ver archivo">
                                                    <IconButton 
                                                        size="small" 
                                                        sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                                        onClick={() => handlePreview(item.rutaArchivo!)}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Sin archivo">
                                                    <IconButton size="small" disabled sx={{ color: 'text.disabled' }}>
                                                        <NoFileIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                {!viewOnly && (
                                                    <Tooltip title="Eliminar">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error" 
                                                            sx={{ 
                                                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                                                bgcolor: alpha(theme.palette.error.main, 0.05)
                                                            }}
                                                            onClick={() => remove(index)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {fields.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No hay guías registradas
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
            
            <DocumentPreviewDialog 
                open={!!previewUrl}
                onClose={handleClosePreview}
                previewUrl={previewUrl}
            />
        </Box>
    );
}