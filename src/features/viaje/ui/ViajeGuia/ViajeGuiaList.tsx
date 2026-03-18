import { 
    Box, 
    IconButton, 
    Typography, 
    useTheme,
    alpha,
    Tooltip,
    CircularProgress,
    TableCell
} from '@mui/material';
import { 
    Person as PersonIcon,
    LocalShipping as LocalShippingIcon,
    Visibility as VisibilityIcon,
    ListAlt as ListAltIcon,
    DoNotDisturb as NoFileIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeGuia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { useViajeGuias, useDeleteViajeGuia } from '@/features/viaje/hooks/useViajeGuias';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import { buildInternalFileUrl } from '@/shared/config/env';

import { ViajeGuiaMobileList } from './Index';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    tiposGuia: SelectItem[];
    onEdit?: (item: ViajeGuia) => void;
}

export function ViajeGuiaList({ viajeId, viewOnly, tiposGuia, onEdit }: Props) {
    const theme = useTheme();

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Query & Mutations
    const { data, isLoading } = useViajeGuias(viajeId, page + 1, rowsPerPage);
    const deleteMutation = useDeleteViajeGuia();
    const guias = data?.items ?? [];

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleDelete = async (id: number) => {
        if (!viajeId) return;
        try {
            await deleteMutation.mutateAsync({ id, viajeId });
        } catch (error) {
            console.error("Error deleting guia:", error);
        }
    };

    const handlePreview = (path: string) => {
        const fullUrl = buildInternalFileUrl(path);
        setPreviewUrl(fullUrl || null);
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

    const columns: Column[] = [
        { id: 'tipo', label: 'Tipo de Guía' },
        { id: 'documento', label: 'Documento (Serie-N°)' },
        { id: 'evidencia', label: 'Evidencia', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListAltIcon color="action" />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Guías Registradas
                    </Typography>
                    {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Box>
                <Box sx={{ 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'text.secondary'
                }}>
                    <Typography variant="caption" fontWeight="bold">
                        Total: {data?.total ?? 0} registros
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <SharedTable
                    data={data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    columns={columns}
                    keyExtractor={(item) => item.viajeGuiaID}
                    emptyMessage="No hay guías registradas"
                    renderRow={(item) => {
                        const tipo = tiposGuia.find(t => t.id === item.tipoGuiaID);
                        const tipoText = tipo?.text || item.tipoGuia?.descripcion || 'Desconocido';
                        
                        return (
                            <>
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
                                    <TableActions
                                        onEdit={!viewOnly ? () => onEdit?.(item) : undefined}
                                        onDelete={!viewOnly ? () => handleDelete(item.viajeGuiaID) : undefined}
                                        editTooltip="Editar guía"
                                        deleteTooltip="Eliminar guía"
                                    />
                                </TableCell>
                            </>
                        );
                    }}
                />
            </Box>

            <ViajeGuiaMobileList
                items={guias}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                viewOnly={viewOnly}
                tiposGuia={tiposGuia}
                onEdit={onEdit}
                onDelete={handleDelete}
                onPreview={handlePreview}
            />
            
            <DocumentPreviewDialog 
                open={!!previewUrl}
                onClose={handleClosePreview}
                previewUrl={previewUrl}
            />
        </Box>
    );
}
