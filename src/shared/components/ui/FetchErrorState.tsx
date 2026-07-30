import { Alert, Button } from '@mui/material';

interface FetchErrorStateProps {
    message: string;
    onRetry: () => void | Promise<unknown>;
    retryLabel?: string;
}

export function FetchErrorState({
    message,
    onRetry,
    retryLabel = 'Reintentar',
}: FetchErrorStateProps) {
    return (
        <Alert
            severity="error"
            variant="outlined"
            action={
                <Button color="inherit" size="small" onClick={() => void onRetry()}>
                    {retryLabel}
                </Button>
            }
            sx={{ borderRadius: 3 }}
        >
            {message}
        </Alert>
    );
}
