import { IconButton, Tooltip, type IconButtonProps } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ReloadIconButtonProps extends Omit<IconButtonProps, 'onClick'> {
    tooltipTitle?: string;
    onReload: () => unknown;
    isLoading?: boolean;
}

export const ReloadIconButton = ({
    tooltipTitle = 'Actualizar opciones',
    onReload,
    isLoading = false,
    size = 'small',
    sx,
    disabled,
    ...props
}: ReloadIconButtonProps) => {
    return (
        <Tooltip title={tooltipTitle}>
            <span>
                <IconButton
                    size={size}
                    onClick={() => {
                        void onReload();
                    }}
                    disabled={isLoading || disabled}
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
                            ...(isLoading && {
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                },
                            }),
                        }}
                    />
                </IconButton>
            </span>
        </Tooltip>
    );
};
