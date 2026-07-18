import dayjs from 'dayjs';
import type { ResumenGeneralData } from '../ui/tabs';

interface GetViajeEditTabsOptions {
    requiereEscolta: boolean;
}

export function getViajeEditTabs({ requiereEscolta }: GetViajeEditTabsOptions) {
    return [
        { label: 'Resumen General' },
        { label: 'Planificación de Ruta' },
        { label: 'Guías de Remisión' },
        { label: 'Costos' },
        { label: 'Incidentes' },
        { label: 'Permisos' },
        { label: 'Escolta', disabled: !requiereEscolta },
    ];
}

export function createResumenGeneralDataFromViaje(
    viaje?: {
        fechaCarga?: string | null;
        fechaPartida?: string | null;
        fechaLlegada?: string | null;
        fechaDescarga?: string | null;
        fechaLlegadaBase?: string | null;
        kmInicio?: number | null;
        kmLlegada?: number | null;
        kmLlegadaBase?: number | null;
        largo?: number | null;
        ancho?: number | null;
        alto?: number | null;
        peso?: number | null;
        requiereEscolta?: boolean | null;
    },
): ResumenGeneralData {
    return {
        fechaCarga: viaje?.fechaCarga ? dayjs(viaje.fechaCarga) : null,
        fechaPartida: viaje?.fechaPartida ? dayjs(viaje.fechaPartida) : null,
        fechaLlegada: viaje?.fechaLlegada ? dayjs(viaje.fechaLlegada) : null,
        fechaDescarga: viaje?.fechaDescarga ? dayjs(viaje.fechaDescarga) : null,
        fechaLlegadaBase: viaje?.fechaLlegadaBase ? dayjs(viaje.fechaLlegadaBase) : null,
        kmInicio: viaje?.kmInicio ?? '',
        kmLlegada: viaje?.kmLlegada ?? '',
        kmLlegadaBase: viaje?.kmLlegadaBase ?? '',
        largo: viaje?.largo ?? '',
        ancho: viaje?.ancho ?? '',
        alto: viaje?.alto ?? '',
        peso: viaje?.peso ?? '',
        requiereEscolta: !!viaje?.requiereEscolta,
    };
}
