import { QueryProvider } from './query-provider';
import { RouterProvider } from './router-provider';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';
import { SessionExpiredModal } from '@/shared/components/ui/SessionExpiredModal';
import { ToastProvider } from '@/shared/components/ui/Toast';

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <QueryProvider>
                <ToastProvider>
                    <AuthProvider>
                        <RouterProvider />
                        <SessionExpiredModal />
                        {children}
                    </AuthProvider>
                </ToastProvider>
            </QueryProvider>
        </ThemeProvider>
    );
}
