import {
    Box,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Person as PersonIcon,
    LocalShipping as LocalShippingIcon,
    ListAlt as ListAltIcon
} from '@mui/icons-material';
import type { ViajeGuia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { MobileListShell } from '../MobileListShell';

interface Props {
    items: ViajeGuia[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposGuia: SelectItem[];
    onEdit?: (item: ViajeGuia) => void;
    onDelete?: (id: number) => void;
    onPreview?: (path: string) => void;
}

export function ViajeGuiaMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposGuia, 
    onEdit, 
    onDelete,
    onPreview 
}: Props) {
    const theme = useTheme();

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
        <MobileListShell
            items={items}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            viewOnly={viewOnly}
            emptyMessage="No hay guías registradas"
            keyExtractor={(item) => item.viajeGuiaID}
            onEdit={onEdit}
            onDelete={onDelete ? (item) => onDelete(item.viajeGuiaID) : undefined}
            onPreview={onPreview ? (item) => item.rutaArchivo && onPreview(item.rutaArchivo) : undefined}
            renderHeader={(item) => {
                const tipo = tiposGuia.find(t => t.id === item.tipoGuiaID);
                const tipoText = tipo?.text || item.tipoGuia?.descripcion || 'Desconocido';
                return (
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
                );
            }}
            renderBody={(item) => (
                <>
                    <Typography variant="subtitle1" fontFamily="monospace" fontWeight="bold" sx={{ mb: 1 }}>
                        {item.serie}-{item.numero}
                    </Typography>

                    {item.rutaArchivo && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            p: 1,
                            borderRadius: 1,
                            cursor: 'pointer'
                        }} onClick={() => onPreview?.(item.rutaArchivo!)}>
                            <VisibilityIcon fontSize="small" />
                            <Typography variant="caption" fontWeight="bold">Ver Archivo Adjunto</Typography>
                        </Box>
                    )}
                </>
            )}
        />
    );
}