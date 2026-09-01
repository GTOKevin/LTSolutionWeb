import {
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Grid,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    DeleteSweep as DeleteSweepIcon,
    FolderDelete as FolderDeleteIcon,
    InsertDriveFile as InsertDriveFileIcon,
    Storage as StorageIcon,
} from '@mui/icons-material';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { TabPanel } from '@shared/components/ui/TabPanel';
import { StatsCard } from '@shared/components/ui/StatsCard';
import { DeleteLogTable } from './DeleteLogTable';
import { AuditLogTable } from './AuditLogTable';
import type { useMantenimientoSistemaPageController } from '../../hooks/useMantenimientoSistemaPageController';

interface MantenimientoSistemaPageContentProps {
    controller: ReturnType<typeof useMantenimientoSistemaPageController>;
}

interface LogToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    purgeButtonLabel: string;
    purgeDisabled: boolean;
    purgeLoading: boolean;
    onPurge: () => void;
    canPurge: boolean;
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function LogToolbar({
    searchTerm,
    onSearchChange,
    searchPlaceholder,
    purgeButtonLabel,
    purgeDisabled,
    purgeLoading,
    onPurge,
    canPurge,
}: LogToolbarProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 2,
            }}
        >
            <Box sx={{ flex: 1, maxWidth: '400px' }}>
                <TextField
                    placeholder={searchPlaceholder}
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 },
                    }}
                />
            </Box>
            {canPurge ? (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteSweepIcon />}
                    onClick={onPurge}
                    disabled={purgeDisabled}
                    loading={purgeLoading}
                    sx={{ boxShadow: 2, fontWeight: 'bold', px: 3, py: 1, borderRadius: 2 }}
                >
                    {purgeButtonLabel}
                </Button>
            ) : null}
        </Box>
    );
}

export function MantenimientoSistemaPageContent({
    controller,
}: MantenimientoSistemaPageContentProps) {
    const theme = useTheme();

    const purgeDeleteLogDisabled =
        controller.deleteLogTotal === 0 || controller.purgeDeleteLogMutation.isPending;
    const purgeAuditLogDisabled =
        controller.auditLogTotal === 0 || controller.purgeAuditLogMutation.isPending;
    const cleanTempDisabled =
        (controller.tempInfo?.totalArchivos ?? 0) === 0 || controller.cleanTempMutation.isPending;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 } }}>
            <Box
                sx={{
                    maxWidth: 1600,
                    mx: 'auto',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Mantenimiento del Sistema
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra los logs de eliminación, auditoría y archivos temporales
                    </Typography>
                </Box>

                <Box
                    sx={{
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[1],
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            px: { xs: 2, md: 3 },
                        }}
                    >
                        <Tabs
                            value={controller.activeTab}
                            onChange={controller.handleTabChange}
                            textColor="primary"
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="DeleteLog" />
                            <Tab label="AuditLogs" />
                            <Tab label="Archivos Temporales" />
                        </Tabs>
                    </Box>

                    <Box sx={{ px: { xs: 2, md: 3 } }}>
                        <TabPanel value={controller.activeTab} index={0} name="mantenimiento-sistema">
                            <LogToolbar
                                searchTerm={controller.deleteLogSearch}
                                onSearchChange={controller.handleDeleteLogSearchChange}
                                searchPlaceholder="Buscar por entidad o datos..."
                                purgeButtonLabel="Limpiar registros (15+ días)"
                                purgeDisabled={purgeDeleteLogDisabled}
                                purgeLoading={controller.purgeDeleteLogMutation.isPending}
                                onPurge={controller.handlePurgeDeleteLogClick}
                                canPurge={controller.canLimpiarLogs}
                            />
                            <DeleteLogTable
                                data={controller.deleteLogData}
                                isLoading={controller.deleteLogIsLoading}
                                page={controller.deleteLogPage}
                                rowsPerPage={controller.deleteLogRowsPerPage}
                                onPageChange={controller.handleDeleteLogPageChange}
                                onRowsPerPageChange={controller.handleDeleteLogRowsPerPageChange}
                            />
                        </TabPanel>

                        <TabPanel value={controller.activeTab} index={1} name="mantenimiento-sistema">
                            <LogToolbar
                                searchTerm={controller.auditLogSearch}
                                onSearchChange={controller.handleAuditLogSearchChange}
                                searchPlaceholder="Buscar por tabla, acción o usuario..."
                                purgeButtonLabel="Limpiar registros (15+ días)"
                                purgeDisabled={purgeAuditLogDisabled}
                                purgeLoading={controller.purgeAuditLogMutation.isPending}
                                onPurge={controller.handlePurgeAuditLogClick}
                                canPurge={controller.canLimpiarLogs}
                            />
                            <AuditLogTable
                                data={controller.auditLogData}
                                isLoading={controller.auditLogIsLoading}
                                page={controller.auditLogPage}
                                rowsPerPage={controller.auditLogRowsPerPage}
                                onPageChange={controller.handleAuditLogPageChange}
                                onRowsPerPageChange={controller.handleAuditLogRowsPerPageChange}
                            />
                        </TabPanel>

                        <TabPanel value={controller.activeTab} index={2} name="mantenimiento-sistema">
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <StatsCard
                                        title="Archivos temporales"
                                        value={
                                            controller.tempInfoIsLoading
                                                ? '-'
                                                : (controller.tempInfo?.totalArchivos ?? 0)
                                        }
                                        icon={<InsertDriveFileIcon />}
                                        color={theme.palette.primary.main}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <StatsCard
                                        title="Tamaño total"
                                        value={
                                            controller.tempInfoIsLoading
                                                ? '-'
                                                : formatBytes(controller.tempInfo?.tamanoBytes ?? 0)
                                        }
                                        icon={<StorageIcon />}
                                        color={theme.palette.secondary.main}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                {controller.canLimpiarTemp ? (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<FolderDeleteIcon />}
                                        onClick={controller.handleCleanTempClick}
                                        disabled={cleanTempDisabled}
                                        loading={controller.cleanTempMutation.isPending}
                                        sx={{ boxShadow: 2, fontWeight: 'bold', px: 3, py: 1.2, borderRadius: 2 }}
                                    >
                                        Limpiar carpeta temp
                                    </Button>
                                ) : null}
                            </Box>
                        </TabPanel>
                    </Box>
                </Box>
            </Box>

            {controller.canLimpiarLogs ? (
                <>
                    <ConfirmDialog
                        open={controller.purgeDeleteLogDialogOpen}
                        title="Limpiar registros de DeleteLog"
                        content="Esta acción eliminará de forma permanente e irreversible todos los registros de eliminación con más de 15 días de antigüedad. ¿Deseas continuar?"
                        onConfirm={controller.handleConfirmPurgeDeleteLog}
                        onClose={controller.handleClosePurgeDeleteLog}
                        confirmText="Limpiar registros"
                        cancelText="Cancelar"
                        severity="error"
                        isLoading={controller.purgeDeleteLogMutation.isPending}
                    />
                    <ConfirmDialog
                        open={controller.purgeAuditLogDialogOpen}
                        title="Limpiar registros de AuditLog"
                        content="Esta acción eliminará de forma permanente e irreversible todos los registros de auditoría con más de 15 días de antigüedad. ¿Deseas continuar?"
                        onConfirm={controller.handleConfirmPurgeAuditLog}
                        onClose={controller.handleClosePurgeAuditLog}
                        confirmText="Limpiar registros"
                        cancelText="Cancelar"
                        severity="error"
                        isLoading={controller.purgeAuditLogMutation.isPending}
                    />
                </>
            ) : null}

            {controller.canLimpiarTemp ? (
                <ConfirmDialog
                    open={controller.cleanTempDialogOpen}
                    title="Limpiar carpeta temporal"
                    content="Esta acción eliminará de forma permanente e irreversible todos los archivos temporales del sistema. ¿Deseas continuar?"
                    onConfirm={controller.handleConfirmCleanTemp}
                    onClose={controller.handleCloseCleanTemp}
                    confirmText="Limpiar carpeta temp"
                    cancelText="Cancelar"
                    severity="error"
                    isLoading={controller.cleanTempMutation.isPending}
                />
            ) : null}
        </Box>
    );
}
