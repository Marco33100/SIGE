import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { ApiResponse, Empleado, FiltrosEmpleado } from '../app/interfaces/empleado.interface'

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  // URL base de la API - ajusta según tu configuración
  private apiUrl = 'http://localhost:3000/api/empleados';

  constructor(private http: HttpClient) { }

  // CU01: Inicio de sesión
  login(claveEmpleado: string, contraseña: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { claveEmpleado, contraseña });
  }

  // CU02: Registrar un nuevo empleado
  registrarEmpleado(empleadoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, empleadoData);
  }

  // CU03: Búsqueda progresiva de empleados por clave (autocompletado)
  buscarEmpleados(termino: string): Observable<any> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  // Obtener detalles completos de un empleado específico
  obtenerEmpleado(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${claveEmpleado}`);
  }

  // CU04: Listar empleados con datos importantes
  listarEmpleados(
    page: number = 1,
    limit: number = 10,
    filtros: FiltrosEmpleado = {}
  ): Observable<ApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Filtrado con validación de tipos
    (Object.keys(filtros) as Array<keyof FiltrosEmpleado>).forEach(key => {
      const valor = filtros[key];
      if (valor !== null && valor !== undefined && valor !== '') {
        params = params.set(key as string, valor.toString());
      }
    });

    return this.http.get<ApiResponse>(`${this.apiUrl}/listar`, { params });
  }


  // CU10: Editar datos del empleado
  actualizarEmpleado(claveEmpleado: string, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${claveEmpleado}`, datosActualizados);
  }

  // CU11: Consultar información personal del empleado
  obtenerInfoPersonal(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal/${claveEmpleado}`);
  }

  // CU12: Eliminar empleados (eliminación lógica)
  eliminarEmpleado(claveEmpleado: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${claveEmpleado}`);
  }
  
  // Método auxiliar para almacenar la información del empleado actualmente logueado
  guardarSesionEmpleado(datosEmpleado: any): void {
    localStorage.setItem('empleadoActual', JSON.stringify(datosEmpleado));
  }

  // Obtener datos del empleado logueado desde localStorage
  obtenerSesionEmpleado(): any {
    const empleadoGuardado = localStorage.getItem('empleadoActual');
    return empleadoGuardado ? JSON.parse(empleadoGuardado) : null;
  }

  // Verificar si hay un empleado logueado
  estaLogueado(): boolean {
    return localStorage.getItem('empleadoActual') !== null;
  }

  // Cerrar sesión
  cerrarSesion(): void {
    localStorage.removeItem('empleadoActual');
  }

}