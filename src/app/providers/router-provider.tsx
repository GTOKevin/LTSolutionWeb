import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuthStore } from '@shared/store/auth.store';
import { ProtectedRoute } from '@shared/lib/guards/ProtectedRoute';
import { PublicRoute } from '@shared/lib/guards/PublicRoute';
import { PermissionGuard } from '@shared/lib/guards/PermissionGuard';
import { PERMISSIONS } from '@shared/constants/permissions';
import { AppShell } from '@app/layout/ui/AppShell';
import { env } from '@shared/config/env';
import { getDefaultAppRoute } from '@app/router/lib/default-app-route';
import { APP_PATHS, APP_ROUTE_SEGMENTS } from '@app/router/model/navigation';

// Lazy loaded pages
const LoginPage = lazy(() => import('@pages/login').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('@pages/dashboard').then(module => ({ default: module.DashboardPage })));
const PerfilPage = lazy(() => import('@pages/perfil').then(module => ({ default: module.PerfilPage })));
const ClientesPage = lazy(() => import('@pages/clientes').then(module => ({ default: module.ClientesPage })));
const ClienteNuevoPage = lazy(() => import('@pages/clientes/nuevo').then(module => ({ default: module.ClienteNuevoPage })));
const ClienteEditarPage = lazy(() => import('@pages/clientes/editar').then(module => ({ default: module.ClienteEditarPage })));
const ClienteVerPage = lazy(() => import('@pages/clientes/ver').then(module => ({ default: module.ClienteVerPage })));
const FlotasPage = lazy(() => import('@pages/flotas').then(module => ({ default: module.FlotasPage })));
const FlotaNuevoPage = lazy(() => import('@pages/flotas/nuevo').then(module => ({ default: module.FlotaNuevoPage })));
const FlotaEditarPage = lazy(() => import('@pages/flotas/editar').then(module => ({ default: module.FlotaEditarPage })));
const FlotaVerPage = lazy(() => import('@pages/flotas/ver').then(module => ({ default: module.FlotaVerPage })));
const HealthCheckPage = lazy(() => import('@pages/health-check').then(module => ({ default: module.HealthCheckPage })));
const ForgotPasswordPage = lazy(() => import('@pages/forgot-password').then(module => ({ default: module.ForgotPasswordPage })));
const ColaboradoresPage = lazy(() => import('@pages/colaboradores').then(module => ({ default: module.ColaboradoresPage })));
const ColaboradorNuevoPage = lazy(() => import('@pages/colaboradores/nuevo').then(module => ({ default: module.ColaboradorNuevoPage })));
const ColaboradorEditarPage = lazy(() => import('@pages/colaboradores/editar').then(module => ({ default: module.ColaboradorEditarPage })));
const ColaboradorVerPage = lazy(() => import('@pages/colaboradores/ver').then(module => ({ default: module.ColaboradorVerPage })));
const MantenimientosPage = lazy(() => import('@pages/mantenimientos').then(module => ({ default: module.MantenimientosPage })));
const MantenimientoNuevoPage = lazy(() => import('@pages/mantenimientos/nuevo').then(module => ({ default: module.MantenimientoNuevoPage })));
const MantenimientoEditarPage = lazy(() => import('@pages/mantenimientos/editar').then(module => ({ default: module.MantenimientoEditarPage })));
const MantenimientoVerPage = lazy(() => import('@pages/mantenimientos/ver').then(module => ({ default: module.MantenimientoVerPage })));
const UsuariosPage = lazy(() => import('@pages/usuarios').then(module => ({ default: module.UsuariosPage })));
const RolesPage = lazy(() => import('@pages/roles').then(module => ({ default: module.RolesPage })));
const RolesColaboradorPage = lazy(() => import('@pages/roles-colaborador').then(module => ({ default: module.RolesColaboradorPage })));
const MaestrosPage = lazy(() => import('@pages/maestros').then(module => ({ default: module.MaestrosPage })));
const ViajesPage = lazy(() => import('@pages/viajes').then(module => ({ default: module.ViajesPage })));
const ViajeNuevoPage = lazy(() => import('@pages/viajes/nuevo').then(module => ({ default: module.ViajeNuevoPage })));
const ViajeEditarPage = lazy(() => import('@pages/viajes/editar').then(module => ({ default: module.ViajeEditarPage })));
const ViajeVerPage = lazy(() => import('@pages/viajes/ver').then(module => ({ default: module.ViajeVerPage })));
const FacturasPage = lazy(() => import('@pages/facturas').then(module => ({ default: module.FacturasPage })));
const FacturaNuevaPage = lazy(() => import('@pages/facturas/nuevo').then(module => ({ default: module.FacturaNuevaPage })));
const FacturaEditarPage = lazy(() => import('@pages/facturas/editar').then(module => ({ default: module.FacturaEditarPage })));
const FacturaVerPage = lazy(() => import('@pages/facturas/ver').then(module => ({ default: module.FacturaVerPage })));
const GastoPage = lazy(() => import('@pages/gasto').then(module => ({ default: module.GastoPage })));
const MercaderiaPage = lazy(() => import('@pages/mercaderia').then(module => ({ default: module.MercaderiaPage })));
const TipoProductoPage = lazy(() => import('@pages/tipo-producto').then(module => ({ default: module.TipoProductoPage })));
const MisViajesPage = lazy(() => import('@pages/mis-viajes').then(module => ({ default: module.MisViajesPage })));
const MisViajesDetallePage = lazy(() => import('@pages/mis-viajes/detalle').then(module => ({ default: module.MisViajesDetallePage })));
const MisPagosPage = lazy(() => import('@pages/mis-pagos').then(module => ({ default: module.MisPagosPage })));
const MisLicenciasPage = lazy(() => import('@pages/mis-licencias').then(module => ({ default: module.MisLicenciasPage })));
const MisDocumentosPage = lazy(() => import('@pages/mis-documentos').then(module => ({ default: module.MisDocumentosPage })));

function LoadingFallback() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
}

function RootRedirect() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    return <Navigate to={isAuthenticated ? getDefaultAppRoute(user) : APP_PATHS.login} replace />;
}

function AppIndexRedirect() {
    const user = useAuthStore((state) => state.user);
    return <Navigate to={getDefaultAppRoute(user)} replace />;
}

interface GuardedAppRoute {
    path: string;
    permission: string | string[];
    element: ReactNode;
}

const GUARDED_APP_ROUTES: GuardedAppRoute[] = [
    { path: APP_ROUTE_SEGMENTS.dashboard, permission: PERMISSIONS.DASHBOARD.VER, element: <DashboardPage /> },
    { path: APP_ROUTE_SEGMENTS.misPagos, permission: PERMISSIONS.EMPLOYEE.PAGOS.VER, element: <MisPagosPage /> },
    { path: APP_ROUTE_SEGMENTS.misLicencias, permission: PERMISSIONS.EMPLOYEE.LICENCIAS.VER, element: <MisLicenciasPage /> },
    {
        path: APP_ROUTE_SEGMENTS.misDocumentos,
        permission: PERMISSIONS.EMPLOYEE.DOCUMENTOS.VER,
        element: <MisDocumentosPage />,
    },
    { path: APP_ROUTE_SEGMENTS.clientes, permission: PERMISSIONS.CLIENTES.VER, element: <ClientesPage /> },
    { path: `${APP_ROUTE_SEGMENTS.clientes}/nuevo`, permission: PERMISSIONS.CLIENTES.GESTIONAR, element: <ClienteNuevoPage /> },
    { path: `${APP_ROUTE_SEGMENTS.clientes}/:id`, permission: PERMISSIONS.CLIENTES.GESTIONAR, element: <ClienteEditarPage /> },
    { path: `${APP_ROUTE_SEGMENTS.clientes}/:id/ver`, permission: PERMISSIONS.CLIENTES.VER, element: <ClienteVerPage /> },
    { path: APP_ROUTE_SEGMENTS.viajes, permission: PERMISSIONS.VIAJES.VER, element: <ViajesPage /> },
    { path: `${APP_ROUTE_SEGMENTS.viajes}/nuevo`, permission: PERMISSIONS.VIAJES.GESTIONAR, element: <ViajeNuevoPage /> },
    { path: `${APP_ROUTE_SEGMENTS.viajes}/:id`, permission: PERMISSIONS.VIAJES.GESTIONAR, element: <ViajeEditarPage /> },
    { path: `${APP_ROUTE_SEGMENTS.viajes}/:id/ver`, permission: PERMISSIONS.VIAJES.VER, element: <ViajeVerPage /> },
    { path: APP_ROUTE_SEGMENTS.facturas, permission: PERMISSIONS.FACTURAS.VER, element: <FacturasPage /> },
    { path: `${APP_ROUTE_SEGMENTS.facturas}/nuevo`, permission: PERMISSIONS.FACTURAS.GESTIONAR, element: <FacturaNuevaPage /> },
    { path: `${APP_ROUTE_SEGMENTS.facturas}/:id`, permission: PERMISSIONS.FACTURAS.GESTIONAR, element: <FacturaEditarPage /> },
    { path: `${APP_ROUTE_SEGMENTS.facturas}/:id/ver`, permission: PERMISSIONS.FACTURAS.VER, element: <FacturaVerPage /> },
    { path: APP_ROUTE_SEGMENTS.flotas, permission: PERMISSIONS.FLOTA.VER, element: <FlotasPage /> },
    { path: `${APP_ROUTE_SEGMENTS.flotas}/nuevo`, permission: PERMISSIONS.FLOTA.GESTIONAR, element: <FlotaNuevoPage /> },
    { path: `${APP_ROUTE_SEGMENTS.flotas}/:id`, permission: PERMISSIONS.FLOTA.GESTIONAR, element: <FlotaEditarPage /> },
    { path: `${APP_ROUTE_SEGMENTS.flotas}/:id/ver`, permission: PERMISSIONS.FLOTA.VER, element: <FlotaVerPage /> },
    { path: APP_ROUTE_SEGMENTS.colaboradores, permission: PERMISSIONS.COLABORADORES.VER, element: <ColaboradoresPage /> },
    { path: `${APP_ROUTE_SEGMENTS.colaboradores}/nuevo`, permission: PERMISSIONS.COLABORADORES.GESTIONAR, element: <ColaboradorNuevoPage /> },
    { path: `${APP_ROUTE_SEGMENTS.colaboradores}/:id`, permission: PERMISSIONS.COLABORADORES.GESTIONAR, element: <ColaboradorEditarPage /> },
    { path: `${APP_ROUTE_SEGMENTS.colaboradores}/:id/ver`, permission: PERMISSIONS.COLABORADORES.VER, element: <ColaboradorVerPage /> },
    { path: APP_ROUTE_SEGMENTS.mantenimientos, permission: PERMISSIONS.MANTENIMIENTOS.VER, element: <MantenimientosPage /> },
    { path: `${APP_ROUTE_SEGMENTS.mantenimientos}/nuevo`, permission: PERMISSIONS.MANTENIMIENTOS.GESTIONAR, element: <MantenimientoNuevoPage /> },
    { path: `${APP_ROUTE_SEGMENTS.mantenimientos}/:id`, permission: PERMISSIONS.MANTENIMIENTOS.GESTIONAR, element: <MantenimientoEditarPage /> },
    { path: `${APP_ROUTE_SEGMENTS.mantenimientos}/:id/ver`, permission: PERMISSIONS.MANTENIMIENTOS.VER, element: <MantenimientoVerPage /> },
    { path: APP_ROUTE_SEGMENTS.usuarios, permission: PERMISSIONS.SISTEMA.USUARIOS.VER, element: <UsuariosPage /> },
    { path: APP_ROUTE_SEGMENTS.rolesUsuario, permission: PERMISSIONS.SISTEMA.ROLES.VER, element: <RolesPage /> },
    { path: APP_ROUTE_SEGMENTS.rolesColaborador, permission: PERMISSIONS.SISTEMA.ROLES.VER, element: <RolesColaboradorPage /> },
    { path: APP_ROUTE_SEGMENTS.maestros, permission: PERMISSIONS.SISTEMA.MAESTROS.VER, element: <MaestrosPage /> },
    { path: APP_ROUTE_SEGMENTS.gasto, permission: PERMISSIONS.CATALOGOS.GASTO.VER, element: <GastoPage /> },
    { path: APP_ROUTE_SEGMENTS.mercaderia, permission: PERMISSIONS.CATALOGOS.MERCADERIA.VER, element: <MercaderiaPage /> },
    { path: APP_ROUTE_SEGMENTS.tipoProducto, permission: PERMISSIONS.CATALOGOS.TIPO_PRODUCTO.VER, element: <TipoProductoPage /> },
];

export function RouterProvider() {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path={APP_PATHS.root} element={<RootRedirect />} />

                    <Route
                        path={APP_PATHS.login}
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path={APP_PATHS.forgotPassword}
                        element={
                            <PublicRoute>
                                <ForgotPasswordPage />
                            </PublicRoute>
                        }
                    />

                    {env.isDev ? <Route path="/health" element={<HealthCheckPage />} /> : null}

                    {/* Protected routes with layout */}
                    <Route
                        path={APP_PATHS.appRoot}
                        element={
                            <ProtectedRoute>
                                <AppShell />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AppIndexRedirect />} />
                        <Route path={APP_ROUTE_SEGMENTS.misViajes}>
                            <Route index element={
                                <PermissionGuard
                                    permission={PERMISSIONS.EMPLOYEE.VIAJES.VER}
                                >
                                    <MisViajesPage />
                                </PermissionGuard>
                            } />
                            <Route path=":id" element={
                                <PermissionGuard
                                    permission={PERMISSIONS.EMPLOYEE.VIAJES.VER}
                                >
                                    <MisViajesDetallePage />
                                </PermissionGuard>
                            } />
                        </Route>
                        <Route path={APP_ROUTE_SEGMENTS.profile} element={<PerfilPage />} />
                        {GUARDED_APP_ROUTES.map((route) => (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={<PermissionGuard permission={route.permission}>{route.element}</PermissionGuard>}
                            />
                        ))}
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<RootRedirect />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
