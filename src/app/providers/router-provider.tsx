import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@shared/store/auth.store';
import { ProtectedRoute } from '@shared/lib/guards/ProtectedRoute';
import { PublicRoute } from '@shared/lib/guards/PublicRoute';
import { AppLayout } from '@widgets/layout/ui/AppLayout';
import { LoginPage } from '@pages/login';
import { DashboardPage } from '@pages/dashboard';
import { ClientesPage } from '@pages/clientes';
import { FlotasPage } from '@pages/flotas';
import { CotizacionesPage } from '@pages/cotizaciones';
import { HealthCheckPage } from '../../pages/health-check';
import { ForgotPasswordPage } from '@pages/forgot-password';
import { ColaboradoresPage } from '@/pages/colaboradores';
import { MantenimientosPage } from '@/pages/mantenimientos';
import { UsuariosPage } from '@/pages/usuarios';
// import { UsuariosPage } from '@/pages/usuarios';


function RootRedirect() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />;
}

export function RouterProvider() {
    return (
        <BrowserRouter>
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
                </Route>

                {/* Catch all */}
                <Route path="*" element={<RootRedirect />} />
            </Routes>
        </BrowserRouter>
    );
}
