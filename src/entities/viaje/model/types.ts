export interface ViajeMercaderia {
    viajeMercaderiaID: number;
    viajeID: number;
    mercaderiaID: number;
    descripcion: string | null;
    tipoMedidaID: number;
    alto: number | null;
    largo: number | null;
    ancho: number | null;
    tipoPesoID: number;
    peso: number | null;
    mercaderia?: {
        mercaderiaID: number;
        descripcion: string;
    };
    tipoMedida?: {
        tipoMaestroID: number;
        descripcion: string;
    };
    tipoPeso?: {
        tipoMaestroID: number;
        descripcion: string;
    };
}

export interface ViajeGasto {
    viajeGastoID: number;
    viajeID: number;
    gastoID: number;
    fechaGasto: string; // DateOnly or DateTime in backend, string in frontend
    monedaID: number;
    monto: number;
    comprobante: boolean;
    numeroComprobante: string | null;
    descripcion: string | null;
    gasto?: {
        gastoID: number;
        descripcion: string;
    };
    moneda?: {
        monedaID: number;
        simbolo: string;
        descripcion: string;
    };
}

export interface ViajeGuia {
    viajeGuiaID: number;
    viajeID: number;
    tipoGuiaID: number;
    serie: string;
    numero: string;
    rutaArchivo: string | null;
    tipoGuia?: {
        tipoMaestroID: number;
        descripcion: string;
    };
}

export interface ViajeIncidente {
    viajeIncidenteID: number;
    viajeID: number;
    fechaHora: string;
    tipoIncidenteID: number;
    descripcion: string;
    ubigeoID: number;
    lugar: string | null;
    rutaFoto: string | null;
    tipoIncidente?: {
        tipoMaestroID: number;
        descripcion: string;
    };
    ubigeo?: {
        ubigeoID: number;
        descripcion: string;
    };
}

export interface ViajePermiso {
    viajePermisoID: number;
    viajeID: number;
    fechaVigencia: string;
    fechaVencimiento: string;
    rutaArchivo: string | null;
}

export interface ViajeEscolta {
    viajeEscoltaID: number;
    viajeID: number;
    flotaID: number | null;
    colaboradorID: number | null;
    tercero: boolean | null;
    nombreConductor: string | null;
    empresa: string | null;
    flota?: {
        flotaID: number;
        placa: string;
    };
    colaborador?: {
        colaboradorID: number;
        nombres: string;
        apellidos: string;
    };
}

export interface ViajeControlRuta {
    viajeControlRutaID: number;
    viajeID: number;
    ubigeoID: number;
    fechaHora: string;
    descripcion: string | null;
    ubigeo?: {
        ubigeoID: number;
        descripcion: string;
    };
}

export interface Viaje {
    viajeID: number;
    cotizacionID: number | null;
    clienteID: number;
    tractoID: number;
    carretaID: number | null;
    colaboradorID: number;
    origenID: number;
    destinoID: number;
    direccionOrigen: string | null;
    direccionDestino: string | null;
    fechaCarga: string;
    fechaPartida: string | null;
    fechaLlegada: string | null;
    fechaDescarga: string | null;
    fechaLlegadaBase: string | null;
    kmInicio: number | null;
    kmLlegada: number | null;
    kmLlegadaBase: number | null;
    estadoID: number;
    requiereEscolta: boolean | null;
    requierePermiso: boolean | null;
    tipoMedidaID: number;
    largo: number | null;
    alto: number | null;
    ancho: number | null;
    tipoPesoID: number;
    peso: number | null;
    eliminado: boolean;
    
    // Navigation properties for display
    cliente?: {
        clienteID: number;
        razonSocial: string;
        numeroDocumento: string;
    };
    tracto?: {
        flotaID: number;
        placa: string;
    };
    carreta?: {
        flotaID: number;
        placa: string;
    };
    colaborador?: {
        colaboradorID: number;
        nombres: string;
        primerApellido: string;
        segundoApellido: string;
    };
    origen?: {
        ubigeoID: number;
        departamento: string;
        provincia: string;
        distrito: string;
    };
    destino?: {
        ubigeoID: number;
        departamento: string;
        provincia: string;
        distrito: string;
    };
    estado?: {
        estadoID: number;
        nombre: string;
        codigo?: string; // If backend sends color
    };
    tipoMedida?: {
        tipoMaestroID: number;
        descripcion: string;
    };
    tipoPeso?: {
        tipoMaestroID: number;
        descripcion: string;
    };

    // Collections
    viajeMercaderia: ViajeMercaderia[];
    viajeGastos: ViajeGasto[];
    viajeGuia: ViajeGuia[];
    viajeIncidentes: ViajeIncidente[];
    viajePermisos: ViajePermiso[];
    viajeEscolta: ViajeEscolta[];
    viajeControlRuta: ViajeControlRuta[];
}

// DTOs for Creation/Update

export interface CreateViajeMercaderiaDto {
    mercaderiaID: number;
    descripcion?: string;
    tipoMedidaID: number;
    alto?: number;
    largo?: number;
    ancho?: number;
    tipoPesoID: number;
    peso?: number;
}

export interface CreateViajeGastoDto {
    gastoID: number;
    fechaGasto: string;
    monedaID: number;
    monto: number;
    comprobante: boolean;
    numeroComprobante?: string;
    descripcion?: string;
    // File handling might be separate or base64, but typically handled via FormData if file upload
}

export interface CreateViajeGuiaDto {
    tipoGuiaID: number;
    serie: string;
    numero: string;
    rutaArchivo?: string;
}

export interface CreateViajeIncidenteDto {
    fechaHora: string;
    tipoIncidenteID: number;
    descripcion: string;
    ubigeoID: number;
    lugar?: string;
    rutaFoto?: string;
}

export interface CreateViajePermisoDto {
    fechaVigencia: string;
    fechaVencimiento: string;
    rutaArchivo?: string;
}

export interface CreateViajeEscoltaDto {
    flotaID?: number;
    colaboradorID?: number;
    tercero?: boolean;
    nombreConductor?: string;
    empresa?: string;
}

export interface CreateViajeDto {
    cotizacionID?: number;
    clienteID: number;
    tractoID: number;
    carretaID?: number;
    colaboradorID: number;
    origenID: number;
    destinoID: number;
    direccionOrigen?: string;
    direccionDestino?: string;
    fechaCarga: string; // DateOnly as string YYYY-MM-DD
    fechaPartida?: string;
    fechaLlegada?: string;
    fechaDescarga?: string;
    fechaLlegadaBase?: string;
    kmInicio?: number;
    kmLlegada?: number;
    kmLlegadaBase?: number;
    estadoID: number;
    requiereEscolta?: boolean;
    requierePermiso?: boolean;
    tipoMedidaID: number;
    largo?: number;
    alto?: number;
    ancho?: number;
    tipoPesoID: number;
    peso?: number;

    // Collections
    viajeMercaderia?: CreateViajeMercaderiaDto[];
    viajeGastos?: CreateViajeGastoDto[];
    viajeGuia?: CreateViajeGuiaDto[];
    viajeIncidentes?: CreateViajeIncidenteDto[];
    viajePermisos?: CreateViajePermisoDto[];
    viajeEscolta?: CreateViajeEscoltaDto[];
}

export interface UpdateViajeDto extends CreateViajeDto {
    viajeID: number;
}

export interface ViajeFilters {
    page: number;
    size: number;
    search?: string;
    fechaInicio?: string;
    fechaFin?: string;
    clienteID?: number;
    colaboradorID?: number;
    estadoID?: number;
}

export interface ViajeListItem {
    viajeID: number;
    fechaCarga: string;
    requiereEscolta?: boolean;
    requierePermiso?: boolean;

    // Cliente
    clienteID: number;
    clienteRazonSocial: string;
    clienteRuc: string;

    // Ruta
    origenID: number;
    origenDescripcion: string;
    destinoID: number;
    destinoDescripcion: string;

    // Conductor
    colaboradorID: number;
    conductorNombreCompleto: string;

    // Recursos
    tractoID: number;
    tractoPlaca: string;
    carretaID?: number;
    carretaPlaca?: string;

    // Estado
    estadoID: number;
    estadoNombre: string;
    estadoCodigo?: string;

    // Mercadería (Resumen)
    mercaderiaDescripcion?: string;
}

export interface PagedViajes {
    items: ViajeListItem[];
    page: number;
    size: number;
    total: number;
}
