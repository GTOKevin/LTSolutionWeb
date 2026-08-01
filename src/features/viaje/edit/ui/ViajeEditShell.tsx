import { Box, Button, Chip, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import type { ReactNode, SyntheticEvent } from 'react';

interface ViajeEditShellTab {
    label: string;
    disabled?: boolean;
}

interface ViajeEditShellProps {
    viajeCodigo?: string | null;
    statusLabel?: string | null;
    activeTab: number;
    onTabChange: (_event: SyntheticEvent, value: number) => void;
    tabs: ViajeEditShellTab[];
    onBack: () => void;
    children: ReactNode;
}

export function ViajeEditShell({
    viajeCodigo,
    statusLabel,
    activeTab,
    onTabChange,
    tabs,
    onBack,
    children,
}: ViajeEditShellProps) {
    return (
        <Box sx={{ marginBottom: '24px' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="text.primary"
                            sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            Edición de Viaje
                            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                                Codigo: {viajeCodigo || '-'}
                            </Box>
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip label={statusLabel || ''} color="info" size="small" sx={{ fontWeight: 600, mr: 2 }} />
                    <Button onClick={onBack} variant="outlined" color="inherit">
                        Volver
                    </Button>
                </Box>
            </Stack>

            <Paper
                sx={{ borderRadius: 3, boxShadow: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
                elevation={0}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, bgcolor: 'background.paper' }}>
                    <Tabs
                        value={activeTab}
                        onChange={onTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: 48,
                            '& .MuiTab-root': {
                                py: 2,
                                px: 4,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'text.secondary',
                                textTransform: 'none',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderTopLeftRadius: 3,
                                borderTopRightRadius: 3,
                            },
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab key={tab.label} label={tab.label} disabled={tab.disabled} />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: 3, minHeight: '60vh' }}>{children}</Box>
            </Paper>
        </Box>
    );
}
