import { Chip, Tooltip, alpha, useTheme } from '@mui/material';
import { ESTADO_VIGENCIA_META } from '../model/constants';
import type { FlotaDocumentoCritico } from '../model/types';
import { formatDateShort } from '@shared/utils/date-utils';

interface FlotaDocumentoVigenciaChipProps {
    documento?: FlotaDocumentoCritico;
}

/** Semáforo compacto del documento crítico más próximo a vencer. */
export function FlotaDocumentoVigenciaChip({ documento }: FlotaDocumentoVigenciaChipProps) {
    const theme = useTheme();

    if (!documento) {
        return <Chip label="—" size="small" variant="outlined" />;
    }

    const meta = ESTADO_VIGENCIA_META[documento.estadoVigencia] ?? ESTADO_VIGENCIA_META.AL_DIA;
    const baseColor = theme.palette[meta.color].main;
    const tooltip = `${documento.tipoDocumentoNombre} · ${documento.numeroDocumento} · vence ${formatDateShort(documento.fechaVencimiento)}`;

    return (
        <Tooltip title={tooltip}>
            <Chip
                label={`${meta.label} · ${documento.diasRestantes}d`}
                size="small"
                sx={{
                    bgcolor: alpha(baseColor, 0.12),
                    color: baseColor,
                    border: '1px solid',
                    borderColor: alpha(baseColor, 0.25),
                    fontWeight: 600,
                }}
            />
        </Tooltip>
    );
}
