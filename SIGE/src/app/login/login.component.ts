import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../src/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

        // Guardamos el rol del usuario en el localStorage
        if (response.empleado && response.empleado.rol) {
          this.authService.setRolUsuario(response.empleado.rol);
        }

        this.successMessage = response.msg;
        this.router.navigate(['/home']);
      },
      error => {
        this.errorMessage = error.error.message || 'Error en el login';
        console.error('Error en el login', error);
      }
    );
  }
}
