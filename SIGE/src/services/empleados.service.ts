import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Definir la interfaz Empleado dentro del servicio
interface Empleado {
  claveEmpleado: string;
  nombreEmpleado: string;
  apellidoP: string;
  apellidoM: string;
  fechaNacimiento: string;
  rfc?: string;  // El RFC es opcional
}
@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = 'http://localhost:3000/api/empleados';

  constructor(private http: HttpClient) {}

  // Registrar un nuevo empleado con generación automática de clave y RFC
  registrarEmpleado(empleadoData: any): Observable<any> {
    if (!empleadoData.claveEmpleado) {
      empleadoData.claveEmpleado = this.generarClaveEmpleado(
        empleadoData.nombreEmpleado,
        empleadoData.apellidoP,
        empleadoData.apellidoM
      );
    }

    if (!empleadoData.rfc) {
      empleadoData.rfc = this.generarRFC(
        empleadoData.nombreEmpleado,
        empleadoData.apellidoP,
        empleadoData.apellidoM,
        empleadoData.fechaNacimiento
      );
    }

    return this.http.post(`${this.apiUrl}`, empleadoData);
  }

  // Buscar empleados por clave de empleado
  buscarEmpleados(termino: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar?termino=${termino}`);
  }

  // Obtener detalles de un empleado por clave
  obtenerEmpleado(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${claveEmpleado}`);
  }

  // Listar empleados con paginación
  listarEmpleados(pagina: number = 1, limite: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?pagina=${pagina}&limit=${limite}`);
  }

  // Actualizar empleado
  actualizarEmpleado(claveEmpleado: string, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${claveEmpleado}`, datosActualizados);
  }

  // Obtener información personal del empleado
  obtenerInfoPersonal(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal/${claveEmpleado}`);
  }

  // Eliminar empleado por clave
  eliminarEmpleado(claveEmpleado: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${claveEmpleado}`);
  }

  // Método para generar la clave de empleado (formato: RASG-001)
  generarClaveEmpleado(nombre: string, apellidoP: string, apellidoM: string): string {
    let iniciales = '';
    const nombres = nombre.trim().split(' ');

    if (nombres.length > 0) {
      iniciales += nombres[0].charAt(0).toUpperCase();
    }

    if (apellidoP) {
      iniciales += apellidoP.charAt(0).toUpperCase();
    }

    if (apellidoM) {
      iniciales += apellidoM.charAt(0).toUpperCase();
    }

    return `${iniciales}-001`; // No se puede garantizar el consecutivo sin una consulta a la BD
  }

  // Generar RFC en formato APAM-NNMMDD
  generarRFC(nombre: string, apellidoP: string, apellidoM: string, fechaNacimiento: string): string {
    let rfc = '';

    if (apellidoP) {
      rfc += apellidoP.slice(0, 2).toUpperCase();
    }

    if (apellidoM) {
      rfc += apellidoM.charAt(0).toUpperCase();
    }

    const nombres = nombre.trim().split(' ');
    if (nombres[0]) {
      rfc += nombres[0].charAt(0).toUpperCase();
    }

    rfc += '-';

    if (fechaNacimiento) {
      const fecha = new Date(fechaNacimiento);
      const año = fecha.getFullYear().toString().slice(-2);
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const dia = fecha.getDate().toString().padStart(2, '0');

      rfc += `${año}${mes}${dia}`;
    }

    return rfc;
  }

 // Obtiene el último consecutivo usado para generar una nueva clave de empleado
obtenerUltimaClaveConIniciales(iniciales: string): Observable<string | null> {
  return this.listarEmpleados(1, 1000).pipe(
    map((response: any) => {
      const empleados: Empleado[] = response.empleados || [];  // Aseguramos que 'empleados' es de tipo Empleado[]
      const claveEmpleado = empleados
        .filter((emp: Empleado) => emp.claveEmpleado.startsWith(iniciales)) // Se aplica el tipo 'Empleado' a 'emp'
        .map(emp => emp.claveEmpleado)
        .sort()
        .pop();  // Toma el último elemento (el de mayor valor)

      return claveEmpleado || null;  // Devuelve el último consecutivo o null si no se encontró
    }),
    catchError(() => {
      // En caso de error, devolver null
      return of(null);
    })
  );
}

}


