import { Chip, Tooltip } from '@mui/material';
import { getDocumentVigenciaMetaByExpirationDate } from '@shared/utils/document-vigencia';

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
    const vigenciaMeta = getDocumentVigenciaMetaByExpirationDate(
        typeof expirationDate === 'string' ? expirationDate : expirationDate.toISOString(),
    );
    const colorMap = {
        vigente: 'success',
        por_vencer: 'warning',
        vencido: 'error',
        desconocido: 'default',
    } as const;
    const color = colorMap[vigenciaMeta.key];
    const label = vigenciaMeta.label;
    const sx = vigenciaMeta.key === 'vencido'
        ? { bgcolor: '#d32f2f', color: '#fff' }
        : {};
    const tooltipTitle = daysLeft < 0
        ? `Documento vencido hace ${Math.abs(daysLeft)} días`
        : `Vence en ${daysLeft} días`;

    return (
        <Tooltip title={tooltipTitle}>
            <Chip 
                label={label} 
                color={Object.keys(sx).length > 0 ? undefined : color} 
                size="small" 
                sx={{ fontWeight: 'bold', ...sx }} 
            />
        </Tooltip>
    );
}
