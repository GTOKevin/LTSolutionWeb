import {
    Alert,
    Box,
    CircularProgress,
    Tab,
    Tabs,
    Typography,
    alpha,
    useTheme,
    type TabsProps,
} from '@mui/material';
import type { ReactNode, SyntheticEvent } from 'react';

interface CrudTabbedPageShellTab {
    label: string;
    disabled?: boolean;
}

interface CrudTabbedPageShellProps {
    title: string;
    subtitle?: string;
    tabs: CrudTabbedPageShellTab[];
    activeTab: number;
    onTabChange: (_event: SyntheticEvent, value: number) => void;
    children: ReactNode;
    footer?: ReactNode;
    footerAlign?: 'end' | 'space-between';
    loading?: boolean;
    errorMessage?: string | null;
    onDismissError?: () => void;
    maxWidth?: number;
    tabsProps?: Partial<TabsProps>;
}

export function CrudTabbedPageShell({
    title,
    subtitle,
    tabs,
    activeTab,
    onTabChange,
    children,
    footer,
    footerAlign = 'end',
    loading = false,
    errorMessage,
    onDismissError,
    maxWidth = 1600,
    tabsProps,
}: CrudTabbedPageShellProps) {
    const theme = useTheme();
    const footerJustifyContent = footerAlign === 'space-between' ? 'space-between' : 'flex-end';

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
                p: { xs: 2, md: 3 },
                position: 'relative',
                pb: { xs: 10, md: 3 },
            }}
        >
            <Box
                sx={{
                    maxWidth,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, md: 3 },
                }}
            >
                <Box
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            px: 3,
                            pt: 2,
                            pb: 0,
                        }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {title}
                            </Typography>
                            {subtitle ? (
                                <Typography variant="caption" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            ) : null}
                        </Box>

                        <Tabs
                            value={activeTab}
                            onChange={onTabChange}
                            textColor="primary"
                            indicatorColor="primary"
                            {...tabsProps}
                        >
                            {tabs.map((tab) => (
                                <Tab key={tab.label} label={tab.label} disabled={tab.disabled} />
                            ))}
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 0 }}>
                        {!loading && errorMessage ? (
                            <Box sx={{ p: 3, pb: 0 }}>
                                <Alert severity="error" onClose={onDismissError}>
                                    {errorMessage}
                                </Alert>
                            </Box>
                        ) : null}

                        {loading ? (
                            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : children}

                        {!loading && footer ? (
                            <Box
                                sx={{
                                    p: 3,
                                    borderTop: `1px solid ${theme.palette.divider}`,
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                    display: 'flex',
                                    justifyContent: footerJustifyContent,
                                    gap: 2,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {footer}
                            </Box>
                        ) : null}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
