import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteLogApi } from '@entities/delete-log/api/delete-log.api';
import { auditLogApi } from '@entities/audit-log/api/audit-log.api';
import { sistemaMantenimientoApi } from '@entities/sistema-mantenimiento/api/sistema-mantenimiento.api';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useToast } from '@shared/components/ui/Toast';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useLayoutStore } from '@shared/store/layout.store';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { getErrorMessage } from '@shared/utils/api-errors';
import { logger } from '@shared/utils/logger';

export const DELETE_LOG_QUERY_KEY = ['delete-log'] as const;
export const AUDIT_LOG_QUERY_KEY = ['audit-log'] as const;
export const TEMP_FILES_QUERY_KEY = ['sistema-mantenimiento', 'temp'] as const;

export function useMantenimientoSistemaPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const canLimpiarLogs = usePermission(PERMISSIONS.SISTEMA.LOGS.LIMPIAR);
    const canLimpiarTemp = usePermission(PERMISSIONS.SISTEMA.TEMP.LIMPIAR);

    const [activeTab, setActiveTab] = useState(0);

    // DeleteLog list state
    const [deleteLogPage, setDeleteLogPage] = useState(0);
    const [deleteLogRowsPerPage, setDeleteLogRowsPerPage] = useState(10);
    const [deleteLogSearch, setDeleteLogSearch] = useState('');
    const deleteLogDebouncedSearch = useDebounce(deleteLogSearch, 500);

    // AuditLog list state
    const [auditLogPage, setAuditLogPage] = useState(0);
    const [auditLogRowsPerPage, setAuditLogRowsPerPage] = useState(10);
    const [auditLogSearch, setAuditLogSearch] = useState('');
    const auditLogDebouncedSearch = useDebounce(auditLogSearch, 500);

    // Dialog state
    const [purgeDeleteLogDialogOpen, setPurgeDeleteLogDialogOpen] = useState(false);
    const [purgeAuditLogDialogOpen, setPurgeAuditLogDialogOpen] = useState(false);
    const [cleanTempDialogOpen, setCleanTempDialogOpen] = useState(false);

    useEffect(() => {
        setPageTitle('Mantenimiento del Sistema');
    }, [setPageTitle]);

    const deleteLogQuery = useQuery({
        queryKey: [...DELETE_LOG_QUERY_KEY, deleteLogPage, deleteLogRowsPerPage, deleteLogDebouncedSearch],
        queryFn: () =>
            deleteLogApi.getAll({
                page: deleteLogPage + 1,
                size: deleteLogRowsPerPage,
                search: deleteLogDebouncedSearch || undefined,
            }),
    });

    const auditLogQuery = useQuery({
        queryKey: [...AUDIT_LOG_QUERY_KEY, auditLogPage, auditLogRowsPerPage, auditLogDebouncedSearch],
        queryFn: () =>
            auditLogApi.getAll({
                page: auditLogPage + 1,
                size: auditLogRowsPerPage,
                search: auditLogDebouncedSearch || undefined,
            }),
    });

    const tempInfoQuery = useQuery({
        queryKey: TEMP_FILES_QUERY_KEY,
        queryFn: () => sistemaMantenimientoApi.getTempInfo(),
    });

    const purgeDeleteLogMutation = useMutation({
        mutationFn: () => deleteLogApi.purge(),
        onSuccess: (result) => {
            setPurgeDeleteLogDialogOpen(false);
            void queryClient.invalidateQueries({ queryKey: DELETE_LOG_QUERY_KEY });
            showToast({
                message: `Se eliminaron ${result.eliminados} registros de DeleteLog.`,
                severity: 'success',
            });
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error, 'No se pudo limpiar los registros de DeleteLog.');
            showToast({ message, severity: 'error' });
            logger.error('Error purgando DeleteLog:', message);
        },
    });

    const purgeAuditLogMutation = useMutation({
        mutationFn: () => auditLogApi.purge(),
        onSuccess: (result) => {
            setPurgeAuditLogDialogOpen(false);
            void queryClient.invalidateQueries({ queryKey: AUDIT_LOG_QUERY_KEY });
            showToast({
                message: `Se eliminaron ${result.eliminados} registros de AuditLog.`,
                severity: 'success',
            });
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error, 'No se pudo limpiar los registros de AuditLog.');
            showToast({ message, severity: 'error' });
            logger.error('Error purgando AuditLog:', message);
        },
    });

    const cleanTempMutation = useMutation({
        mutationFn: () => sistemaMantenimientoApi.cleanTemp(),
        onSuccess: () => {
            setCleanTempDialogOpen(false);
            void queryClient.invalidateQueries({ queryKey: TEMP_FILES_QUERY_KEY });
            showToast({ message: 'Carpeta temporal limpiada correctamente.', severity: 'success' });
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error, 'No se pudo limpiar la carpeta temporal.');
            showToast({ message, severity: 'error' });
            logger.error('Error limpiando carpeta temporal:', message);
        },
    });

    const handleTabChange = (_event: unknown, value: number) => {
        setActiveTab(value);
    };

    const handleDeleteLogSearchChange = (value: string) => {
        setDeleteLogSearch(handleSanitizeSearchInput(value));
        setDeleteLogPage(0);
    };

    const handleDeleteLogPageChange = (_event: unknown, newPage: number) => {
        setDeleteLogPage(newPage);
    };

    const handleDeleteLogRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeleteLogRowsPerPage(parseInt(event.target.value, 10));
        setDeleteLogPage(0);
    };

    const handleAuditLogSearchChange = (value: string) => {
        setAuditLogSearch(handleSanitizeSearchInput(value));
        setAuditLogPage(0);
    };

    const handleAuditLogPageChange = (_event: unknown, newPage: number) => {
        setAuditLogPage(newPage);
    };

    const handleAuditLogRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAuditLogRowsPerPage(parseInt(event.target.value, 10));
        setAuditLogPage(0);
    };

    const handlePurgeDeleteLogClick = () => setPurgeDeleteLogDialogOpen(true);
    const handlePurgeAuditLogClick = () => setPurgeAuditLogDialogOpen(true);
    const handleCleanTempClick = () => setCleanTempDialogOpen(true);

    const handleConfirmPurgeDeleteLog = () => purgeDeleteLogMutation.mutate();
    const handleConfirmPurgeAuditLog = () => purgeAuditLogMutation.mutate();
    const handleConfirmCleanTemp = () => cleanTempMutation.mutate();

    const handleClosePurgeDeleteLog = () => setPurgeDeleteLogDialogOpen(false);
    const handleClosePurgeAuditLog = () => setPurgeAuditLogDialogOpen(false);
    const handleCloseCleanTemp = () => setCleanTempDialogOpen(false);

    return {
        activeTab,
        canLimpiarLogs,
        canLimpiarTemp,
        // DeleteLog
        deleteLogData: deleteLogQuery.data,
        deleteLogIsLoading: deleteLogQuery.isLoading,
        deleteLogPage,
        deleteLogRowsPerPage,
        deleteLogSearch,
        deleteLogTotal: deleteLogQuery.data?.total ?? 0,
        handleDeleteLogSearchChange,
        handleDeleteLogPageChange,
        handleDeleteLogRowsPerPageChange,
        // AuditLog
        auditLogData: auditLogQuery.data,
        auditLogIsLoading: auditLogQuery.isLoading,
        auditLogPage,
        auditLogRowsPerPage,
        auditLogSearch,
        auditLogTotal: auditLogQuery.data?.total ?? 0,
        handleAuditLogSearchChange,
        handleAuditLogPageChange,
        handleAuditLogRowsPerPageChange,
        // Temp
        tempInfo: tempInfoQuery.data,
        tempInfoIsLoading: tempInfoQuery.isLoading,
        // Dialogs + mutations
        purgeDeleteLogDialogOpen,
        purgeAuditLogDialogOpen,
        cleanTempDialogOpen,
        purgeDeleteLogMutation,
        purgeAuditLogMutation,
        cleanTempMutation,
        handleTabChange,
        handlePurgeDeleteLogClick,
        handlePurgeAuditLogClick,
        handleCleanTempClick,
        handleConfirmPurgeDeleteLog,
        handleConfirmPurgeAuditLog,
        handleConfirmCleanTemp,
        handleClosePurgeDeleteLog,
        handleClosePurgeAuditLog,
        handleCloseCleanTemp,
    };
}
