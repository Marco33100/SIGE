import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/empleados/login';

  constructor(private http: HttpClient) { }

  // Añade este método a tu AuthService
getEmpleadoData(): any {
  const data = localStorage.getItem('empleadoData');
  return data ? JSON.parse(data) : null;
}

// Añadir este método también
setEmpleadoData(empleado: any): void {
  localStorage.setItem('empleadoData', JSON.stringify(empleado));
}

  // Método para iniciar sesión
  login(username: string, password: string): Observable<any> {
    const body = { claveEmpleado: username, contraseña: password };
    return this.http.post<any>(this.apiUrl, body).pipe(
      tap(response => {
        // Guardar el token y el rol en el localStorage
        if (response.token && response.empleado) {
          this.setToken(response.token);
          this.setRolUsuario(response.empleado.rol);
          this.setEmpleadoData(response.empleado); // Añadido para guardar los datos del empleado
        }
      })
    );
  }
  // Guardar el token en el localStorage
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Obtener el token desde el localStorage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Guardar el rol del usuario en el localStorage
  setRolUsuario(rol: number): void {
    localStorage.setItem('usuarioRol', rol.toString());
  }

  // Obtener el rol del usuario desde el localStorage
  getRolUsuario(): number {
    const rol = localStorage.getItem('usuarioRol');
    return rol ? parseInt(rol, 10) : 0; // Devuelve 0 si no se encuentra
  }

  // Eliminar el token y el rol al cerrar sesión
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuarioRol');
  }

  // Método para crear headers con el token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}