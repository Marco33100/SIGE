import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../../services/empleados.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-visualizar-datos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-datos.component.html',
  styleUrl: './visualizar-datos.component.css'
})
export class VisualizarDatosComponent implements OnInit {
  empleado: any = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosEmpleado();
  }

  cargarDatosEmpleado(): void {
    // Intentamos obtener los datos del empleado desde el servicio de Auth
    const empleadoData = this.authService.getEmpleadoData();
    
    // Si no hay datos en AuthService, intentamos desde el servicio de Empleado
    let empleadoActual = empleadoData || this.empleadoService.obtenerSesionEmpleado();
    
    console.log('Datos del empleado encontrados:', empleadoActual);

    if (!empleadoActual || !empleadoActual.claveEmpleado) {
      this.error = 'No se encontró información de sesión. Por favor, inicie sesión nuevamente.';
      this.loading = false;
      
      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
      
      return;
    }

    // Asegurarse de tener el token antes de hacer la petición
    const token = this.authService.getToken();
    if (!token) {
      this.error = 'No se encontró token de autenticación. Por favor, inicie sesión nuevamente.';
      this.loading = false;
      return;
    }

    this.empleadoService.obtenerInfoPersonal(empleadoActual.claveEmpleado).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response && response.empleado) {
          this.empleado = response.empleado;
          this.loading = false;
        } else {
          this.error = 'No se recibieron datos válidos del servidor.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del empleado:', err);
        this.error = 'No se pudieron cargar los datos. Por favor, intente nuevamente más tarde.';
        this.loading = false;
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';
    
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}