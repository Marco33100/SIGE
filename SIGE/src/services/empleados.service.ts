import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse, FiltrosEmpleado } from '../app/interface/empleado.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  // URL base de la API - ajusta según tu configuración
  private apiUrl = 'http://localhost:3000/api/empleados';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // CU01: Inicio de sesión - Ya no es necesario aquí ya que está en AuthService
  // Se mantiene por compatibilidad pero debería redirigir al AuthService
  login(claveEmpleado: string, contraseña: string): Observable<any> {
    return this.authService.login(claveEmpleado, contraseña);
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
    // Usar los headers de autenticación desde AuthService
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/personal/${claveEmpleado}`, { headers });
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
    // Intentar obtener primero desde empleadoActual (manera antigua)
    const empleadoGuardado = localStorage.getItem('empleadoActual');
    if (empleadoGuardado) {
      return JSON.parse(empleadoGuardado);
    }
    
    // Si no existe, intentar obtener desde AuthService
    return this.authService.getEmpleadoData();
  }

  // Verificar si hay un empleado logueado
  estaLogueado(): boolean {
    return this.obtenerSesionEmpleado() !== null;
  }

  // Cerrar sesión - sincronizar con AuthService
  cerrarSesion(): void {
    localStorage.removeItem('empleadoActual');
    this.authService.logout(); // También llamar al logout de AuthService
  }
}