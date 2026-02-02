import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuthStore } from '@shared/store/auth.store';
import { ProtectedRoute } from '@shared/lib/guards/ProtectedRoute';
import { PublicRoute } from '@shared/lib/guards/PublicRoute';
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
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="clientes" element={<ClientesPage />} />
                        <Route path="flota" element={<FlotasPage />} />
                        <Route path="cotizaciones" element={<CotizacionesPage />} />
                        <Route path="colaboradores" element={<ColaboradoresPage />} />
                        <Route path="mantenimientos" element={<MantenimientosPage />} />
                        <Route path="usuarios" element={<UsuariosPage />} />
                        <Route path="roles-usuario" element={<RolesPage />} />
                        <Route path="roles-colaborador" element={<RolesColaboradorPage />} />
                        <Route path="maestros" element={<MaestrosPage />} />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<RootRedirect />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
