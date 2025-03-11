import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Necesario para realizar acciones secundarias

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/empleados/login';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const body = { claveEmpleado: username, contraseña: password };
    return this.http.post<any>(this.apiUrl, body).pipe(
      tap(response => {
        // Verifica que la respuesta tenga el rol y guárdalo en localStorage
        if (response.empleado && response.empleado.rol) {
          this.setRolUsuario(response.empleado.rol);
        }
      })
    );
  }

  // Guarda el rol del usuario en el localStorage
  setRolUsuario(rol: number): void {
    localStorage.setItem('usuarioRol', rol.toString());
    console.log('Rol guardado en localStorage:', rol); // Verifica que el rol se guarda
  }

  // Recupera el rol del usuario desde el localStorage
  getRolUsuario(): number {
    const rol = localStorage.getItem('usuarioRol');
    return rol ? parseInt(rol, 10) : 0; // Devuelve 0 si no se encuentra en el localStorage
  }

  // Elimina el rol del usuario del localStorage al cerrar sesión
  logout(): void {
    localStorage.removeItem('usuarioRol');
    console.log('Rol eliminado de localStorage');
  }
}
