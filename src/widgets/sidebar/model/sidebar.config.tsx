import { 
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    Groups as GroupsIcon,
    Report as ReportIcon,
    Receipt as ReceiptIcon,
    LocalShipping as LocalShippingIcon,
    AltRoute as AltRouteIcon,
    Engineering as EngineeringIcon,
    Build as BuildIcon,
    Settings as SettingsIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    People as PeopleIcon,
    VpnKey as VpnKeyIcon,
    ListAlt as ListAltIcon
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
                icon: <ReportIcon />,
                permission: PERMISSIONS.COTIZACIONES.VER
            }, 
            { 
                text: 'Facturas', 
                path: '/app/facturas', 
                icon: <ReceiptIcon />,
                permission: PERMISSIONS.FACTURAS.VER
            },
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
                path: '/app/flota', 
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
