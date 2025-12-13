import { QueryProvider } from './query-provider';
import { RouterProvider } from './router-provider';
import { ThemeProvider } from './theme-provider';

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <QueryProvider>
                <RouterProvider />
                {children}
            </QueryProvider>
        </ThemeProvider>
    );
}
