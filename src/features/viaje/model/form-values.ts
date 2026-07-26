import type { CreateViajeDto, Viaje } from '@/entities/viaje/model/types';
import { getCurrentDateISO, toInputDate } from '@/shared/utils/date-utils';

export function getCreateViajeDefaultValues(): CreateViajeDto {
    return {
        estadoID: 0,
        requiereEscolta: false,
        fechaCarga: getCurrentDateISO(),
        clienteID: 0,
        colaboradorID: 0,
        origenID: 0,
        destinoID: 0,
        tractoID: 0,
        carretaID: 0,
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
        tractoID: viaje.tractoID || 0,
        carretaID: viaje.carretaID || 0,
        colaboradorID: viaje.colaboradorID || 0,
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
