import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad } from '../app/interfaces/cursosActividades.interface';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private apiUrl = 'http://localhost:3000/api/actividades';


  constructor(private http: HttpClient) { }

  agregarActividad(actividad: Actividad): Observable<any> {
    return this.http.post(`${this.apiUrl}/agregarActividadEmpleado`, actividad);
  }

  obtenerEstatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estatus`);
  }

  obtenerActividades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/actividades`);
  }
}