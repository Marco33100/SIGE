import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from '../../../services/empleados.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-buscar-empleado',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './buscar-empleado.component.html',
  styleUrls: ['./buscar-empleado.component.css']
})
export class BuscarEmpleadoComponent implements OnInit {
  // Variables para la búsqueda
  terminoBusqueda: string = '';
  resultados: any[] = [];
  cargando: boolean = false;
  mensaje: string = '';
  empleadoSeleccionado: any = null;
  modoEdicion: boolean = false;
  empleadoEditado: any = null;
  
  // Variables para los diálogos de confirmación
  mostrarDialogoEliminar: boolean = false;
  mostrarDialogoReactivar: boolean = false;
  empleadoAccion: any = null;

  // Subject para controlar el debounce de la búsqueda
  private busquedaSubject = new Subject<string>();

  constructor(private empleadoService: EmpleadoService) { }

  ngOnInit(): void {
    this.busquedaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(termino => {
      this.buscarEmpleados(termino);
    });
  }

  onInputChange(): void {
    if (this.terminoBusqueda.length > 0) {
      this.busquedaSubject.next(this.terminoBusqueda);
    } else {
      this.resultados = [];
      this.mensaje = '';
    }
  }

  buscarEmpleados(termino: string): void {
    this.cargando = true;
    this.mensaje = '';
    
    this.empleadoService.buscarEmpleados(termino).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        
        if (respuesta.exito) {
          this.resultados = respuesta.empleados;
          
          if (this.resultados.length === 0) {
            this.mensaje = 'No se encontraron empleados con ese criterio de búsqueda';
          }
        } else {
          this.mensaje = respuesta.mensaje || 'Error al buscar empleados';
          this.resultados = [];
        }
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje = 'Error al conectar con el servidor';
        console.error('Error en búsqueda:', error);
        this.resultados = [];
      }
    });
  }

  seleccionarEmpleado(empleado: any): void {
    this.empleadoSeleccionado = empleado;
    
    this.empleadoService.obtenerEmpleado(empleado.claveEmpleado).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.empleadoSeleccionado = respuesta.empleado;
        } else {
          this.mensaje = 'Error al obtener detalles del empleado';
        }
      },
      error: (error) => {
        this.mensaje = 'Error al conectar con el servidor';
        console.error('Error al obtener detalles:', error);
      }
    });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.resultados = [];
    this.mensaje = '';
    this.empleadoSeleccionado = null;
  }

  // Métodos para mostrar/ocultar diálogos
  mostrarConfirmacionEliminar(empleado: any): void {
    this.empleadoAccion = empleado;
    this.mostrarDialogoEliminar = true;
  }

  mostrarConfirmacionReactivar(empleado: any): void {
    this.empleadoAccion = empleado;
    this.mostrarDialogoReactivar = true;
  }

  cerrarDialogos(): void {
    this.mostrarDialogoEliminar = false;
    this.mostrarDialogoReactivar = false;
    this.empleadoAccion = null;
  }

  eliminarEmpleado(clave: string): void {
    this.empleadoService.eliminarEmpleado(clave).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.mensaje = 'Empleado eliminado correctamente';
          this.resultados = this.resultados.filter(e => e.claveEmpleado !== clave);
          this.empleadoSeleccionado = null;
        } else {
          this.mensaje = respuesta.mensaje || 'Error al eliminar empleado';
        }
        this.cerrarDialogos();
      },
      error: (error) => {
        this.mensaje = 'Error al conectar con el servidor';
        console.error('Error eliminando:', error);
        this.cerrarDialogos();
      }
    });
  }

  reactivarEmpleado(clave: string): void {
    this.empleadoService.actualizarEmpleado(clave, { activo: true }).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.mensaje = 'Empleado reactivado exitosamente';
          this.empleadoSeleccionado.activo = true;
          this.resultados = this.resultados.map(e => 
            e.claveEmpleado === clave ? { ...e, activo: true } : e
          );
        }
        this.cerrarDialogos();
      },
      error: (error) => {
        this.mensaje = 'Error al reactivar empleado';
        console.error('Error:', error);
        this.cerrarDialogos();
      }
    });
  }
}