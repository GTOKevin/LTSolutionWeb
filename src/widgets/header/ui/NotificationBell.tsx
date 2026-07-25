import { useState } from 'react';
import {
    Badge,
    IconButton,
    Popover,
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Button,
    useTheme,
    alpha
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    LocalShipping as TruckIcon,
    Description as DocumentIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useNotificaciones, useMarcarNotificacionLeida, useMarcarTodasNotificacionesLeidas } from '@/entities/notificacion/api/notificacion.api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { normalizeNotificationActionUrl } from '@shared/utils/notification-navigation';

export function NotificationBell() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const { data } = useNotificaciones();
    const marcarLeidaMutation = useMarcarNotificacionLeida();
    const marcarTodasLeidasMutation = useMarcarTodasNotificacionesLeidas();

    const notificaciones = data?.items || [];
    const noLeidasCount = notificaciones.filter(n => !n.leido).length;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificacionClick = (id: number, urlAccion?: string) => {
        marcarLeidaMutation.mutate(id);
        const normalizedUrl = normalizeNotificationActionUrl(urlAccion);

        if (normalizedUrl) {
            navigate(normalizedUrl);
        }

        handleClose();
    };

    const handleMarcarTodasLeidas = () => {
        marcarTodasLeidasMutation.mutate();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'notificaciones-popover' : undefined;

    const getIconForType = (tipo: string) => {
        switch (tipo.toLowerCase()) {
            case 'error': return <WarningIcon color="error" />;
            case 'warning': return <DocumentIcon sx={{ color: theme.palette.warning.main }} />;
            case 'info': return <TruckIcon color="info" />;
            default: return <NotificationsIcon />;
        }
    };

    return (
        <>
            <IconButton
                size="small"
                onClick={handleClick}
                sx={{
                    p: 1,
                    borderRadius: 2,
                    color: 'text.secondary',
                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                }}
            >
                <Badge
                    badgeContent={noLeidasCount}
                    color="error"
                    variant={noLeidasCount > 0 ? "standard" : "dot"}
                    invisible={noLeidasCount === 0}
                    sx={{ '& .MuiBadge-badge': { border: `2px solid ${theme.palette.background.paper}` } }}
                >
                    <NotificationsIcon sx={{ fontSize: 22 }} />
                </Badge>
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 480,
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: theme.shadows[4],
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Notificaciones
                    </Typography>
                    {noLeidasCount > 0 && (
                        <Button 
                            size="small" 
                            onClick={handleMarcarTodasLeidas}
                            sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                        >
                            Marcar todas leídas
                        </Button>
                    )}
                </Box>

                <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
                    {notificaciones.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No tienes notificaciones.
                            </Typography>
                        </Box>
                    ) : (
                        notificaciones.map((notif) => (
                            <ListItem
                                key={notif.notificacionID}
                                alignItems="flex-start"
                                onClick={() => handleNotificacionClick(notif.notificacionID, notif.urlAccion)}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: notif.leido ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.action.hover, 0.1)
                                    },
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'transparent' }}>
                                        {getIconForType(notif.tipoNotificacion)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" fontWeight={notif.leido ? 400 : 600} fontSize="0.875rem">
                                            {notif.titulo}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ mt: 0.5, display: 'block' }}>
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {notif.mensaje}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                                                {formatDistanceToNow(new Date(notif.fechaRegistro), { addSuffix: true, locale: es })}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))
                    )}
                </List>

                {notificaciones.length > 0 && (
                    <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                        <Button fullWidth size="small" sx={{ textTransform: 'none' }} onClick={handleClose}>
                            Ver todas las notificaciones
                        </Button>
                    </Box>
                )}
            </Popover>
        </>
    );
}
