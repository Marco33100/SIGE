import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad } from '../app/interface/cursosActividades.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private apiUrl = 'http://localhost:3000/api/actividades';


  constructor(private http: HttpClient,
    private authService: AuthService
  ) { }

  agregarActividad(actividad: Actividad): Observable<any> {
    return this.http.post(`${this.apiUrl}/agregarActividadEmpleado`, actividad);
  }

  obtenerEstatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estatus`);
  }

  obtenerActividades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/actividades`);
  }

  //CU09 Visualizar actividades con filtros
  visualizarActividadesConFiltros(filtros: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/visualizarActividades`, { params: filtros });
  }

    // Nuevo método para visualizar actividades del empleado autenticado
    visualizarActividadesEmpleado(filtros: any = {}): Observable<any> {
      return this.http.get(`${this.apiUrl}/visualizarActividadesE`, { 
        headers: this.authService.getAuthHeaders(),
        params: filtros 
      });
    }
}
