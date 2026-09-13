import type { CreateViajeDto, Viaje } from '@/entities/viaje/model/types';
import { addMonthsToDateISO, getCurrentDateISO, removeMonthsToDateISO, toInputDate } from '@/shared/utils/date-utils';

export function getViajeFechaCargaLimits() {
    return {
        min: removeMonthsToDateISO(12),
        max: addMonthsToDateISO(2),
    };
}

export interface ViajeRecursosNormalizable {
    tractoID?: number | null;
    carretaID?: number | null;
    colaboradorID?: number | null;
    esTractoTercero?: boolean;
    esCarretaTercero?: boolean;
    esConductorTercero?: boolean;
    placaTractoTercero?: string;
    placaCarretaTercero?: string;
    nombreConductorTercero?: string;
    empresaTransporte?: string;
}

/**
 * Normaliza los recursos (conductor, tracto, carreta) para el contrato del backend:
 * un recurso tercero no envía el ID propio y exige su texto; un recurso propio
 * limpia los textos de tercero. La empresa de transporte solo viaja si hay terceros.
 */
export function normalizeViajeRecursos<T extends ViajeRecursosNormalizable>(
    data: T,
): Omit<T, keyof ViajeRecursosNormalizable> & ViajeRecursosNormalizable {
    const esTractoTercero = data.esTractoTercero === true;
    const esCarretaTercero = data.esCarretaTercero === true;
    const esConductorTercero = data.esConductorTercero === true;
    const hayRecursosTerceros = esTractoTercero || esCarretaTercero || esConductorTercero;

    return {
        ...data,
        tractoID: esTractoTercero ? null : (data.tractoID && data.tractoID > 0 ? data.tractoID : undefined),
        carretaID: esCarretaTercero ? null : (data.carretaID && data.carretaID > 0 ? data.carretaID : undefined),
        colaboradorID: esConductorTercero ? null : (data.colaboradorID && data.colaboradorID > 0 ? data.colaboradorID : undefined),
        esTractoTercero,
        esCarretaTercero,
        esConductorTercero,
        placaTractoTercero: esTractoTercero ? (data.placaTractoTercero?.trim() || undefined) : undefined,
        placaCarretaTercero: esCarretaTercero ? (data.placaCarretaTercero?.trim() || undefined) : undefined,
        nombreConductorTercero: esConductorTercero ? (data.nombreConductorTercero?.trim() || undefined) : undefined,
        empresaTransporte: hayRecursosTerceros ? (data.empresaTransporte?.trim() || undefined) : undefined,
    };
}

export function getCreateViajeDefaultValues(defaultEstadoId: number = 0): CreateViajeDto {
    return {
        estadoID: defaultEstadoId,
        requiereEscolta: false,
        fechaCarga: getCurrentDateISO(),
        clienteID: 0,
        colaboradorID: 0,
        origenID: 0,
        destinoID: 0,
        tractoID: 0,
        carretaID: 0,
        esTractoTercero: false,
        esCarretaTercero: false,
        esConductorTercero: false,
        placaTractoTercero: '',
        placaCarretaTercero: '',
        nombreConductorTercero: '',
        empresaTransporte: '',
        ejesTracto: 0,
        ejesCarreta: 0,
        tipoMedidaID: 0,
        tipoPesoID: 0,
        largo: 0,
        alto: 0,
        ancho: 0,
        peso: 0,
        kmInicio: 0,
        kmLlegada: 0,
        kmLlegadaBase: 0,
    };
}

export function mapViajeToFormValues(viaje: Viaje): CreateViajeDto {
    return {
        cotizacionID: viaje.cotizacionID ?? undefined,
        clienteID: viaje.clienteID || 0,
        tractoID: viaje.tractoID ?? 0,
        carretaID: viaje.carretaID ?? 0,
        colaboradorID: viaje.colaboradorID ?? 0,
        esTractoTercero: viaje.esTractoTercero ?? false,
        esCarretaTercero: viaje.esCarretaTercero ?? false,
        esConductorTercero: viaje.esConductorTercero ?? false,
        placaTractoTercero: viaje.placaTractoTercero ?? '',
        placaCarretaTercero: viaje.placaCarretaTercero ?? '',
        nombreConductorTercero: viaje.nombreConductorTercero ?? '',
        empresaTransporte: viaje.empresaTransporte ?? '',
        origenID: viaje.origenID || 0,
        destinoID: viaje.destinoID || 0,
        direccionOrigen: viaje.direccionOrigen ?? undefined,
        direccionDestino: viaje.direccionDestino ?? undefined,
        fechaCarga: viaje.fechaCarga ? toInputDate(viaje.fechaCarga) : getCurrentDateISO(),
        fechaPartida: viaje.fechaPartida ? toInputDate(viaje.fechaPartida) : undefined,
        fechaLlegada: viaje.fechaLlegada ? toInputDate(viaje.fechaLlegada) : undefined,
        fechaDescarga: viaje.fechaDescarga ? toInputDate(viaje.fechaDescarga) : undefined,
        fechaLlegadaBase: viaje.fechaLlegadaBase ? toInputDate(viaje.fechaLlegadaBase) : undefined,
        kmInicio: viaje.kmInicio ?? undefined,
        kmLlegada: viaje.kmLlegada ?? undefined,
        kmLlegadaBase: viaje.kmLlegadaBase ?? undefined,
        estadoID: viaje.estadoID || 0,
        requiereEscolta: viaje.requiereEscolta ?? false,
        tipoMedidaID: viaje.tipoMedidaID || 0,
        largo: viaje.largo ?? undefined,
        alto: viaje.alto ?? undefined,
        ancho: viaje.ancho ?? undefined,
        tipoPesoID: viaje.tipoPesoID || 0,
        peso: viaje.peso ?? undefined,
        ejesTracto: viaje.ejesTracto || 0,
        ejesCarreta: viaje.ejesCarreta || 0,
        mercaderias: viaje.viajeMercaderia?.map((mercaderia) => ({
            mercaderiaID: mercaderia.mercaderiaID,
            descripcion: mercaderia.descripcion ?? undefined,
            tipoMedidaID: mercaderia.tipoMedidaID,
            alto: mercaderia.alto ?? undefined,
            largo: mercaderia.largo ?? undefined,
            ancho: mercaderia.ancho ?? undefined,
            tipoPesoID: mercaderia.tipoPesoID,
            peso: mercaderia.peso ?? undefined,
        })),
    };
}
