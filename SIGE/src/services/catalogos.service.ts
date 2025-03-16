import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private apiUrl = 'http://localhost:3000/api/catalogos';
  
  // Caché para almacenar catálogos y evitar peticiones repetidas
  private cacheSexos: any[] = [];
  private cacheParentescos: any[] = [];
  private cacheCiudades: any[] = [];
  private cacheDepartamentos: any[] = [];
  private cachePuestos: any[] = [];
  private cacheRoles: any[] = [];

  constructor(private http: HttpClient) { }

  // Obtener catálogo de sexos
  getSexos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sexo`).pipe(
      tap(data => this.cacheSexos = data)
    );
  }

  // Obtener catálogo de parentescos
  getParentescos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/parentesco`).pipe(
      tap(data => this.cacheParentescos = data)
    );
  }

  // Obtener catálogo de ciudades
  getCiudades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ciudad`).pipe(
      tap(data => this.cacheCiudades = data)
    );
  }

  // Obtener catálogo de departamentos
  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departamento`).pipe(
      tap(data => this.cacheDepartamentos = data)
    );
  }

  // Obtener catálogo de puestos
  getPuestos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/puesto`).pipe(
      tap(data => this.cachePuestos = data)
    );
  }

  // Obtener catálogo de roles
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rol`).pipe(
      tap(data => this.cacheRoles = data)
    );
  }

  // Métodos para obtener valores de caché
  getSexoPorId(id: string): any {
    return this.cacheSexos.find(sexo => sexo._id === id);
  }

  getParentescoPorId(id: string): any {
    return this.cacheParentescos.find(parentesco => parentesco._id === id);
  }

  getCiudadPorId(id: string): any {
    return this.cacheCiudades.find(ciudad => ciudad._id === id);
  }

  getDepartamentoPorId(id: string): any {
    return this.cacheDepartamentos.find(depto => depto._id === id);
  }

  getPuestoPorId(id: string): any {
    return this.cachePuestos.find(puesto => puesto._id === id);
  }

  getRolPorId(id: number): any {
    return this.cacheRoles.find(rol => rol.rol === id);
  }
}