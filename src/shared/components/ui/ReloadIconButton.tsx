import { useState } from 'react';
import { IconButton, Tooltip, type IconButtonProps } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { SPIN_ANIMATION, spinKeyframes } from '@/shared/styles/animations';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { logger } from '@/shared/utils/logger';

interface ReloadIconButtonProps extends Omit<IconButtonProps, 'onClick' | 'onError'> {
    tooltipTitle?: string;
    onReload: () => unknown;
    isLoading?: boolean;
    /**
     * M5: callback de error para el `refetch`. Si no se provee, el fallo se
     * registra con `logger` (nunca se traga en silencio ni rompe el click).
     */
    onReloadError?: (message: string) => void;
}

export const ReloadIconButton = ({
    tooltipTitle = 'Actualizar opciones',
    onReload,
    onReloadError,
    isLoading = false,
    size = 'small',
    sx,
    disabled,
    ...props
}: ReloadIconButtonProps) => {
    const [isReloading, setIsReloading] = useState(false);
    const spinning = isLoading || isReloading;

    const handleClick = async () => {
        setIsReloading(true);
        try {
            await onReload();
        } catch (error) {
            const message = getErrorMessage(error);
            logger.error('ReloadIconButton: fallo al recargar opciones.', error);
            onReloadError?.(message);
        } finally {
            setIsReloading(false);
        }
    };

    return (
        <Tooltip title={tooltipTitle}>
            <span>
                <IconButton
                    size={size}
                    onClick={() => {
                        void handleClick();
                    }}
                    disabled={spinning || disabled}
                    sx={{
                        p: 0.5,
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
                        ...sx,
                    }}
                    {...props}
                >
                    <Refresh
                        fontSize={size === 'small' ? 'small' : 'medium'}
                        sx={{
                            fontSize: size === 'small' ? 16 : 20,
                            ...(spinning && {
                                animation: SPIN_ANIMATION,
                                ...spinKeyframes,
                            }),
                        }}
                    />
                </IconButton>
            </span>
        </Tooltip>
    );
};
