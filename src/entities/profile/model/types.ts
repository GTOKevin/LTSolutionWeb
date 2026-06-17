export interface MyProfileUsuarioDto {
    usuarioId: number;
    nombreUsuario: string;
    email: string | null;
    rolUsuarioId: number;
    rolUsuarioNombre: string;
    estadoId: number;
    estadoNombre: string;
    ultimoAcceso: string | null;
    bloqueado: boolean;
    intentosLogin: number;
    fechaRegistro: string;
    colaboradorId: number | null;
    tieneColaboradorAsociado: boolean;
}

export interface MyProfileColaboradorDto {
    colaboradorId: number;
    nombres: string;
    primerApellido: string;
    segundoApellido: string | null;
    nombreCompleto: string;
    rolColaboradorId: number | null;
    rolColaboradorNombre: string;
    telefono: string | null;
    activo: boolean;
    esConductor: boolean;
}

export interface MyProfileDocumentoDto {
    colaboradorDocumentoId: number;
    tipoDocumentoId: number;
    tipoDocumentoNombre: string;
    numeroDocumento: string | null;
    rutaArchivo: string | null;
    fechaEmision: string;
    fechaVencimiento: string;
    activo: boolean;
    vigenciaEstado: string;
}

export interface MyProfileLicenciaDto {
    colaboradorLicenciaId: number;
    tipoLicenciaId: number;
    tipoLicenciaNombre: string;
    descripcion: string | null;
    fechaInicial: string;
    fechaFinal: string | null;
    estado: string;
}

export interface MyProfileAusenciaDto {
    colaboradorPermisoId: number;
    tipoPermisoId: number;
    tipoPermisoNombre: string;
    descripcion: string | null;
    fechaInicial: string;
    fechaFinal: string;
    activo: boolean;
}

export interface MyProfileRecentTripDto {
    viajeId: number;
    codigo: string;
    cliente: string;
    estadoId: number;
    estadoNombre: string;
    fechaCarga: string;
    origen: string;
    destino: string;
    ruta: string;
}

export interface MyProfileDto {
    usuario: MyProfileUsuarioDto;
    colaborador: MyProfileColaboradorDto | null;
    documentos: MyProfileDocumentoDto[];
    licencias: MyProfileLicenciaDto[];
    ausencias: MyProfileAusenciaDto[];
    ultimosViajes: MyProfileRecentTripDto[];
}
