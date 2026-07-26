import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import { AppLayout } from '@widgets/layout';
import { useSignalR } from '@shared/hooks/useSignalR';
import { SessionExpiredModal } from '@shared/components/ui/SessionExpiredModal';
import { SelfChangePasswordModal } from '@features/auth/change-password';
import { useAuthStore } from '@shared/store/auth.store';
import { useLayoutStore } from '@shared/store/layout.store';
import { hasPermission } from '@shared/lib/permissions/hasPermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { useState } from 'react';
import {
    APP_BOTTOM_NAV_ITEMS,
    APP_PATHS,
    APP_SIDEBAR_MENU,
    buildAppCreatePath,
    resolveAppRouteMeta,
} from '@app/router/model/navigation';

export function AppShell() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const pageTitle = useLayoutStore((state) => state.pageTitle);
    const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

    useSignalR();

    const currentRoute = resolveAppRouteMeta(location.pathname);
    const routeTitle = currentRoute?.title ?? pageTitle ?? 'Dashboard';
    const routeSectionTitle = currentRoute?.sectionTitle ?? 'Administración';
    const bottomNavContext = currentRoute?.bottomNavContext ?? 'admin';
    const bottomNavItems = APP_BOTTOM_NAV_ITEMS.filter(
        (item) => item.context === bottomNavContext && hasPermission(user, item.permission),
    ).map((item) => ({
        label: item.label,
        icon: item.icon,
        path: item.path,
        onClick: item.action === 'toggle-sidebar' ? toggleSidebar : undefined,
    }));

    const bottomNavValue = bottomNavItems.findIndex(
        (item) => item.path && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)),
    );

    const canCreateClientes = hasPermission(user, PERMISSIONS.CLIENTES.GESTIONAR);

    const headerMobileAction = location.pathname === APP_PATHS.clientes && canCreateClientes
        ? {
            icon: <AddIcon />,
            onClick: () => navigate(buildAppCreatePath(APP_PATHS.clientes)),
        }
        : undefined;

    return (
        <>
            <SessionExpiredModal />
            <AppLayout
                title={routeTitle}
                sectionTitle={routeSectionTitle}
                sidebarMenu={APP_SIDEBAR_MENU}
                bottomNavItems={bottomNavItems}
                bottomNavValue={bottomNavValue}
                onRequestChangePassword={() => setChangePasswordOpen(true)}
                onBottomNavChange={(item) => {
                    if (item.path) {
                        navigate(item.path);
                        return;
                    }

                    item.onClick?.();
                }}
                headerMobileAction={headerMobileAction}
            >
                <Outlet />
            </AppLayout>
            <SelfChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
                usuarioNombre={user?.name ?? undefined}
                onSuccess={() => setChangePasswordOpen(false)}
            />
        </>
    );
}
