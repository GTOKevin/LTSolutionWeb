import { QueryProvider } from './query-provider';
import { RouterProvider } from './router-provider';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';
import { SessionExpiredModal } from '@/shared/components/ui/SessionExpiredModal';

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <QueryProvider>
                <AuthProvider>
                    <RouterProvider />
                    <SessionExpiredModal />
                    {children}
                </AuthProvider>
            </QueryProvider>
        </ThemeProvider>
    );
}
