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
    EventNote as EventNoteIcon
} from '@mui/icons-material';
import { PERMISSIONS } from '@/shared/constants/permissions';

export interface MenuItem {
    text: string;
    path?: string;
    icon: React.ReactNode;
    children?: MenuItem[];
    permission?: string | string[]; // Permission code(s) required to view this item
    section?: string; // Section header text
}

export const SIDEBAR_MENU: MenuItem[] = [
    { 
        text: 'Dashboard', 
        path: '/app/dashboard', 
        icon: <DashboardIcon />,
        permission: PERMISSIONS.DASHBOARD.VER
    },
    {
        text: 'Portal del Empleado',
        icon: <BadgeIcon />,
        section: 'Autoservicio',
        children: [
            {
                text: 'Mis Viajes',
                path: '/app/mis-viajes',
                icon: <RouteIcon />,
                permission: [PERMISSIONS.EMPLOYEE.VIAJES.VER, PERMISSIONS.EMPLOYEE.VIAJES.GESTIONAR]
            },
            {
                text: 'Mis Pagos',
                path: '/app/mis-pagos',
                icon: <AccountBalanceWalletIcon />,
                permission: [PERMISSIONS.EMPLOYEE.PAGOS.VER, PERMISSIONS.EMPLOYEE.PAGOS.CONFIRMAR]
            },
            {
                text: 'Mis Licencias',
                path: '/app/mis-licencias',
                icon: <EventNoteIcon />,
                permission: [PERMISSIONS.EMPLOYEE.LICENCIAS.VER, PERMISSIONS.EMPLOYEE.LICENCIAS.SOLICITAR]
            },
            {
                text: 'Mis Documentos',
                path: '/app/mis-documentos',
                icon: <DescriptionIcon />,
                permission: [
                    PERMISSIONS.EMPLOYEE.DOCUMENTOS.VER,
                    PERMISSIONS.EMPLOYEE.DOCUMENTOS.SOLICITAR_ACTUALIZACION
                ]
            }
        ]
    },
    {
        text: 'Gestión Comercial',
        icon: <BusinessIcon />,
        children: [
            { 
                text: 'Clientes', 
                path: '/app/clientes', 
                icon: <GroupsIcon />,
                permission: PERMISSIONS.CLIENTES.VER
            },
            { 
                text: 'Cotizaciones', 
                path: '/app/cotizaciones', 
                icon: <LocalOfferIcon />,
                permission: PERMISSIONS.COTIZACIONES.VER
            },
            { 
                text: 'Facturas', 
                path: '/app/facturas', 
                icon: <ReceiptIcon />,
                permission: PERMISSIONS.FACTURAS.VER
            }
        ]
    },
    {
        text: 'Operaciones',
        icon: <LocalShippingIcon />,
        children: [
            { 
                text: 'Viajes', 
                path: '/app/viajes', 
                icon: <AltRouteIcon />,
                permission: PERMISSIONS.VIAJES.VER
            },
            { 
                text: 'Flota', 
                path: '/app/flotas', 
                icon: <LocalShippingIcon />,
                permission: PERMISSIONS.FLOTA.VER
            },
            { 
                text: 'Colaboradores', 
                path: '/app/colaboradores', 
                icon: <EngineeringIcon />,
                permission: PERMISSIONS.COLABORADORES.VER
            },
        ]
    },
    {
        text: 'Mantenimiento',
        icon: <BuildIcon />,
        children: [
            { 
                text: 'Registro', 
                path: '/app/mantenimientos', 
                icon: <BuildIcon />,
                permission: PERMISSIONS.MANTENIMIENTOS.VER
            },
        ]
    },
    {
        text: 'Catálogos',
        icon: <CategoryIcon />,
        children: [
            { 
                text: 'Tipos de Producto', 
                path: '/app/tipo-producto', 
                icon: <LocalOfferIcon />,
                permission: PERMISSIONS.CATALOGOS.TIPO_PRODUCTO.VER
            },
            { 
                text: 'Mercaderías', 
                path: '/app/mercaderia', 
                icon: <InventoryIcon />,
                permission: PERMISSIONS.CATALOGOS.MERCADERIA.VER
            },
            { 
                text: 'Gastos', 
                path: '/app/gasto', 
                icon: <AccountBalanceWalletIcon />,
                permission: PERMISSIONS.CATALOGOS.GASTO.VER
            },
        ]
    },
    {
        text: 'Sistema',
        icon: <SettingsIcon />,
        section: 'Administración',
        children: [
            { 
                text: 'Usuarios', 
                path: '/app/usuarios', 
                icon: <PeopleIcon />,
                permission: PERMISSIONS.SISTEMA.USUARIOS.VER
            },
            { 
                text: 'Roles Usuario', 
                path: '/app/roles-usuario', 
                icon: <AdminPanelSettingsIcon />,
                permission: PERMISSIONS.SISTEMA.ROLES.VER
            },
            { 
                text: 'Roles Colaborador', 
                path: '/app/roles-colaborador', 
                icon: <VpnKeyIcon />,
                permission: PERMISSIONS.SISTEMA.ROLES.VER 
            },
            { 
                text: 'Maestros', 
                path: '/app/maestros', 
                icon: <ListAltIcon />,
                permission: PERMISSIONS.SISTEMA.MAESTROS.VER
            },

        ]
    }
];
