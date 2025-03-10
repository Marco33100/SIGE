import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Cambia HttpClientModule por CommonModule
import { FormsModule } from '@angular/forms';  // Importa FormsModule
import { AuthService } from '../../../src/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Agrega FormsModule aquí
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    console.log('Datos enviados:', { claveEmpleado: this.username, contraseña: this.password });
    this.authService.login(this.username, this.password).subscribe(
      response => {
        console.log('Login exitoso', response);
        this.successMessage = response.message;
        this.router.navigate(['/inicio']);
      },
      error => {
        this.errorMessage = error.error.message || 'Error en el login';
        console.error('Error en el login', error);
      }
    );
  }
}
