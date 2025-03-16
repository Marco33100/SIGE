import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso } from '../app/interfaces/cursosActividades.interface';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = 'http://localhost:3000/api/cursos';

  constructor(private http: HttpClient) { }

  agregarCurso(curso: Curso): Observable<any> {
    return this.http.post(`${this.apiUrl}/agregarCursoEmpleado`, curso);
  }

  obtenerEspecialidades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/especialidades`);
  }

  obtenerTiposDocumentos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/documentos`);
  }

  obtenerCursos(): Observable<any>{
    return this.http.get(`${this.apiUrl}/cursos`);
  }
}