import { 
    Box, 
    Typography, 
    useTheme, 
    alpha, 
    Chip, 
    Tooltip, 
    CircularProgress,
    IconButton,
    TableCell
} from '@mui/material';
import { 
    History as HistoryIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeIncidente } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useViajeIncidentes, useDeleteViajeIncidente } from '@/features/viaje/hooks/useViajeIncidentes';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    tiposIncidente: SelectItem[];
    onEdit?: (item: ViajeIncidente) => void;
}

const API_URL = import.meta.env.VITE_IMG_URL_BASE || 'https://localhost:44332';

export function ViajeIncidenteList({ viajeId, viewOnly, tiposIncidente, onEdit }: Props) {
    const theme = useTheme();
    
    // Query & Mutations
    const { data: incidentes = [], isLoading } = useViajeIncidentes(viajeId);
    const deleteMutation = useDeleteViajeIncidente();

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async (id: number) => {
        if (!viajeId) return;
        try {
            await deleteMutation.mutateAsync({ id, viajeId });
        } catch (error) {
            console.error("Error deleting incidente:", error);
        }
    };

    const getFullUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = API_URL.replace(/\/api\/?$/, '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handlePreview = (path: string) => {
        setPreviewUrl(getFullUrl(path));
    };

    const handleClosePreview = () => {
        setPreviewUrl(null);
    };

    const getIncidenteColor = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('accidente')) return theme.palette.error;
        if (lower.includes('robo')) return theme.palette.error;
        if (lower.includes('falla')) return theme.palette.warning;
        if (lower.includes('clima')) return theme.palette.info;
        if (lower.includes('bloqueo')) return theme.palette.warning;
        return theme.palette.primary;
    };

    // Client-side pagination
    const paginatedIncidentes = incidentes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const pagedData = {
        items: paginatedIncidentes,
        total: incidentes.length,
        page: page + 1,
        size: rowsPerPage,
        totalPages: Math.ceil(incidentes.length / rowsPerPage)
    };

    const columns: Column[] = [
        { id: 'fecha', label: 'Fecha / Hora' },
        { id: 'tipo', label: 'Tipo' },
        { id: 'lugar', label: 'Lugar' },
        { id: 'descripcion', label: 'Descripción / Referencia' },
        { id: 'evidencia', label: 'Evidencia', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Incidentes Registrados
                    </Typography>
                    {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Box>
            </Box>

            <SharedTable
                data={pagedData}
                isLoading={isLoading}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                columns={columns}
                keyExtractor={(item) => item.viajeIncidenteID}
                emptyMessage="No hay incidentes registrados"
                renderRow={(item) => {
                    const tipo = tiposIncidente.find(t => t.id === item.tipoIncidenteID);
                    const tipoText = tipo?.text || item.tipoIncidente?.descripcion || 'Otro';
                    const colorPalette = getIncidenteColor(tipoText);
                    const fecha = new Date(item.fechaHora);

                    return (
                        <>
                            <TableCell>
                                <Typography variant="body2" fontWeight="medium" color="text.primary">
                                    {fecha.toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={tipoText} 
                                    size="small" 
                                    sx={{ 
                                        height: 24,
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        bgcolor: alpha(colorPalette.main, 0.1),
                                        color: colorPalette.dark,
                                        border: `1px solid ${alpha(colorPalette.main, 0.2)}`
                                    }} 
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                    {item.lugar || 'N/A'}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 300 }}>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {item.descripcion}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                {item.rutaFoto ? (
                                    <Tooltip title="Ver Evidencia">
                                        <IconButton 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                            }}
                                            onClick={() => handlePreview(item.rutaFoto!)}
                                        >
                                            <ImageIcon fontSize="small" color="action" />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Typography variant="caption" color="text.disabled">-</Typography>
                                )}
                            </TableCell>
                            <TableCell align="right">
                                <TableActions
                                    onEdit={() => onEdit?.(item)}
                                    onDelete={() => handleDelete(item.viajeIncidenteID)}
                                    disableEdit={viewOnly}
                                    disableDelete={viewOnly || deleteMutation.isPending}
                                    editTooltip="Editar incidente"
                                    deleteTooltip="Eliminar incidente"
                                />
                            </TableCell>
                        </>
                    );
                }}
            />
            <DocumentPreviewDialog 
                open={!!previewUrl}
                onClose={handleClosePreview}
                previewUrl={previewUrl}
            />
        </Box>
    );
}
