import { Tab, Tabs } from '@mui/material';
import { FLOTA_TABS } from '@entities/flota/model/constants';

interface FlotaTabsProps {
    value: number | null;
    onChange: (value: number | null) => void;
}

export function FlotaTabs({ value, onChange }: FlotaTabsProps) {
    const currentValue = value ?? 'all';

    return (
        <Tabs
            value={currentValue}
            onChange={(_, next) => onChange(next === 'all' ? null : Number(next))}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
        >
            {FLOTA_TABS.map((tab) => (
                <Tab key={tab.value ?? 'all'} value={tab.value ?? 'all'} label={tab.label} />
            ))}
        </Tabs>
    );
}
