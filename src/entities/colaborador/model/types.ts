export interface Colaborador {
    colaboradorID: number;
    rolColaboradorID: number;
    tipoGeneroID: number;
    nombres: string;
    primerApellido: string;
    segundoApellido?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    fechaNacimiento?: string;
    fechaIngreso?: string;
    monedaID?: number;
    salario?: number;
    activo: boolean;
    rolColaborador?: { id: number; nombre: string };
    tipoGenero?: { id: number; nombre: string };
    moneda?: { id: number; nombre: string };
}

export interface CreateColaboradorDto {
    rolColaboradorID: number;
    tipoGeneroID: number;
    nombres: string;
    primerApellido: string;
    segundoApellido?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    fechaNacimiento?: string;
    fechaIngreso?: string;
    monedaID?: number;
    salario?: number;
    activo: boolean;
}

export interface ColaboradorParams {
    search?: string;
    rolColaboradorID?: number;
    activo?: boolean;
    page?: number;
    size?: number;
}
