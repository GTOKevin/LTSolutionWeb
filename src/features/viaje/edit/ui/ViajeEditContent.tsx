import { Box } from '@mui/material';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import type { Viaje } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import {
    EscoltaTab,
    GastosTab,
    GuiasTab,
    PermisosTab,
    ResumenGeneralTab,
    type ResumenGeneralData,
    ViajeIncidente,
} from './tabs';

interface ViajeEditContentProps {
    activeTab: number;
    viaje: Viaje;
    formData: ResumenGeneralData;
    onFormDataChange: (changes: Partial<ResumenGeneralData>) => void;
    onSaveResumen: () => void;
    isSavingResumen: boolean;
    isViewOnly: boolean;
    canGestionar?: boolean;
    viajeId: number;
    tiposIncidente: SelectItem[];
    viajeEstados?: SelectItem[];
}

export function ViajeEditContent({
    activeTab,
    viaje,
    formData,
    onFormDataChange,
    onSaveResumen,
    isSavingResumen,
    isViewOnly,
    canGestionar = false,
    viajeId,
    tiposIncidente,
    viajeEstados,
}: ViajeEditContentProps) {
    return (
        <>
            <TabPanel value={activeTab} index={0}>
                <ResumenGeneralTab
                    viaje={viaje}
                    formData={formData}
                    onChange={onFormDataChange}
                    onSave={onSaveResumen}
                    isSaving={isSavingResumen}
                    isViewOnly={isViewOnly}
                    viajeEstados={viajeEstados}
                    canGestionar={canGestionar}
                />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                <GuiasTab viaje={viaje} isViewOnly={isViewOnly} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
                <GastosTab viaje={viaje} isViewOnly={isViewOnly} />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
                <Box sx={{ p: 2 }}>
                    <ViajeIncidente viewOnly={isViewOnly} tiposIncidente={tiposIncidente} viajeId={viajeId} />
                </Box>
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
                <PermisosTab viaje={viaje} isViewOnly={isViewOnly} />
            </TabPanel>
            <TabPanel value={activeTab} index={5}>
                <EscoltaTab viaje={viaje} isViewOnly={isViewOnly} />
            </TabPanel>
        </>
    );
}
