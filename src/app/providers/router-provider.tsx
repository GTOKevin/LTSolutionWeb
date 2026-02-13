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
const ClientesPage = lazy(() => import('@pages/clientes').then(module => ({ default: module.ClientesPage })));
const FlotasPage = lazy(() => import('@pages/flotas').then(module => ({ default: module.FlotasPage })));
const CotizacionesPage = lazy(() => import('@pages/cotizaciones').then(module => ({ default: module.CotizacionesPage })));
const HealthCheckPage = lazy(() => import('../../pages/health-check').then(module => ({ default: module.HealthCheckPage })));
const ForgotPasswordPage = lazy(() => import('@pages/forgot-password').then(module => ({ default: module.ForgotPasswordPage })));
const ColaboradoresPage = lazy(() => import('@/pages/colaboradores').then(module => ({ default: module.ColaboradoresPage })));
const MantenimientosPage = lazy(() => import('@/pages/mantenimientos').then(module => ({ default: module.MantenimientosPage })));
const UsuariosPage = lazy(() => import('@/pages/usuarios').then(module => ({ default: module.UsuariosPage })));
const RolesPage = lazy(() => import('@/pages/roles').then(module => ({ default: module.RolesPage })));
const RolesColaboradorPage = lazy(() => import('@/pages/roles-colaborador').then(module => ({ default: module.RolesColaboradorPage })));
const MaestrosPage = lazy(() => import('@/pages/maestros').then(module => ({ default: module.MaestrosPage })));

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
                    {/* Root redirect based on auth status */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* Public routes */}
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
                        <Route path="clientes" element={
                            <PermissionGuard permission={PERMISSIONS.CLIENTES.VER}>
                                <ClientesPage />
                            </PermissionGuard>
                        } />
                        <Route path="flota" element={
                            <PermissionGuard permission={PERMISSIONS.FLOTA.VER}>
                                <FlotasPage />
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
                        <Route path="mantenimientos" element={
                            <PermissionGuard permission={PERMISSIONS.MANTENIMIENTOS.VER}>
                                <MantenimientosPage />
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
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<RootRedirect />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
