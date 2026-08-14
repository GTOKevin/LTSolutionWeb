import { Box, Stack, Typography } from '@mui/material';
import type { EmployeeViajeWorkflowStep } from '../../../model/workflow';

interface WorkflowTimelineProps {
    steps: EmployeeViajeWorkflowStep[];
}

function resolveStepTone(step: EmployeeViajeWorkflowStep) {
    if (step.isCompleted) {
        return {
            dotBg: 'success.main',
            dotBorder: 'success.main',
            text: 'text.primary',
            line: 'success.main',
            opacity: 1,
        };
    }

    if (step.isCurrent) {
        return {
            dotBg: 'primary.main',
            dotBorder: 'primary.main',
            text: 'text.primary',
            line: 'primary.main',
            opacity: 1,
        };
    }

    return {
        dotBg: 'background.paper',
        dotBorder: 'divider',
        text: 'text.secondary',
        line: 'divider',
        opacity: 0.7,
    };
}

export function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
    return (
        <>
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    const tone = resolveStepTone(step);

                    return (
                        <Stack
                            key={step.key}
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ minWidth: 0 }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                                <Box
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: tone.dotBg,
                                        border: '2px solid',
                                        borderColor: tone.dotBorder,
                                        color: step.isCompleted || step.isCurrent ? 'common.white' : 'text.secondary',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        flexShrink: 0,
                                    }}
                                >
                                    {index + 1}
                                </Box>
                                {!isLast ? (
                                    <Box
                                        sx={{
                                            width: 3,
                                            flex: 1,
                                            minHeight: 24,
                                            mt: 0.75,
                                            bgcolor: tone.line,
                                            opacity: tone.opacity,
                                        }}
                                    />
                                ) : null}
                            </Box>

                            <Box sx={{ minWidth: 0, py: 0.25 }}>
                                <Typography variant="body2" fontWeight={step.isCurrent ? 800 : 700} color={tone.text}>
                                    {step.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {step.isCurrent ? 'Estado actual' : step.isCompleted ? 'Completado' : 'Pendiente'}
                                </Typography>
                            </Box>
                        </Stack>
                    );
                })}
            </Stack>

            <Box
                sx={{
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
                    gap: 2,
                    alignItems: 'start',
                }}
            >
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    const tone = resolveStepTone(step);

                    return (
                        <Box
                            key={step.key}
                            sx={{
                                position: 'relative',
                                minWidth: 0,
                                '&::after': !isLast
                                    ? {
                                        content: '""',
                                        position: 'absolute',
                                        top: 8,
                                        left: 'calc(50% + 18px)',
                                        width: 'calc(100% - 36px)',
                                        height: 3,
                                        bgcolor: tone.line,
                                        opacity: tone.opacity,
                                        borderRadius: 999,
                                    }
                                    : undefined,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.25 }}>
                                <Box
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: tone.dotBg,
                                        border: '2px solid',
                                        borderColor: tone.dotBorder,
                                        color: step.isCompleted || step.isCurrent ? 'common.white' : 'text.secondary',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        zIndex: 1,
                                        position: 'relative',
                                    }}
                                >
                                    {index + 1}
                                </Box>
                            </Box>

                            <Box sx={{ textAlign: 'center', px: 1 }}>
                                <Typography variant="body2" fontWeight={step.isCurrent ? 800 : 700} color={tone.text}>
                                    {step.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {step.isCurrent ? 'Estado actual' : step.isCompleted ? 'Completado' : 'Pendiente'}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </>
    );
}
