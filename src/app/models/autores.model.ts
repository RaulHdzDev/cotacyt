export interface Autores {
    id_autores: string;
    id_proyectos: string;
    id_sedes: string;
    proyecto: string;
    escuela: string;
    municipio: string;
    localidad: string;
    nombre: string;
    ape_pat: string;
    ape_mat: string;
    telefono: string;
    nivel_ingles: string;
    domicilio: string;
    colonia: string;
    cp: string;
    curp: string;
    rfc: string;
    twitter: string;
    facebook: string;
    email: string;
    sede: string;
}
export interface AutoresSelect {
    id_autores: string;
    nombre: string;
}

export interface AutorIds {
    id_autores: string;
    id_proyectos: string;
    id_municipios: string;
    id_localidades: string;
    id_escuelas: string;
}
