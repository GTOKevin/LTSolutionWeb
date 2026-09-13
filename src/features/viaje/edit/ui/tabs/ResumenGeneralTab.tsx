import { Box, Button, CircularProgress } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import type { Viaje } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import type { ResumenGeneralData } from '../../model/viaje-edit-tabs';
import { createResumenGeneralDataFromViaje } from '../../model/viaje-edit-tabs';
import { ServiceInformationSection } from './sections/ServiceInformationSection';
import { CargoManifestSection } from './sections/CargoManifestSection';
import { TrackingDatesKmSection } from './sections/TrackingDatesKmSection';

interface ResumenGeneralTabProps {
    viaje: Viaje;
    formData: ResumenGeneralData;
    onChange: (data: Partial<ResumenGeneralData>) => void;
    onSave?: () => void;
    isSaving?: boolean;
    isViewOnly?: boolean;
    viajeEstados?: SelectItem[];
}

export function ResumenGeneralTab({
    viaje,
    formData,
    onChange,
    onSave,
    isSaving = false,
    isViewOnly = false,
    viajeEstados,
}: ResumenGeneralTabProps) {
    const handleDiscard = () => {
        const fresh = createResumenGeneralDataFromViaje(viaje);
        onChange(fresh);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 1. Información del Servicio */}
            <ServiceInformationSection viaje={viaje} />

            {/* 2. Especificación y Manifiesto de Mercadería (Propuesta 4 - 100% Editable) */}
            <CargoManifestSection
                viaje={viaje}
                formData={formData}
                onChange={onChange}
                isViewOnly={isViewOnly}
            />

            {/* 3. Seguimiento, Fechas y Kilometraje */}
            <TrackingDatesKmSection
                viaje={viaje}
                formData={formData}
                onChange={onChange}
                isViewOnly={isViewOnly}
                viajeEstados={viajeEstados}
            />

            {/* 4. Barra Inferior de Acciones */}
            {!isViewOnly && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 2,
                        pt: 1,
                        pb: 4,
                    }}
                >
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleDiscard}
                        disabled={isSaving}
                        startIcon={<RestartAltOutlinedIcon />}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            borderColor: 'divider',
                            color: 'text.secondary',
                        }}
                    >
                        Descartar Cambios
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onSave}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(0, 114, 206, 0.25)',
                        }}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Modificaciones'}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
