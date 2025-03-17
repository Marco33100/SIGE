import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso } from '../app/interface/cursosActividades.interface';

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

  obtenerCursos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cursos`);
  }

  //Visualizar cursos con filtros CU08
  visualizarCursosConFiltros(filtros: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/visualizarCursos`, { params: filtros });
  }

  // CU07: Buscar empleado para gestionar cursos y actividades
  buscarEmpleado(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscarE/${claveEmpleado}`);
  }

  // CUI14: Mostrar opciones "Actividades" o "Cursos"
  obtenerOpciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/opciones`);
  }

  // CUE12: Visualizar cursos del empleado
  visualizarCursosEmpleado(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/visualizarCursosEmpleado/${claveEmpleado}`);
  }

  // CUE13: Visualizar actividades del empleado
  visualizarActividadesEmpleado(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/visualizarActividadesEmpleado/${claveEmpleado}`);
  }

  // CUE14: Editar cursos del empleado
  editarCursoEmpleado(id: string, curso: Curso): Observable<any> {
    return this.http.put(`${this.apiUrl}/editarCursoEmpleado/${id}`, curso);
  }

  // CUE15: Editar actividades del empleado
  editarActividadEmpleado(id: string, actividad: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/editarActividadEmpleado/${id}`, actividad);
  }

  // CUE16: Eliminar cursos del empleado
  eliminarCursoEmpleado(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarCursoEmpleado/${id}`);
  }

  // CUE17: Eliminar actividades del empleado
  eliminarActividadEmpleado(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarActividadEmpleado/${id}`);
  }

  obtenerInformacionPersonal(claveEmpleado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal/${claveEmpleado}`)
  }

}