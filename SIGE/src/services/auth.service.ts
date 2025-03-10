import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Asegúrate de que el servicio sea global
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/empleados/login'; // URL del backend

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const body = { claveEmpleado: username, contraseña: password };  // Usa los nombres correctos
    return this.http.post<any>(this.apiUrl, body);
  }
  
}
