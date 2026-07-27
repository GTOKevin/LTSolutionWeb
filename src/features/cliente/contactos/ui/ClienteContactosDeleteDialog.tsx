import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import type { ClienteContactosController } from '../hooks/useClienteContactosController';

interface ClienteContactosDeleteDialogProps {
    controller: ClienteContactosController;
}

export function ClienteContactosDeleteDialog({ controller }: ClienteContactosDeleteDialogProps) {
    const { contactoToDelete, deleteMutation, closeDeleteDialog, handleDeleteConfirm } = controller;

    return (
        <ConfirmDialog
            open={Boolean(contactoToDelete)}
            title="Eliminar Contacto"
            content={`¿Está seguro que desea eliminar a ${contactoToDelete?.nombreCompleto}?`}
            onClose={closeDeleteDialog}
            onConfirm={handleDeleteConfirm}
            isLoading={deleteMutation.isPending}
        />
    );
}
