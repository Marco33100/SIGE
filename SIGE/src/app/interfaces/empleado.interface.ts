// empleado.ts
export interface FiltrosEmpleado {
    ciudad?: string;
    sexo?: string;
    puesto?: string;
    departamento?: string;
    nombre?: string;
    apellidoP?: string;
    apellidoM?: string;
    fechaNacimiento?: string;
    fechaAlta?: string;
    rol?: string;
  }
  
  export interface ApiResponse {
    exito: boolean;
    empleados: Empleado[];
    total: number;
    mensaje?: string;
  }
  
  export interface Empleado {
    claveEmpleado: string;
    ciudad: string;
    sexo: string;
    puesto: string;
    departamento: string;
    nombre: string;
    apellidoP: string;
    apellidoM: string;
    fechaNacimiento: string;
    fechaAlta: string;
    rol: string;
    activo?: boolean;
  }