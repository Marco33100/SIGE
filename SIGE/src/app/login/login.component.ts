import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../src/services/auth.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.animateElements();
  }

  animateElements(): void {
    // Animación para el título
    gsap.from('h1', {
      duration: 1,
      opacity: 0,
      y: -50,
      ease: 'power2.out',
    });

    // Animación para el contenedor del formulario
    gsap.from('.animate-slide-up', {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: 'power2.out',
      delay: 0.5, // Retraso para que aparezca después del título
    });
  }

  onLogin(): void {
    console.log('Datos enviados:', { claveEmpleado: this.username, contraseña: this.password });

    this.authService.login(this.username, this.password).subscribe(
      response => {
        console.log('Login exitoso', response);

        // Guardar el token y el rol en el localStorage
        if (response.token && response.empleado) {
          this.authService.setToken(response.token);
          this.authService.setRolUsuario(response.empleado.rol);
        }

        this.successMessage = response.msg;
        this.router.navigate(['/home']); // Redirigir al home después del login
      },
      error => {
        this.errorMessage = error.error.msg || 'Error en el login';
        console.error('Error en el login', error);

        // Animación de error (opcional)
        gsap.from('.text-red-500', {
          duration: 0.5,
          opacity: 0,
          y: -10,
          ease: 'power2.out',
        });
      }
    );
  }
}