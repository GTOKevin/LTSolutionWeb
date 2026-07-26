export interface Gasto {
    gastoID: number;
    nombre: string;
    codigo: string;
    monedaCodigoDefault?: string | null;
    activo: boolean;
}

export interface GastoDto {
    gastoID: number;
    nombre: string;
    codigo: string;
    monedaCodigoDefault?: string | null;
    activo: boolean;
}

export interface CreateGastoDto {
    nombre: string;
    codigo: string;
    monedaCodigoDefault?: string | null;
    activo: boolean;
}

export interface GastoParams {
    search?: string;
    page?: number;
    size?: number;
}
