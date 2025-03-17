import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../../services/empleados.service';

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

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.cargarDatosEmpleado();
  }

  cargarDatosEmpleado(): void {
    const empleadoActual = this.empleadoService.obtenerSesionEmpleado();
    
    if (!empleadoActual || !empleadoActual.claveEmpleado) {
      this.error = 'No se encontró información de sesión. Por favor, inicie sesión nuevamente.';
      this.loading = false;
      return;
    }

    this.empleadoService.obtenerInfoPersonal(empleadoActual.claveEmpleado).subscribe({
      next: (response) => {
        this.empleado = response.datos;
        this.loading = false;
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