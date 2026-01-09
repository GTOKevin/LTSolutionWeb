import type { TipoMaestro } from '../../maestro/model/types';
import type { Flota } from '../../flota/model/types';
import type { Moneda } from '../../moneda/model/types';

export interface MantenimientoDetalle {
    mantenimientoDetalleID: number;
    mantenimientoID: number;
    tipoProductoID: number;
    descripcion?: string;
    cantidad: number;
    monedaID: number;
    costo: number;
    igv: boolean;
    subTotal: number;
    montoIGV: number;
    total: number;
    fechaRegistro: string;
    fechaModificacion?: string;
    moneda?: Moneda;
    tipoProducto?: TipoMaestro; // To be defined if needed
}

export interface Mantenimiento {
    mantenimientoID: number;
    flotaID: number;
    tipoServicioID: number;
    fechaIngreso: string; // DateOnly -> string (YYYY-MM-DD)
    fechaSalida?: string; // DateOnly -> string (YYYY-MM-DD)
    motivoIngreso: string;
    diagnosticoMecanico?: string;
    solucion?: string;
    kmIngreso: number;
    kmSalida?: number;
    estadoID: number;
    fechaRegistro: string;
    fechaModificacion?: string;
    
    // Relations
    flota?: Flota;
    tipoServicio?: TipoMaestro;
    estado?: any; // To be defined (Estado entity)
    mantenimientoDetalles: MantenimientoDetalle[];
}

export interface CreateMantenimientoDto {
    flotaID: number;
    tipoServicioID: number;
    fechaIngreso: string;
    fechaSalida?: string | null;
    motivoIngreso: string;
    diagnosticoMecanico?: string | null;
    solucion?: string | null;
    kmIngreso: number;
    kmSalida?: number | null;
    estadoID: number;
}

export interface CreateMantenimientoDetalleDto {
    tipoProductoID: number;
    descripcion?: string | null;
    cantidad: number;
    monedaID: number;
    costo: number;
    igv: boolean;
    subTotal: number;
    montoIGV: number;
    total: number;
}

export interface MantenimientoParams {
    flotaID?: number;
    tipoServicioID?: number;
    estadoID?: number;
    desde?: string;
    hasta?: string;
    search?: string;
    page?: number;
    size?: number;
}

export interface MantenimientoDetalleParams {
    mantenimientoID?: number;
    tipoProductoID?: number;
    monedaID?: number;
    search?: string;
    page?: number;
    size?: number;
}

export interface MantenimientoDetalleResponse {
    items: MantenimientoDetalle[];
    page: number;
    size: number;
    total: number;
    totalsByCurrency: Record<string, number>;
}

export interface MantenimientoReport {
    mantenimiento: Mantenimiento;
    detalles: MantenimientoDetalle[];
    totalsByCurrency: Record<string, number>;
}
