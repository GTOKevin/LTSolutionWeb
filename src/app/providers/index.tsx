import { QueryProvider } from './query-provider';
import { RouterProvider } from './router-provider';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';
import { ToastProvider } from '@/shared/components/ui/Toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <QueryProvider>
                    <ToastProvider>
                        <AuthProvider>
                            <RouterProvider />
                            {children}
                        </AuthProvider>
                    </ToastProvider>
                </QueryProvider>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
