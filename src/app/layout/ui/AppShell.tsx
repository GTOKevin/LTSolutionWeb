import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import { AppLayout } from '@widgets/layout/ui/AppLayout';
import { useSignalR } from '@shared/hooks/useSignalR';
import { SessionExpiredModal } from '@shared/components/ui/SessionExpiredModal';
import { useAuthStore } from '@shared/store/auth.store';
import { useLayoutStore } from '@shared/store/layout.store';
import { hasPermission } from '@shared/lib/permissions/hasPermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import {
    APP_BOTTOM_NAV_ITEMS,
    APP_PATHS,
    APP_SIDEBAR_MENU,
    resolveAppRouteMeta,
} from '@app/router/model/navigation';

export function AppShell() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const pageTitle = useLayoutStore((state) => state.pageTitle);
    const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);

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
            onClick: () => window.dispatchEvent(new CustomEvent('open-create-client-modal')),
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
        </>
    );
}
