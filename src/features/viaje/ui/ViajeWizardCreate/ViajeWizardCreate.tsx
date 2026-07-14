import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, type Path, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
    Box, 
    Button, 
    Stepper, 
    Step, 
    StepLabel, 
    Typography, 
    Grid,
    useTheme,
    StepConnector,
    stepConnectorClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
    ArrowBack, 
    ArrowForward, 
    Save, 
    Assignment, 
    RouteOutlined, 
    GroupAdd, 
    Inventory2, 
    Verified 
} from '@mui/icons-material';
import { useViajeOptions } from '../../hooks/useViajeOptions';
import { viajeWizardSchema, type ViajeWizardFormData } from '../../model/schema';
import type { CreateViajeDto } from '@/entities/viaje/model/types';
import { Step1DatosBase } from './Step1DatosBase';
import { Step2Ruta } from './Step2Ruta';
import { Step3Recursos } from './Step3Recursos';
import { Step4DetallesCarga } from './Step4DetallesCarga';
import { Step5Resumen } from './Step5Resumen';
import { WizardSidebar } from './WizardSidebar';

import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { useToast } from '@/shared/components/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VIAJE_QUERY_KEYS } from '@/features/viaje/model/query-keys';

import { notifyMutationError, type ApiMutationError } from '@/shared/utils/api-errors';
import { addDaysToDateISO, toInputDate } from '@/shared/utils/date-utils';
import { useEffect } from 'react';

const steps = [
    { label: 'Información General', icon: <Assignment /> },
    { label: 'Ruta y Locales', icon: <RouteOutlined /> },
    { label: 'Recursos', icon: <GroupAdd /> },
    { label: 'Carga', icon: <Inventory2 /> },
    { label: 'Resumen', icon: <Verified /> }
];

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

function QontoStepIcon(props: { active?: boolean; completed?: boolean; icon: React.ReactElement }) {
    const { active, completed, icon } = props;
    return (
        <QontoStepIconRoot ownerState={{ active, completed }}>
            {icon}
        </QontoStepIconRoot>
    );
}

export function ViajeWizardCreate() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const options = useViajeOptions(true);

    const methods = useForm<ViajeWizardFormData>({
        resolver: zodResolver(viajeWizardSchema) as Resolver<ViajeWizardFormData>,
        defaultValues: {
            clienteID: 0,
            estadoID: 0,
            tractoID: 0,
            carretaID: 0,
            colaboradorID: 0,
            origenID: 0,
            destinoID: 0,
            fechaCarga: addDaysToDateISO(7),
            tipoMedidaID: 0,
            tipoPesoID: 0,
            ejesTracto: 0,
            mercaderias: []
        }
    });

    const { handleSubmit, trigger, getValues, setValue } = methods;

    useEffect(() => {
        if (!getValues('tipoMedidaID') && options.defaultTipoMedidaId) {
            setValue('tipoMedidaID', options.defaultTipoMedidaId);
        }

        if (!getValues('tipoPesoID') && options.defaultTipoPesoId) {
            setValue('tipoPesoID', options.defaultTipoPesoId);
        }
    }, [getValues, options.defaultTipoMedidaId, options.defaultTipoPesoId, setValue]);

    const handleNext = async () => {
        let fieldsToValidate: Path<ViajeWizardFormData>[] = [];
        
        if (activeStep === 0) {
            fieldsToValidate = ['clienteID', 'estadoID', 'fechaCarga'];
        } else if (activeStep === 1) {
            fieldsToValidate = ['origenID', 'destinoID', 'direccionOrigen', 'direccionDestino'];
        } else if (activeStep === 2) {
            fieldsToValidate = ['tractoID', 'carretaID', 'colaboradorID', 'ejesTracto', 'ejesCarreta'];
        } else if (activeStep === 3) {
            fieldsToValidate = ['mercaderias'];
        }

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const mutation = useMutation<number | void, ApiMutationError, CreateViajeDto>({
        mutationFn: async (data: CreateViajeDto) => {
            const cleanData: CreateViajeDto = {
                ...data,
                // Ensure dates are correctly formatted
                fechaCarga: toInputDate(data.fechaCarga),
                fechaPartida: data.fechaPartida ? toInputDate(data.fechaPartida) : undefined,
                fechaLlegada: data.fechaLlegada ? toInputDate(data.fechaLlegada) : undefined,
                fechaDescarga: data.fechaDescarga ? toInputDate(data.fechaDescarga) : undefined,
                fechaLlegadaBase: data.fechaLlegadaBase ? toInputDate(data.fechaLlegadaBase) : undefined,
                
                // Optional fields
                cotizacionID: data.cotizacionID || undefined,
                direccionOrigen: data.direccionOrigen || undefined,
                direccionDestino: data.direccionDestino || undefined,
                ejesCarreta: data.ejesCarreta || undefined,
                largo: data.largo ?? undefined,
                alto: data.alto ?? undefined,
                ancho: data.ancho ?? undefined,
                peso: data.peso ?? undefined,
                kmInicio: data.kmInicio ?? undefined,
                kmLlegada: data.kmLlegada ?? undefined,
                kmLlegadaBase: data.kmLlegadaBase ?? undefined,
                mercaderias: data.mercaderias?.map(m => ({
                    ...m,
                    descripcion: m.descripcion || undefined,
                    largo: m.largo ?? undefined,
                    alto: m.alto ?? undefined,
                    ancho: m.ancho ?? undefined,
                    peso: m.peso ?? undefined
                }))
            };

            const response = await viajeApi.create(cleanData);
            return response.data;
        },
        onSuccess: (newViajeId) => {
            showToast({ message: 'Viaje creado exitosamente', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            
            // Redirect to detail page if we have the ID
            if (typeof newViajeId === 'number' && newViajeId > 0) {
                navigate(`/app/viajes/${newViajeId}`);
            } else {
                navigate('/app/viajes');
            }
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(showToast,'Viaje' , 'create', error);
        }
    });

    const onSubmit: SubmitHandler<ViajeWizardFormData> = (data) => {
        mutation.mutate(data);
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <Step1DatosBase options={options} />;
            case 1:
                return <Step2Ruta />;
            case 2:
                return <Step3Recursos options={options} />;
            case 3:
                return <Step4DetallesCarga options={options} />;
            case 4:
                return <Step5Resumen options={options} />;
            default:
                return 'Paso desconocido';
        }
    };

    return (
        <FormProvider {...methods}>
            <Box sx={{ maxWidth: 'lg', mx: 'auto', pb: 10 }}>
                
                {/* Horizontal Stepper */}
                <Box sx={{ mb: 6, maxWidth: 'md', mx: 'auto' }}>
                    <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel 
                                    StepIconComponent={() => (
                                        <QontoStepIcon 
                                            active={activeStep === index} 
                                            completed={activeStep > index} 
                                            icon={step.icon} 
                                        />
                                    )}
                                >
                                    <Typography variant="caption" fontWeight={800} color={activeStep === index ? 'primary' : 'text.secondary'} sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5, fontSize: '0.6rem' }}>
                                        Paso {index + 1}
                                    </Typography>
                                    <Typography variant="caption" fontWeight={activeStep === index ? 700 : 500} color={activeStep === index ? 'text.primary' : 'text.secondary'}>
                                        {step.label}
                                    </Typography>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Grid container spacing={4} alignItems="flex-start">
                    {/* Main Content */}
                    <Grid size={{xs:12, lg:8}}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                                Creación de Nuevo Viaje
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600 }}>
                                Defina los parámetros esenciales para iniciar el proceso logístico y garantizar la seguridad operativa.
                            </Typography>
                        </Box>
                        
                        <Box sx={{ minHeight: 400 }}>
                            {getStepContent(activeStep)}
                        </Box>
                    </Grid>

                    {/* Right Sidebar */}
                    <Grid size={{xs:12, lg:4}}>
                        <WizardSidebar activeStep={activeStep} totalSteps={steps.length} options={options} />
                    </Grid>
                </Grid>

                {/* Floating Navigation Footer */}
                <Box sx={{ 
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
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                }}>
                    <Box sx={{ maxWidth: 'lg', mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            onClick={() => navigate('/app/viajes')}
                            color="inherit"
                            sx={{ fontWeight: 700 }}
                            startIcon={<ArrowBack />}
                        >
                            Cancelar
                        </Button>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {activeStep > 0 && (
                                <Button onClick={handleBack} color="inherit" sx={{ fontWeight: 700 }}>
                                    Atrás
                                </Button>
                            )}

                            {activeStep < steps.length - 1 && (
                                <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', textAlign: 'right' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>
                                        Próximo Paso
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700}>
                                        {steps[activeStep + 1].label}
                                    </Typography>
                                </Box>
                            )}
                            
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={mutation.isPending}
                                    startIcon={<Save />}
                                    sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700, boxShadow: theme.shadows[4] }}
                                >
                                    {mutation.isPending ? 'Guardando...' : 'Guardar Viaje'}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    endIcon={<ArrowForward />}
                                    sx={{ 
                                        px: 4, 
                                        py: 1.5, 
                                        borderRadius: 3, 
                                        fontWeight: 700,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        boxShadow: theme.shadows[4],
                                        '&:hover': {
                                            transform: 'scale(1.02)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Siguiente Etapa
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </FormProvider>
    );
}
