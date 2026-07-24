import {
    ArrowBack,
    ArrowForward,
    Save,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Grid,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepLabel,
    Stepper,
    Typography,
    useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ReactElement, ReactNode } from 'react';

interface ViajeWizardShellStep {
    label: string;
    icon: ReactElement;
}

interface ViajeWizardShellProps {
    steps: ViajeWizardShellStep[];
    activeStep: number;
    title: string;
    subtitle: string;
    sidebar: ReactNode;
    children: ReactNode;
    onCancel: () => void;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
    isSaving?: boolean;
}

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 20,
        left: 'calc(-50% + 20px)',
        right: 'calc(50% + 20px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
    ({ theme, ownerState }) => ({
        color: ownerState.active || ownerState.completed ? theme.palette.primary.contrastText : theme.palette.text.secondary,
        backgroundColor: ownerState.active || ownerState.completed ? theme.palette.primary.main : theme.palette.grey[200],
        display: 'flex',
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        zIndex: 1,
        border: '4px solid white',
        boxShadow: ownerState.active ? `0 4px 10px ${theme.palette.primary.light}` : 'none',
        '& .MuiSvgIcon-root': {
            fontSize: 20,
        },
    }),
);

function QontoStepIcon(props: { active?: boolean; completed?: boolean; icon: ReactElement }) {
    const { active, completed, icon } = props;
    return <QontoStepIconRoot ownerState={{ active, completed }}>{icon}</QontoStepIconRoot>;
}

export function ViajeWizardShell({
    steps,
    activeStep,
    title,
    subtitle,
    sidebar,
    children,
    onCancel,
    onBack,
    onNext,
    onSave,
    isSaving = false,
}: ViajeWizardShellProps) {
    const theme = useTheme();

    return (
        <Box sx={{ maxWidth: 'lg', mx: 'auto', pb: 10 }}>
            <Box sx={{ mb: 6, maxWidth: 'md', mx: 'auto' }}>
                <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <QontoStepIcon active={activeStep === index} completed={activeStep > index} icon={step.icon} />
                                )}
                            >
                                <Typography
                                    variant="caption"
                                    fontWeight={800}
                                    color={activeStep === index ? 'primary' : 'text.secondary'}
                                    sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5, fontSize: '0.6rem' }}
                                >
                                    Paso {index + 1}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    fontWeight={activeStep === index ? 700 : 500}
                                    color={activeStep === index ? 'text.primary' : 'text.secondary'}
                                >
                                    {step.label}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <Grid container spacing={4} alignItems="flex-start">
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600 }}>
                            {subtitle}
                        </Typography>
                    </Box>

                    <Box sx={{ minHeight: 400 }}>{children}</Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>{sidebar}</Grid>
            </Grid>

            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    py: 2,
                    px: 4,
                    zIndex: 1000,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
                }}
            >
                <Box sx={{ maxWidth: 'lg', mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button onClick={onCancel} color="inherit" sx={{ fontWeight: 700 }} startIcon={<ArrowBack />}>
                        Cancelar
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {activeStep > 0 ? (
                            <Button onClick={onBack} color="inherit" sx={{ fontWeight: 700 }}>
                                Atrás
                            </Button>
                        ) : null}

                        {activeStep < steps.length - 1 ? (
                            <>
                                <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', textAlign: 'right' }}>
                                    <Typography
                                        variant="caption"
                                        fontWeight={800}
                                        color="text.secondary"
                                        sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}
                                    >
                                        Próximo Paso
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700}>
                                        {steps[activeStep + 1].label}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={onNext}
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 3,
                                        fontWeight: 700,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        boxShadow: theme.shadows[4],
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    Siguiente Etapa
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={onSave}
                                disabled={isSaving}
                                startIcon={<Save />}
                                sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700, boxShadow: theme.shadows[4] }}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Viaje'}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
