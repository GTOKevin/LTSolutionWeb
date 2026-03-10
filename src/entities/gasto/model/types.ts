export interface Gasto {
    gastoID: number;
    nombre: string;
    activo: boolean;
}

export interface GastoDto {
    gastoID: number;
    nombre: string;
    activo: boolean;
}

export interface CreateGastoDto {
    nombre: string;
    activo: boolean;
}

export interface GastoParams {
    search?: string;
    page?: number;
    size?: number;
}
