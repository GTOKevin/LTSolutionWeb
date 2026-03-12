import { useState } from 'react';
import { 
    Box, 
    Typography, 
    TableCell,
    CircularProgress,
    useTheme,
    alpha,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    VerifiedUser as PermitIcon,
    Visibility as VisibilityIcon,
    DoNotDisturb as NoFileIcon
} from '@mui/icons-material';
import type { ViajePermiso } from '@/entities/viaje/model/types';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';
import { useViajePermisos, useDeleteViajePermiso } from '@/features/viaje/hooks/useViajePermisos';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { formatDateShort } from '@/shared/utils/date-utils';

interface Props {
    viajeId: number;
    viewOnly?: boolean;
    onEdit?: (item: ViajePermiso) => void;
}

const API_URL = import.meta.env.VITE_IMG_URL_BASE || 'https://localhost:44332';

export function ViajePermisoList({ viajeId, viewOnly, onEdit }: Props) {
    const theme = useTheme();
    
    // Query & Mutations
    const { data: permisos = [], isLoading } = useViajePermisos(viajeId);
    const deleteMutation = useDeleteViajePermiso();

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
            console.error("Error deleting permiso:", error);
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

    // Client-side pagination
    const paginatedFields = permisos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const pagedData = {
        items: paginatedFields,
        total: permisos.length,
        page: page + 1,
        size: rowsPerPage,
        totalPages: Math.ceil(permisos.length / rowsPerPage)
    };

    const columns: Column[] = [
        { id: 'vigencia', label: 'Fecha Vigencia' },
        { id: 'vencimiento', label: 'Fecha Vencimiento' },
        { id: 'archivo', label: 'Archivo', align: 'center' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PermitIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Permisos Registrados
                    </Typography>
                    {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Box>
                <Box sx={{ 
                    px: 1.5, py: 0.5, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    Total: {permisos.length}
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
                keyExtractor={(item) => item.viajePermisoID}
                emptyMessage="No hay permisos registrados"
                renderRow={(item) => {
                    return (
                        <>
                            <TableCell>{formatDateShort(item.fechaVigencia)}</TableCell>
                            <TableCell>{item.fechaVencimiento ? formatDateShort(item.fechaVencimiento) : '-'}</TableCell>
                            <TableCell align="center">
                                {item.rutaArchivo ? (
                                    <Tooltip title="Ver Documento">
                                        <IconButton 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                            }}
                                            onClick={() => handlePreview(item.rutaArchivo!)}
                                        >
                                            <VisibilityIcon fontSize="small" color="primary" />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Sin archivo">
                                        <NoFileIcon fontSize="small" color="disabled" />
                                    </Tooltip>
                                )}
                            </TableCell>
                            <TableCell align="right">
                                <TableActions
                                    onEdit={() => onEdit?.(item)}
                                    onDelete={() => handleDelete(item.viajePermisoID)}
                                    disableEdit={viewOnly}
                                    disableDelete={viewOnly || deleteMutation.isPending}
                                    editTooltip="Editar permiso"
                                    deleteTooltip="Eliminar permiso"
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
