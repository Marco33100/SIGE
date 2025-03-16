export interface Actividad {
    claveEmpleado: string;
    nomActividad: string;
    descripcionAct: string;
    estatusActividad: number;
}

export interface Curso {
    claveEmpleado: string;
    nomCurso: string;
    fechaInicio: Date;
    fechaTermino: Date;
    tipoDocumento: string;
    descripcionCurso: string;
    especialidad: string;
}
