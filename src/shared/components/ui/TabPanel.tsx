import { Box } from '@mui/material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    name?: string; // Optional identifier for aria-labelledby
}

export function TabPanel(props: TabPanelProps) {
    const { children, value, index, name = 'simple', ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`${name}-tabpanel-${index}`}
            aria-labelledby={`${name}-tab-${index}`}
            {...other}
            style={{ height: '100%' }}
        >
            {value === index && (
                <Box sx={{ py: 3, height: '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}
