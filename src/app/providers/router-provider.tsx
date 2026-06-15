import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuthStore } from '@shared/store/auth.store';
import { ProtectedRoute } from '@shared/lib/guards/ProtectedRoute';
import { PublicRoute } from '@shared/lib/guards/PublicRoute';
import { PermissionGuard } from '@shared/lib/guards/PermissionGuard';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { AppLayout } from '@widgets/layout/ui/AppLayout';

// Lazy loaded pages
const LoginPage = lazy(() => import('@pages/login').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('@pages/dashboard').then(module => ({ default: module.DashboardPage })));
const PerfilPage = lazy(() => import('@pages/perfil').then(module => ({ default: module.PerfilPage })));
const ClientesPage = lazy(() => import('@pages/clientes').then(module => ({ default: module.ClientesPage })));
const ClienteNuevoPage = lazy(() => import('@pages/clientes/nuevo').then(module => ({ default: module.ClienteNuevoPage })));
const ClienteEditarPage = lazy(() => import('@pages/clientes/editar').then(module => ({ default: module.ClienteEditarPage })));
const FlotasPage = lazy(() => import('@pages/flotas').then(module => ({ default: module.FlotasPage })));
const FlotaNuevoPage = lazy(() => import('@pages/flotas/nuevo').then(module => ({ default: module.FlotaNuevoPage })));
const FlotaEditarPage = lazy(() => import('@pages/flotas/editar').then(module => ({ default: module.FlotaEditarPage })));
const FlotaVerPage = lazy(() => import('@pages/flotas/ver').then(module => ({ default: module.FlotaVerPage })));
const CotizacionesPage = lazy(() => import('@pages/cotizaciones').then(module => ({ default: module.CotizacionesPage })));
const HealthCheckPage = lazy(() => import('../../pages/health-check').then(module => ({ default: module.HealthCheckPage })));
const ForgotPasswordPage = lazy(() => import('@pages/forgot-password').then(module => ({ default: module.ForgotPasswordPage })));
const ColaboradoresPage = lazy(() => import('@/pages/colaboradores').then(module => ({ default: module.ColaboradoresPage })));
const ColaboradorNuevoPage = lazy(() => import('@/pages/colaboradores/nuevo').then(module => ({ default: module.ColaboradorNuevoPage })));
const ColaboradorEditarPage = lazy(() => import('@/pages/colaboradores/editar').then(module => ({ default: module.ColaboradorEditarPage })));
const ColaboradorVerPage = lazy(() => import('@/pages/colaboradores/ver').then(module => ({ default: module.ColaboradorVerPage })));
const MantenimientosPage = lazy(() => import('@/pages/mantenimientos').then(module => ({ default: module.MantenimientosPage })));
const MantenimientoNuevoPage = lazy(() => import('@/pages/mantenimientos/nuevo').then(module => ({ default: module.MantenimientoNuevoPage })));
const MantenimientoEditarPage = lazy(() => import('@/pages/mantenimientos/editar').then(module => ({ default: module.MantenimientoEditarPage })));
const MantenimientoVerPage = lazy(() => import('@/pages/mantenimientos/ver').then(module => ({ default: module.MantenimientoVerPage })));
const UsuariosPage = lazy(() => import('@/pages/usuarios').then(module => ({ default: module.UsuariosPage })));
const RolesPage = lazy(() => import('@/pages/roles').then(module => ({ default: module.RolesPage })));
const RolesColaboradorPage = lazy(() => import('@/pages/roles-colaborador').then(module => ({ default: module.RolesColaboradorPage })));
const MaestrosPage = lazy(() => import('@/pages/maestros').then(module => ({ default: module.MaestrosPage })));
const ViajesPage = lazy(() => import('@pages/viajes').then(module => ({ default: module.ViajesPage })));
const ViajeNuevoPage = lazy(() => import('@pages/viajes/nuevo').then(module => ({ default: module.ViajeNuevoPage })));
const ViajeEditarPage = lazy(() => import('@/pages/viajes/editar').then(module => ({ default: module.ViajeEditarPage })));
const FacturasPage = lazy(() => import('@/pages/facturas').then(module => ({ default: module.FacturasPage })));
const FacturaNuevaPage = lazy(() => import('@/pages/facturas/nuevo').then(module => ({ default: module.FacturaNuevaPage })));
const FacturaEditarPage = lazy(() => import('@/pages/facturas/editar').then(module => ({ default: module.FacturaEditarPage })));
const GastoPage = lazy(() => import('@/pages/gasto').then(module => ({ default: module.GastoPage })));
const MercaderiaPage = lazy(() => import('@/pages/mercaderia').then(module => ({ default: module.MercaderiaPage })));
const TipoProductoPage = lazy(() => import('@/pages/tipo-producto').then(module => ({ default: module.TipoProductoPage })));

function LoadingFallback() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
}

function RootRedirect() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />;
}

export function RouterProvider() {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<RootRedirect />} />

                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/forgot-password"
                        element={
                            <PublicRoute>
                                <ForgotPasswordPage />
                            </PublicRoute>
                        }
                    />

                    {/* Health check (for testing) */}
                    <Route path="/health" element={<HealthCheckPage />} />

                    {/* Protected routes with layout */}
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={
                            <PermissionGuard permission={PERMISSIONS.DASHBOARD.VER}>
                                <DashboardPage />
                            </PermissionGuard>
                        } />
                        <Route path="perfil" element={<PerfilPage />} />
                        <Route path="clientes" element={
                            <PermissionGuard permission={PERMISSIONS.CLIENTES.VER}>
                                <ClientesPage />
                            </PermissionGuard>
                        } />
                        <Route path="clientes/nuevo" element={
                            <PermissionGuard permission={PERMISSIONS.CLIENTES.GESTIONAR}>
                                <ClienteNuevoPage />
                            </PermissionGuard>
                        } />
                        <Route path="clientes/:id" element={
                            <PermissionGuard permission={PERMISSIONS.CLIENTES.GESTIONAR}>
                                <ClienteEditarPage />
                            </PermissionGuard>
                        } />
                        <Route path="viajes" element={
                            <PermissionGuard permission={PERMISSIONS.VIAJES.VER}>
                                <ViajesPage />
                            </PermissionGuard>
                        } />
                        <Route path="viajes/nuevo" element={
                            <PermissionGuard permission={PERMISSIONS.VIAJES.GESTIONAR}>
                                <ViajeNuevoPage />
                            </PermissionGuard>
                        } />
                        <Route path="viajes/:id" element={
                            <PermissionGuard permission={PERMISSIONS.VIAJES.GESTIONAR}>
                                <ViajeEditarPage />
                            </PermissionGuard>
                        } />
                        <Route path="facturas" element={
                            <PermissionGuard permission={PERMISSIONS.FACTURAS.VER}>
                                <FacturasPage />
                            </PermissionGuard>
                        } />
                        <Route path="facturas/nueva" element={
                            <PermissionGuard permission={PERMISSIONS.FACTURAS.GESTIONAR}>
                                <FacturaNuevaPage />
                            </PermissionGuard>
                        } />
                        <Route path="facturas/:id" element={
                            <PermissionGuard permission={PERMISSIONS.FACTURAS.GESTIONAR}>
                                <FacturaEditarPage />
                            </PermissionGuard>
                        } />
                        <Route path="flota" element={
                            <PermissionGuard permission={PERMISSIONS.FLOTA.VER}>
                                <FlotasPage />
                            </PermissionGuard>
                        } />
                        <Route path="flota/nuevo" element={
                            <PermissionGuard permission={PERMISSIONS.FLOTA.GESTIONAR}>
                                <FlotaNuevoPage />
                            </PermissionGuard>
                        } />
                        <Route path="flota/:id" element={
                            <PermissionGuard permission={PERMISSIONS.FLOTA.GESTIONAR}>
                                <FlotaEditarPage />
                            </PermissionGuard>
                        } />
                        <Route path="flota/:id/ver" element={
                            <PermissionGuard permission={PERMISSIONS.FLOTA.VER}>
                                <FlotaVerPage />
                            </PermissionGuard>
                        } />
                        <Route path="cotizaciones" element={
                            <PermissionGuard permission={PERMISSIONS.COTIZACIONES.VER}>
                                <CotizacionesPage />
                            </PermissionGuard>
                        } />
                        <Route path="colaboradores" element={
                            <PermissionGuard permission={PERMISSIONS.COLABORADORES.VER}>
                                <ColaboradoresPage />
                            </PermissionGuard>
                        } />
                        <Route path="colaboradores/nuevo" element={
                            <PermissionGuard permission={PERMISSIONS.COLABORADORES.GESTIONAR}>
                                <ColaboradorNuevoPage />
                            </PermissionGuard>
                        } />
                        <Route path="colaboradores/:id" element={
                            <PermissionGuard permission={PERMISSIONS.COLABORADORES.GESTIONAR}>
                                <ColaboradorEditarPage />
                            </PermissionGuard>
                        } />
                        <Route path="colaboradores/:id/ver" element={
                            <PermissionGuard permission={PERMISSIONS.COLABORADORES.VER}>
                                <ColaboradorVerPage />
                            </PermissionGuard>
                        } />
                        <Route path="mantenimientos" element={
                            <PermissionGuard permission={PERMISSIONS.MANTENIMIENTOS.VER}>
                                <MantenimientosPage />
                            </PermissionGuard>
                        } />
                        <Route path="mantenimientos/nuevo" element={
                            <PermissionGuard permission={PERMISSIONS.MANTENIMIENTOS.GESTIONAR}>
                                <MantenimientoNuevoPage />
                            </PermissionGuard>
                        } />
                        <Route path="mantenimientos/:id" element={
                            <PermissionGuard permission={PERMISSIONS.MANTENIMIENTOS.GESTIONAR}>
                                <MantenimientoEditarPage />
                            </PermissionGuard>
                        } />
                        <Route path="mantenimientos/:id/ver" element={
                            <PermissionGuard permission={PERMISSIONS.MANTENIMIENTOS.VER}>
                                <MantenimientoVerPage />
                            </PermissionGuard>
                        } />
                        <Route path="usuarios" element={
                            <PermissionGuard permission={PERMISSIONS.SISTEMA.USUARIOS.VER}>
                                <UsuariosPage />
                            </PermissionGuard>
                        } />
                        <Route path="roles-usuario" element={
                            <PermissionGuard permission={PERMISSIONS.SISTEMA.ROLES.VER}>
                                <RolesPage />
                            </PermissionGuard>
                        } />
                        <Route path="roles-colaborador" element={
                            <PermissionGuard permission={PERMISSIONS.SISTEMA.ROLES.VER}>
                                <RolesColaboradorPage />
                            </PermissionGuard>
                        } />
                        <Route path="maestros" element={
                            <PermissionGuard permission={PERMISSIONS.SISTEMA.MAESTROS.VER}>
                                <MaestrosPage />
                            </PermissionGuard>
                        } />
                        <Route path="gasto" element={
                            <PermissionGuard permission={PERMISSIONS.CATALOGOS.GASTO.VER}>
                                <GastoPage />
                            </PermissionGuard>
                        } />
                        <Route path="mercaderia" element={
                            <PermissionGuard permission={PERMISSIONS.CATALOGOS.MERCADERIA.VER}>
                                <MercaderiaPage />
                            </PermissionGuard>
                        } />
                        <Route path="tipo-producto" element={
                            <PermissionGuard permission={PERMISSIONS.CATALOGOS.TIPO_PRODUCTO.VER}>
                                <TipoProductoPage />
                            </PermissionGuard>
                        } />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<RootRedirect />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
