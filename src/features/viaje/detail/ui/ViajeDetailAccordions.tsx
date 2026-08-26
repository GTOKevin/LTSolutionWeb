import { useState } from 'react';
import {
    Box,
    Stack,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    alpha,
    useTheme,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    InfoOutlined as InfoOutlinedIcon,
    Payments as PaymentsIcon,
    DescriptionOutlined as DescriptionOutlinedIcon,
    AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
    SecurityOutlined as SecurityOutlinedIcon,
    ReportProblemOutlined as ReportProblemOutlinedIcon,
    ReceiptLongOutlined as ReceiptLongOutlinedIcon,
} from '@mui/icons-material';
import type { ViajeDetail } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ViajeIncidente } from '@features/viaje/edit/ui/tabs/ViajeIncidente';
import { useViajeIncidentes } from '@/features/viaje/hooks/useViajeIncidentes';
import { ViajeInfoGeneralSection } from './sections/ViajeInfoGeneralSection';
import { ViajeGastosSection } from './sections/ViajeGastosSection';
import { ViajeGuiasSection } from './sections/ViajeGuiasSection';
import { ViajePermisosSection } from './sections/ViajePermisosSection';
import { ViajeEscoltaSection } from './sections/ViajeEscoltaSection';
import { ViajeFacturaSection } from './sections/ViajeFacturaSection';

interface ViajeDetailAccordionsProps {
    viaje: ViajeDetail;
    tiposIncidente: SelectItem[];
    isViewOnly?: boolean;
}

type AccordionKey = 'general' | 'gastos' | 'guias' | 'permisos' | 'escolta' | 'incidentes' | 'factura';

const DEFAULT_EXPANDED: Record<AccordionKey, boolean> = {
    general: true,
    gastos: false,
    guias: false,
    permisos: false,
    escolta: false,
    incidentes: false,
    factura: false,
};

export function ViajeDetailAccordions({ viaje, tiposIncidente, isViewOnly = true }: ViajeDetailAccordionsProps) {
    const theme = useTheme();

    const [expandedSections, setExpandedSections] = useState<Record<AccordionKey, boolean>>(DEFAULT_EXPANDED);

    const toggleSection = (section: AccordionKey) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Misma query key que ViajeIncidenteList (1, 100): React Query deduplica la
    // petición y el contador se deriva del mismo dataset de la lista.
    const { data: incidentesData } = useViajeIncidentes(viaje.viajeID, 1, 100);
    const incidentesCount = incidentesData?.items.length ?? 0;

    const accordionStyle = {
        borderRadius: '12px !important',
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
        },
    };

    const summaryStyle = {
        minHeight: 56,
        px: 3,
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : alpha('#f8f9fa', 0.8),
        '&.Mui-expanded': {
            minHeight: 56,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.04),
        },
    };

    const renderSummary = (icon: React.ReactNode, title: string, extra?: React.ReactNode) => (
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" sx={{ width: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {icon}
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {title}
                </Typography>
            </Stack>
            {extra}
        </Stack>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {/* 1. INFORMACIÓN GENERAL (principal) */}
            <Accordion
                expanded={expandedSections.general}
                onChange={() => toggleSection('general')}
                sx={accordionStyle}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summaryStyle}>
                    {renderSummary(<InfoOutlinedIcon color="primary" />, 'Información General')}
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <ViajeInfoGeneralSection viaje={viaje} />
                </AccordionDetails>
            </Accordion>

            {/* 2. COSTO Y GASTOS DE VIAJE */}
            <Accordion
                expanded={expandedSections.gastos}
                onChange={() => toggleSection('gastos')}
                sx={accordionStyle}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summaryStyle}>
                    {renderSummary(<PaymentsIcon color="primary" />, 'Costo y Gastos de Viaje')}
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <ViajeGastosSection viaje={viaje} />
                </AccordionDetails>
            </Accordion>

            {/* 3. GUÍAS */}
            <Accordion
                expanded={expandedSections.guias}
                onChange={() => toggleSection('guias')}
                sx={accordionStyle}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summaryStyle}>
                    {renderSummary(<DescriptionOutlinedIcon color="primary" />, 'Guías')}
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <ViajeGuiasSection viaje={viaje} />
                </AccordionDetails>
            </Accordion>

            {viaje.facturado === true ? (
                <Accordion
                    expanded={expandedSections.factura}
                    onChange={() => toggleSection('factura')}
                    sx={accordionStyle}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summaryStyle}>
                        {renderSummary(<ReceiptLongOutlinedIcon color="primary" />, 'Factura del Viaje')}
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3 }}>
                        <ViajeFacturaSection viajeId={viaje.viajeID} />
                    </AccordionDetails>
                </Accordion>
            ) : null}

            {/* 4. PERMISOS */}
            <Accordion
                expanded={expandedSections.permisos}
                onChange={() => toggleSection('permisos')}
                sx={accordionStyle}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summaryStyle}>
                    {renderSummary(<AssignmentTurnedInOutlinedIcon color="primary" />, 'Permisos')}
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <ViajePermisosSection viaje={viaje} />
                </AccordionDetails>
            </Accordion>

            {/* 5. ESCOLTA */}
            <Accordion
                expanded={expandedSections.escolta}
                onChange={() => toggleSection('escolta')}
                sx={accordionStyle}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summaryStyle}>
                    {renderSummary(<SecurityOutlinedIcon color="primary" />, 'Escolta')}
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <ViajeEscoltaSection viaje={viaje} />
                </AccordionDetails>
            </Accordion>

            {/* 6. INCIDENTES */}
            <Accordion
                expanded={expandedSections.incidentes}
                onChange={() => toggleSection('incidentes')}
                sx={{
                    ...accordionStyle,
                    bgcolor:
                        incidentesCount > 0
                            ? alpha(theme.palette.error.main, 0.02)
                            : 'transparent',
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        ...summaryStyle,
                        bgcolor:
                            incidentesCount > 0
                                ? alpha(theme.palette.error.main, 0.05)
                                : summaryStyle.bgcolor,
                    }}
                >
                    {renderSummary(
                        <ReportProblemOutlinedIcon color={incidentesCount > 0 ? 'error' : 'primary'} />,
                        `Incidentes (${incidentesCount})`,
                    )}
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <ViajeIncidente
                        viajeId={viaje.viajeID}
                        viewOnly={isViewOnly}
                        tiposIncidente={tiposIncidente}
                    />
                </AccordionDetails>
            </Accordion>


        </Box>
    );
}
