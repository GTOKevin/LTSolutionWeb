import { useState } from 'react';
import { useProfilePageController } from '@features/profile';
import { SelfChangePasswordModal } from '@features/auth/change-password';
import { ProfileView } from '@widgets/profile';

export function PerfilPage() {
    const controller = useProfilePageController();
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

    return (
        <>
            <ProfileView
                data={controller.data}
                isLoading={controller.isLoading}
                isFetching={controller.isFetching}
                isError={controller.isError}
                onOpenChangePassword={() => setChangePasswordOpen(true)}
                onRetry={() => {
                    void controller.refetch();
                }}
            />
            <SelfChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
                usuarioNombre={controller.data?.colaborador?.nombreCompleto ?? controller.data?.usuario.nombreUsuario}
                onSuccess={() => setChangePasswordOpen(false)}
            />
        </>
    );
}
