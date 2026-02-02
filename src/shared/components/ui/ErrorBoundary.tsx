import { Component, type ErrorInfo,type ReactNode } from 'react';

import { Typography, Button, Container, Paper } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm" sx={{ 
                    height: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <WarningIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Algo salió mal
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Ha ocurrido un error inesperado en la aplicación. Por favor, intente recargar la página.
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={this.handleReload}
                            size="large"
                        >
                            Recargar Página
                        </Button>
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}
