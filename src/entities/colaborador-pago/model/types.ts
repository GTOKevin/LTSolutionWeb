import type { TipoMaestro } from '@shared/model/maestro.types';
import type { Moneda } from '../../moneda/model/types';

export interface ColaboradorPago {
    colaboradorPagoID: number;
    colaboradorID: number;
    tipoPagoID: number;
    fechaInico: string; // DateOnly -> string
    fechaCierre: string; // DateOnly -> string
    fechaPago: string; // DateOnly -> string
    monedaID: number;
    monto: number;
    observaciones?: string;
    fechaRegistro: string;
    tipoPago?: TipoMaestro;
    moneda?: Moneda;
}

export interface CreateColaboradorPagoDto {
    tipoPagoID: number;
    fechaInico: string;
    fechaCierre: string;
    fechaPago: string;
    monedaID: number;
    monto: number;
    observaciones?: string;
}

export interface ColaboradorPagoParams {
    colaboradorID?: number;
    tipoPagoID?: number;
    monedaID?: number;
    desde?: string;
    hasta?: string;
    page?: number;
    size?: number;
}

export interface ColaboradorPagosReportDto {
    nombreCompleto: string;
    cargo: string;
    tipoDocumento: string;
    numeroDocumento: string;
    pagos: ColaboradorPagoDetailDto[];
    totalesPorMoneda: Record<string, number>;
}

export interface ColaboradorPagoDetailDto {
    tipoPago: string;
    observaciones: string;
    fechaInicio: string;
    fechaCierre: string;
    fechaPago: string;
    moneda: string;
    monto: number;
}

