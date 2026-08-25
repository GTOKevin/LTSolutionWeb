import type { PagedFilters, PagedResponse } from '@/shared/model/types';
import type { Cliente } from '@/entities/cliente/model/types';
import type { Moneda } from '@/entities/moneda/model/types';
import type { Estado } from '@/shared/model/estado.types';
import type { TipoMaestro } from '@/shared/model/maestro.types';

export interface FacturaDetalle {
    facturaDetalleID: number;
    facturaID: number;
    viajeID: number;
    descripcion: string | null;
    codigo?: string | null;
    monedaID: number;
    subTotal: number;
    igv: number;
    total: number;
    viaje?: import('@/entities/viaje/model/types').Viaje;
    moneda?: Moneda;
}

export interface FacturaDetalleViajeOption {
    viajeID: number;
    codigo: string;
    tractoPlaca: string;
    carretaPlaca?: string | null;
    origenDescripcion: string;
    destinoDescripcion: string;
    mercaderiaDescripcion: string;
    descripcionDetalleSugerida: string;
}

export interface FacturaGuia {
    viajeID?: number | null;
    codigoViaje: string;
    viajeGuiaID: number;
    tipoGuiaDescripcion: string;
    serie: string;
    numero: string;
    rutaArchivo: string | null;
}

export interface FacturaPago {
    facturaPagoID: number;
    facturaID: number;
    fechaPago: string;
    fechaAcreditacion?: string | null;
    tipoPagoID: number;
    estadoID: number;
    monedaID: number;
    montoAbonado: number;
    numeroOperacion: string | null;
    observacion: string | null;
    moneda?: Moneda;
    tipoPago?: TipoMaestro;
    estado?: Estado;
}

export interface Factura {
    facturaID: number;
    clienteID: number;
    serie: string;
    numero: string;
    fechaEmision: string;
    fechaVencimiento: string;
    fechaCompromisoPago?: string | null;
    diasCredito?: number | null;
    monedaID: number;
    subTotal: number;
    igv: number;
    total: number;
    saldoPendiente: number;
    estadoID: number;
    activo: boolean;
    esVencida?: boolean;
    esCompromisoVencido?: boolean;
    cliente?: Cliente;
    moneda?: Moneda;
    estado?: Estado;
    facturaDetalles?: FacturaDetalle[];
    facturaPagos?: FacturaPago[];
}

export interface FacturaFilters extends PagedFilters {
    search?: string;
    estadoID?: number;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface FacturasResumen {
    totalFacturado: number;
    saldoPendienteTotal: number;
}

export interface FacturaDetalleReporte extends FacturaDetalle {
    viajeCodigo?: string;
    origen?: string;
    destino?: string;
    tractoPlaca?: string;
}

export interface FacturaPagoReporte extends FacturaPago {
    tipoPagoNombre?: string;
    estadoNombre?: string;
}

export interface FacturaReporte extends Factura {
    detalles: FacturaDetalleReporte[];
    pagos: FacturaPagoReporte[];
}

export type PagedFacturas = PagedResponse<Factura>;

export interface CreateFacturaDetalleDto {
    viajeID: number;
    descripcion?: string;
    monedaID: number;
    subTotal: number;
    igv: boolean;
}

export interface CreateFacturaPagoDto {
    fechaPago: string;
    fechaAcreditacion?: string;
    tipoPagoID: number;
    estadoID: number;
    monedaID: number;
    montoAbonado: number;
    numeroOperacion?: string;
    observacion?: string;
}

export interface CreateFacturaDto {
    clienteID: number;
    serie: string;
    numero: string;
    fechaEmision: string;
    fechaVencimiento?: string | null;
    fechaCompromisoPago?: string | null;
    diasCredito?: number | null;
    monedaID: number;
    estadoID: number;
    detalles: CreateFacturaDetalleDto[];
    pagos: CreateFacturaPagoDto[];
}

export interface UpdateFacturaDto {
    fechaEmision?: string | null;
    fechaVencimiento?: string | null;
    fechaCompromisoPago?: string | null;
    diasCredito?: number | null;
    estadoID: number;
}
