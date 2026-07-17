import type { Path } from 'react-hook-form';
import {
    Assignment,
    GroupAdd,
    Inventory2,
    RouteOutlined,
    Verified,
} from '@mui/icons-material';
import type { ViajeWizardFormData } from '../../model/schema';

export const VIAJE_WIZARD_STEPS = [
    { label: 'Información General', icon: <Assignment /> },
    { label: 'Ruta y Locales', icon: <RouteOutlined /> },
    { label: 'Recursos', icon: <GroupAdd /> },
    { label: 'Carga', icon: <Inventory2 /> },
    { label: 'Resumen', icon: <Verified /> },
];

export function getViajeWizardStepFields(step: number): Path<ViajeWizardFormData>[] {
    switch (step) {
        case 0:
            return ['clienteID', 'estadoID', 'fechaCarga'];
        case 1:
            return ['origenID', 'destinoID', 'direccionOrigen', 'direccionDestino'];
        case 2:
            return ['tractoID', 'carretaID', 'colaboradorID', 'ejesTracto', 'ejesCarreta'];
        case 3:
            return ['mercaderias'];
        default:
            return [];
    }
}
