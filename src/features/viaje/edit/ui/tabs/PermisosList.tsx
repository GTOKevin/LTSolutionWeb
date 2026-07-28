import { Box, Typography, Grid, Paper, IconButton, CircularProgress, alpha, useTheme, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, Warning as WarningIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useViajePermisos, useDeleteViajePermiso } from '@/features/viaje/hooks/useViajePermisos';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { buildInternalFileUrl } from '@/shared/config/env';
import dayjs from 'dayjs';
import type { ViajePermiso } from '@/entities/viaje/model/types';

interface PermisosListProps {
    viajeId: number;
    isViewOnly?: boolean;
}

export function PermisosList({ viajeId, isViewOnly }: PermisosListProps) {
    const theme = useTheme();
    const { data: pagedData, isLoading } = useViajePermisos(viajeId, 1, 50);
    const deleteMutation = useDeleteViajePermiso();

    const permisos = useMemo(() => pagedData?.items ?? [], [pagedData?.items]);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<ViajePermiso | null>(null);

    const timelineStats = useMemo(() => {
        return permisos.reduce(
            (acc, item) => {
                if (!item.fechaVencimiento) {
                    acc.vigentes += 1;
                    return acc;
                }

                const diffDays = dayjs(item.fechaVencimiento).diff(dayjs(), 'day');
                if (diffDays < 0) {
                    acc.vencidos += 1;
                } else if (diffDays <= 2) {
                    acc.porVencer += 1;
                } else {
                    acc.vigentes += 1;
                }

                return acc;
            },
            { vencidos: 0, porVencer: 0, vigentes: 0 },
        );
    }, [permisos]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, item: ViajePermiso) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleDeleteClick = () => {
        if (selectedItem) {
            setDeleteId(selectedItem.viajePermisoID);
        }
        handleMenuClose();
    };

    const handleConfirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ viajeId, id: deleteId }, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getPermisoStatus = (fechaVencimiento: string | null) => {
        if (!fechaVencimiento) return { label: 'VIGENTE', color: 'success', bg: alpha(theme.palette.success.main, 0.1) };
        const diffDays = dayjs(fechaVencimiento).diff(dayjs(), 'day');

        if (diffDays < 0) {
            return { label: 'EXPIRADO', color: 'error', bg: alpha(theme.palette.error.main, 0.1), icon: true };
        }
        if (diffDays <= 2) {
            return { label: 'RENOVACIÓN REQUERIDA', color: 'warning', bg: alpha(theme.palette.warning.main, 0.1), icon: true };
        }
        return { label: 'VIGENTE', color: 'success', bg: alpha(theme.palette.success.main, 0.1) };
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: 'divider' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 3, display: 'block' }}>
                    Timeline de Vencimientos
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.08), border: `1px solid ${alpha(theme.palette.error.main, 0.16)}` }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                            Vencidos
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="error.main">
                            {timelineStats.vencidos}
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.16)}` }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                            Por vencer
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="warning.main">
                            {timelineStats.porVencer}
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.16)}` }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                            Vigentes
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="success.main">
                            {timelineStats.vigentes}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={2}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Documentación Activa
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" color="primary.main" sx={{ textTransform: 'uppercase' }}>
                        {permisos.length} Documentos
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {permisos.map((item) => {
                        const status = getPermisoStatus(item.fechaVencimiento);
                        const iconColor = status.color === 'error' ? 'error' : status.color === 'warning' ? 'warning' : 'success';

                        return (
                            <Grid size={{ xs: 12, md: 6 }} key={item.viajePermisoID}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        display: 'flex',
                                        gap: 2,
                                        borderColor: status.color === 'error'
                                            ? alpha(theme.palette.error.main, 0.5)
                                            : status.color === 'warning'
                                                ? alpha(theme.palette.warning.main, 0.5)
                                                : 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': { boxShadow: 2 },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 100,
                                            bgcolor: 'action.hover',
                                            borderRadius: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                            overflow: 'hidden',
                                            cursor: item.rutaArchivo ? 'pointer' : 'default',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onClick={() => item.rutaArchivo && setPreviewUrl(buildInternalFileUrl(item.rutaArchivo))}
                                    >
                                        {item.rutaArchivo ? (
                                            <img
                                                src={buildInternalFileUrl(item.rutaArchivo)}
                                                alt="Permiso"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: status.color === 'error' ? 'grayscale(1)' : 'none', opacity: status.color === 'error' ? 0.7 : 1 }}
                                            />
                                        ) : (
                                            <Typography variant="caption" color="text.disabled">Sin Doc</Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    bgcolor: status.bg,
                                                    color: `${status.color}.main`,
                                                    px: 1,
                                                    py: 0.25,
                                                    borderRadius: 1,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 900,
                                                    letterSpacing: -0.5,
                                                }}
                                            >
                                                {status.label}
                                            </Box>
                                            <IconButton size="small" onClick={(event) => handleMenuOpen(event, item)} sx={{ mt: -0.5, mr: -1 }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                                            Permiso N° {item.viajePermisoID}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                            Vigencia: {dayjs(item.fechaVigencia).format('DD/MM/YYYY')}
                                        </Typography>

                                        <Box mt="auto" display="flex" alignItems="center" gap={1}>
                                            {status.icon && <WarningIcon color={iconColor} sx={{ fontSize: 14 }} />}
                                            <Typography variant="caption" fontWeight="bold" color={`${status.color}.main`} sx={{ textTransform: 'uppercase' }}>
                                                {item.fechaVencimiento ? `Vence: ${dayjs(item.fechaVencimiento).format('DD MMM YYYY')}` : 'Sin Vencimiento'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                    {permisos.length === 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 3 }}>
                                <Typography color="text.secondary">No hay permisos registrados en este viaje.</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 150 } }}
            >
                {selectedItem?.rutaArchivo && (
                    <MenuItem onClick={() => {
                        window.open(buildInternalFileUrl(selectedItem.rutaArchivo!), '_blank');
                        handleMenuClose();
                    }}>
                        <DownloadIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        Descargar
                    </MenuItem>
                )}
                {!isViewOnly && (
                    <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
                        Eliminar
                    </MenuItem>
                )}
            </Menu>

            <ConfirmDialog
                open={!!deleteId}
                title="Eliminar Permiso"
                content="¿Estás seguro de que deseas eliminar este permiso? Esta acción no se puede deshacer."
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                severity="error"
                isLoading={deleteMutation.isPending}
            />

            <DocumentPreviewDialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} previewUrl={previewUrl} />
        </Box>
    );
}
