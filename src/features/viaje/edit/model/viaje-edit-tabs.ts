import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

/**
 * Contrato del formulario del Resumen General (edit de viaje). Vive en el modelo
 * (no en la UI) junto al mapper `createResumenGeneralDataFromViaje`.
 */
export interface ResumenGeneralData {
    estadoID: number;
    estadoNombre: string;
    fechaCarga: Dayjs | null;
    fechaPartida: Dayjs | null;
    fechaLlegada: Dayjs | null;
    fechaDescarga: Dayjs | null;
    fechaLlegadaBase: Dayjs | null;
    kmInicio: number | '';
    kmLlegada: number | '';
    kmLlegadaBase: number | '';
    largo: number | '';
    ancho: number | '';
    alto: number | '';
    peso: number | '';
    requiereEscolta: boolean;
}

interface GetViajeEditTabsOptions {
    requiereEscolta: boolean;
}

export function getViajeEditTabs({ requiereEscolta }: GetViajeEditTabsOptions) {
    // NOTA: "Planificación de Ruta" fue desactivada intencionalmente por el
    // cliente (funcionalidad no requerida por ahora). El array debe mantenerse
    // alineado con los TabPanels de ViajeEditContent (6 paneles: Resumen,
    // Guías, Costos, Incidentes, Permisos, Escolta).
    return [
        { label: 'Resumen General' },
        { label: 'Guías de Remisión' },
        { label: 'Costos' },
        { label: 'Incidentes' },
        { label: 'Permisos' },
        { label: 'Escolta', disabled: !requiereEscolta },
    ];
}

export function createResumenGeneralDataFromViaje(
    viaje?: {
        estadoID?: number | null;
        estado?: { nombre?: string | null } | null;
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
        estadoID: viaje?.estadoID ?? 0,
        estadoNombre: viaje?.estado?.nombre ?? '',
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
