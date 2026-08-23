import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    Groups as GroupsIcon,
    Receipt as ReceiptIcon,
    LocalShipping as LocalShippingIcon,
    AltRoute as AltRouteIcon,
    Engineering as EngineeringIcon,
    Build as BuildIcon,
    Settings as SettingsIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    People as PeopleIcon,
    VpnKey as VpnKeyIcon,
    ListAlt as ListAltIcon,
    Category as CategoryIcon,
    Inventory as InventoryIcon,
    LocalOffer as LocalOfferIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon,
    Badge as BadgeIcon,
    Description as DescriptionIcon,
    Route as RouteIcon,
    EventNote as EventNoteIcon,
    Menu as MenuIcon,
    Person as PersonIcon,
    FactCheck as FactCheckIcon,
} from '@mui/icons-material';
import {
    APP_PATHS,
    APP_ROUTE_SEGMENTS,
    buildAppCreatePath,
    buildAppDetailPath,
    buildAppViewPath,
} from '@shared/config/app-routes';
import { PERMISSIONS } from '@shared/constants/permissions';

export {
    APP_PATHS,
    APP_ROUTE_SEGMENTS,
    buildAppCreatePath,
    buildAppDetailPath,
    buildAppViewPath,
};

export type AppPermission = string | string[];

export interface AppNavigationItem {
    text: string;
    path?: string;
    icon: React.ReactNode;
    children?: AppNavigationItem[];
    permission?: AppPermission;
    requiresEmployee?: boolean;
    section?: string;
}

export interface AppRouteMeta {
    pathPrefix: string;
    title: string;
    sectionTitle: string;
    bottomNavContext?: 'admin' | 'portal';
}

export interface AppBottomNavItem {
    label: string;
    icon: React.ReactNode;
    path?: string;
    permission?: AppPermission;
    requiresEmployee?: boolean;
    context: 'admin' | 'portal';
    action?: 'toggle-sidebar';
}

export interface AppDefaultRoutePriorityItem {
    route: string;
    permission?: AppPermission;
    requiresEmployee?: boolean;
}

export const APP_DEFAULT_ROUTE_PRIORITY: AppDefaultRoutePriorityItem[] = [
    { route: APP_PATHS.dashboard, permission: PERMISSIONS.DASHBOARD.VER },
    {
        route: APP_PATHS.misViajes,
        requiresEmployee: true,
    },
    {
        route: APP_PATHS.misPagos,
        requiresEmployee: true,
    },
    {
        route: APP_PATHS.misLicencias,
        requiresEmployee: true,
    },
    {
        route: APP_PATHS.misDocumentos,
        requiresEmployee: true,
    },
    { route: APP_PATHS.clientes, permission: PERMISSIONS.CLIENTES.VER },
    { route: APP_PATHS.viajes, permission: PERMISSIONS.VIAJES.VER },
    { route: APP_PATHS.gasto, permission: PERMISSIONS.CATALOGOS.GASTO.VER },
    { route: APP_PATHS.flotas, permission: PERMISSIONS.FLOTA.VER },
    { route: APP_PATHS.colaboradores, permission: PERMISSIONS.COLABORADORES.VER },
];

export const APP_SIDEBAR_MENU: AppNavigationItem[] = [
    {
        text: 'Dashboard',
        path: APP_PATHS.dashboard,
        icon: <DashboardIcon />,
        permission: PERMISSIONS.DASHBOARD.VER,
    },
    {
        text: 'Portal del Empleado',
        icon: <BadgeIcon />,
        section: 'Autoservicio',
        requiresEmployee: true,
        children: [
            {
                text: 'Mis Viajes',
                path: APP_PATHS.misViajes,
                icon: <RouteIcon />,
                requiresEmployee: true,
            },
            {
                text: 'Mis Pagos',
                path: APP_PATHS.misPagos,
                icon: <AccountBalanceWalletIcon />,
                requiresEmployee: true,
            },
            {
                text: 'Mis Licencias',
                path: APP_PATHS.misLicencias,
                icon: <EventNoteIcon />,
                requiresEmployee: true,
            },
            {
                text: 'Mis Documentos',
                path: APP_PATHS.misDocumentos,
                icon: <DescriptionIcon />,
                requiresEmployee: true,
            },
        ],
    },
    {
        text: 'Gestión Comercial',
        icon: <BusinessIcon />,
        children: [
            {
                text: 'Clientes',
                path: APP_PATHS.clientes,
                icon: <GroupsIcon />,
                permission: PERMISSIONS.CLIENTES.VER,
            },
            {
                text: 'Facturas',
                path: APP_PATHS.facturas,
                icon: <ReceiptIcon />,
                permission: PERMISSIONS.FACTURAS.VER,
            },
        ],
    },
    {
        text: 'Operaciones',
        icon: <LocalShippingIcon />,
        children: [
            {
                text: 'Viajes',
                path: APP_PATHS.viajes,
                icon: <AltRouteIcon />,
                permission: PERMISSIONS.VIAJES.VER,
            },
            {
                text: 'Flota',
                path: APP_PATHS.flotas,
                icon: <LocalShippingIcon />,
                permission: PERMISSIONS.FLOTA.VER,
            },
        ],
    },
    {
        text: 'Recursos Humanos',
        icon: <BadgeIcon />,
        children: [
            {
                text: 'Colaboradores',
                path: APP_PATHS.colaboradores,
                icon: <EngineeringIcon />,
                permission: PERMISSIONS.COLABORADORES.VER,
            },
            {
                text: 'Solicitudes Documentos',
                path: APP_PATHS.colaboradorSolicitudesDocumentos,
                icon: <FactCheckIcon />,
                permission: PERMISSIONS.COLABORADORES.GESTIONAR_SOLICITUDES_DOCUMENTOS,
            },
            {
                text: 'Solicitudes Licencias',
                path: APP_PATHS.solicitudesLicencias,
                icon: <EventNoteIcon />,
                permission: PERMISSIONS.COLABORADORES.APROBAR_LICENCIAS,
            },
        ],
    },
    {
        text: 'Mantenimiento',
        icon: <BuildIcon />,
        children: [
            {
                text: 'Registro',
                path: APP_PATHS.mantenimientos,
                icon: <BuildIcon />,
                permission: PERMISSIONS.MANTENIMIENTOS.VER,
            },
        ],
    },
    {
        text: 'Catálogos',
        icon: <CategoryIcon />,
        children: [
            {
                text: 'Tipos de Producto',
                path: APP_PATHS.tipoProducto,
                icon: <LocalOfferIcon />,
                permission: PERMISSIONS.CATALOGOS.TIPO_PRODUCTO.VER,
            },
            {
                text: 'Mercaderías',
                path: APP_PATHS.mercaderia,
                icon: <InventoryIcon />,
                permission: PERMISSIONS.CATALOGOS.MERCADERIA.VER,
            },
            {
                text: 'Gastos',
                path: APP_PATHS.gasto,
                icon: <AccountBalanceWalletIcon />,
                permission: PERMISSIONS.CATALOGOS.GASTO.VER,
            },
        ],
    },
    {
        text: 'Sistema',
        icon: <SettingsIcon />,
        section: 'Administración',
        children: [
            {
                text: 'Usuarios',
                path: APP_PATHS.usuarios,
                icon: <PeopleIcon />,
                permission: PERMISSIONS.SISTEMA.USUARIOS.VER,
            },
            {
                text: 'Roles Usuario',
                path: APP_PATHS.rolesUsuario,
                icon: <AdminPanelSettingsIcon />,
                permission: PERMISSIONS.SISTEMA.ROLES.VER,
            },
            {
                text: 'Roles Colaborador',
                path: APP_PATHS.rolesColaborador,
                icon: <VpnKeyIcon />,
                permission: PERMISSIONS.SISTEMA.ROLES.VER,
            },
            {
                text: 'Maestros',
                path: APP_PATHS.maestros,
                icon: <ListAltIcon />,
                permission: PERMISSIONS.SISTEMA.MAESTROS.VER,
            },
        ],
    },
];

export const APP_ROUTE_META: AppRouteMeta[] = [
    { pathPrefix: APP_PATHS.dashboard, title: 'Dashboard', sectionTitle: 'Administración', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.profile, title: 'Perfil', sectionTitle: 'Portal del Empleado', bottomNavContext: 'portal' },
    { pathPrefix: APP_PATHS.misViajes, title: 'Mis Viajes', sectionTitle: 'Portal del Empleado', bottomNavContext: 'portal' },
    { pathPrefix: APP_PATHS.misPagos, title: 'Mis Pagos', sectionTitle: 'Portal del Empleado', bottomNavContext: 'portal' },
    { pathPrefix: APP_PATHS.misLicencias, title: 'Mis Licencias', sectionTitle: 'Portal del Empleado', bottomNavContext: 'portal' },
    { pathPrefix: APP_PATHS.misDocumentos, title: 'Mis Documentos', sectionTitle: 'Portal del Empleado', bottomNavContext: 'portal' },
    { pathPrefix: APP_PATHS.clientes, title: 'Gestión de Clientes', sectionTitle: 'Gestión Comercial', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.facturas, title: 'Gestión de Facturas', sectionTitle: 'Gestión Comercial', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.viajes, title: 'Gestión de Viajes', sectionTitle: 'Operaciones', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.flotas, title: 'Gestión de Flota', sectionTitle: 'Operaciones', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.colaboradores, title: 'Gestión de Colaboradores', sectionTitle: 'Recursos Humanos', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.colaboradorSolicitudesDocumentos, title: 'Solicitudes de Documentos', sectionTitle: 'Recursos Humanos', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.solicitudesLicencias, title: 'Solicitudes de Licencias', sectionTitle: 'Recursos Humanos', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.mantenimientos, title: 'Gestión de Mantenimientos', sectionTitle: 'Mantenimiento', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.usuarios, title: 'Gestión de Usuarios', sectionTitle: 'Sistema', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.rolesUsuario, title: 'Gestión de Roles', sectionTitle: 'Sistema', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.rolesColaborador, title: 'Gestión de Roles de Colaborador', sectionTitle: 'Sistema', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.maestros, title: 'Gestión de Maestros', sectionTitle: 'Sistema', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.gasto, title: 'Catálogo de Gastos', sectionTitle: 'Catálogos', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.mercaderia, title: 'Catálogo de Mercaderías', sectionTitle: 'Catálogos', bottomNavContext: 'admin' },
    { pathPrefix: APP_PATHS.tipoProducto, title: 'Tipos de Producto', sectionTitle: 'Catálogos', bottomNavContext: 'admin' },
];

export const APP_BOTTOM_NAV_ITEMS: AppBottomNavItem[] = [
    {
        label: 'Inicio',
        icon: <DashboardIcon />,
        path: APP_PATHS.dashboard,
        permission: PERMISSIONS.DASHBOARD.VER,
        context: 'admin',
    },
    {
        label: 'Clientes',
        icon: <GroupsIcon />,
        path: APP_PATHS.clientes,
        permission: PERMISSIONS.CLIENTES.VER,
        context: 'admin',
    },
    {
        label: 'Flota',
        icon: <LocalShippingIcon />,
        path: APP_PATHS.flotas,
        permission: PERMISSIONS.FLOTA.VER,
        context: 'admin',
    },
    {
        label: 'Menú',
        icon: <MenuIcon />,
        context: 'admin',
        action: 'toggle-sidebar',
    },
    {
        label: 'Viajes',
        icon: <RouteIcon />,
        path: APP_PATHS.misViajes,
        requiresEmployee: true,
        context: 'portal',
    },
    {
        label: 'Pagos',
        icon: <AccountBalanceWalletIcon />,
        path: APP_PATHS.misPagos,
        requiresEmployee: true,
        context: 'portal',
    },
    {
        label: 'Licencias',
        icon: <EventNoteIcon />,
        path: APP_PATHS.misLicencias,
        requiresEmployee: true,
        context: 'portal',
    },
    {
        label: 'Documentos',
        icon: <BadgeIcon />,
        path: APP_PATHS.misDocumentos,
        requiresEmployee: true,
        context: 'portal',
    },
    {
        label: 'Perfil',
        icon: <PersonIcon />,
        path: APP_PATHS.profile,
        context: 'portal',
    },
];

export function resolveAppRouteMeta(pathname: string): AppRouteMeta | undefined {
    return [...APP_ROUTE_META]
        .sort((current, next) => next.pathPrefix.length - current.pathPrefix.length)
        .find((route) => pathname === route.pathPrefix || pathname.startsWith(`${route.pathPrefix}/`));
}
