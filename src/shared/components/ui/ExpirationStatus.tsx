import { Chip, Tooltip } from '@mui/material';

interface ExpirationStatusProps {
    expirationDate: string | Date;
}

export function ExpirationStatus({ expirationDate }: ExpirationStatusProps) {
    const date = new Date(expirationDate);
    const today = new Date();
    
    // Reset hours to compare just dates
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let color: 'success' | 'warning' | 'error' | 'default' = 'success';
    let label = 'Vigente';
    let sx = {};

    if (daysLeft < 0) {
        color = 'error';
        label = 'Vencido';
        sx = { bgcolor: '#d32f2f', color: '#fff' }; // Red 700
    } else if (daysLeft <= 7) {
        color = 'error';
        label = 'Alerta: Vence pronto';
        // Default error is red
    } else if (daysLeft <= 15) {
        // Yellow
        color = 'warning'; 
        sx = { bgcolor: '#fbc02d', color: '#000' }; // Yellow 700
        label = 'Próximo a vencer';
    } else if (daysLeft <= 30) {
        // Orange
        color = 'warning';
        label = 'Atención: < 1 mes';
        // Default warning is orange-ish, but let's make sure
        sx = { bgcolor: '#ed6c02', color: '#fff' }; // Orange 700
    } else {
        color = 'success';
        label = 'Vigente';
    }

    return (
        <Tooltip title={`Vence en ${daysLeft} días`}>
            <Chip 
                label={label} 
                color={Object.keys(sx).length > 0 ? undefined : color} 
                size="small" 
                sx={{ fontWeight: 'bold', ...sx }} 
            />
        </Tooltip>
    );
}
