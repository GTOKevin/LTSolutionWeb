import { Box } from '@mui/material';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingModal } from '@shared/components/ui/LoadingModal';
import { CerrarViajeDialog } from '@features/viaje/ui/CerrarViajeDialog';
import { ViajesMobileList } from './ViajesMobileList';
import { ViajesTable } from './ViajesTable';
import { ViajeKanbanBoard } from './ViajeKanbanBoard';
import type { useViajesPageController } from '../hooks/useViajesPageController';

interface ViajesPageContentProps {
    controller: ReturnType<typeof useViajesPageController>;
}

export function ViajesPageContent({ controller }: ViajesPageContentProps) {
    const {
        viewMode,
        data,
        isLoading,
        kanbanColumns,
        canManageViajes,
        canReabrirViajes,
        canCerrarViajes,
        canViewViajes,
        page,
        rowsPerPage,
        handleChangePage,
        handleChangeRowsPerPage,
        handleEdit,
        handleView,
        handleDelete,
        handleReopen,
        handleCerrar,
        handleExportExcel,
        handleExportPdf,
        deleteDialogOpen,
        reopenDialogOpen,
        cerrarDialogOpen,
        viajeToDelete,
        viajeToReopen,
        viajeToCerrar,
        deleteMutation,
        reopenMutation,
        closeDeleteDialog,
        closeReopenDialog,
        closeCerrarDialog,
        loadingMessage,
    } = controller;

    return (
        <>
            {viewMode === 'kanban' ? (
                <ViajeKanbanBoard
                    viajes={data?.items || []}
                    columns={kanbanColumns}
                    isLoading={isLoading}
                    canManage={canManageViajes}
                    onViajeClick={handleView}
                    onViewViaje={canViewViajes ? handleView : undefined}
                    onEditViaje={canManageViajes ? handleEdit : undefined}
                    onDeleteViaje={canManageViajes ? handleDelete : undefined}
                />
            ) : (
                <>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <ViajesTable
                            data={data}
                            isLoading={isLoading}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            canManage={canManageViajes}
                            canReabrir={canReabrirViajes}
                            canCerrar={canCerrarViajes}
                            onEdit={canManageViajes ? handleEdit : undefined}
                            onView={canViewViajes ? handleView : undefined}
                            onDelete={canManageViajes ? handleDelete : undefined}
                            onExportExcel={canViewViajes ? handleExportExcel : undefined}
                            onExportPdf={canViewViajes ? handleExportPdf : undefined}
                            onReopen={canReabrirViajes ? handleReopen : undefined}
                            onCerrar={canCerrarViajes ? handleCerrar : undefined}
                        />
                    </Box>

                    <ViajesMobileList
                        data={data}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        canManage={canManageViajes}
                        canReabrir={canReabrirViajes}
                        canCerrar={canCerrarViajes}
                        onEdit={canManageViajes ? handleEdit : undefined}
                        onView={canViewViajes ? handleView : undefined}
                        onDelete={canManageViajes ? handleDelete : undefined}
                        onExportExcel={canViewViajes ? handleExportExcel : undefined}
                        onExportPdf={canViewViajes ? handleExportPdf : undefined}
                        onReopen={canReabrirViajes ? handleReopen : undefined}
                        onCerrar={canCerrarViajes ? handleCerrar : undefined}
                    />
                </>
            )}

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Eliminar Viaje"
                content={`¿Estás seguro de que deseas eliminar el viaje #${viajeToDelete?.viajeID}?`}
                onConfirm={() => viajeToDelete && deleteMutation.mutate(viajeToDelete.viajeID)}
                onClose={closeDeleteDialog}
            />

            <ConfirmDialog
                open={reopenDialogOpen}
                title="Reabrir Viaje"
                content={`¿Estás seguro de que deseas reabrir el viaje #${viajeToReopen?.viajeID}? Esto habilitará la edición nuevamente.`}
                onConfirm={() => viajeToReopen && reopenMutation.mutate(viajeToReopen.viajeID)}
                onClose={closeReopenDialog}
                isLoading={reopenMutation.isPending}
            />

            {viajeToCerrar ? (
                <CerrarViajeDialog
                    open={cerrarDialogOpen}
                    viajeID={viajeToCerrar.viajeID}
                    viajeCodigo={viajeToCerrar.codigo}
                    onClose={closeCerrarDialog}
                />
            ) : null}

            <LoadingModal open={!!loadingMessage} message={loadingMessage || ''} />
        </>
    );
}
