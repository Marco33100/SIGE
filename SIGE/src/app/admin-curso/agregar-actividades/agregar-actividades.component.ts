import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad.service';
import { EmpleadoService } from '../../../services/empleados.service'; // Importar el servicio de empleados
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-agregar-actividades',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './agregar-actividades.component.html',
  styleUrls: ['./agregar-actividades.component.css']
})
export class AgregarActividadesComponent implements OnInit {
  actividad: any = {
    claveEmpleado: '',
    nomActividad: '',
    descripcionAct: '',
    estatusActividad: 0
  };

  estatusList: any[] = [];
  actividadesList: any[] = [];
  submitted = false;

  // Variables para la búsqueda progresiva
  resultadosBusqueda: any[] = [];
  busquedaSubject = new Subject<string>();

  constructor(
    private actividadService: ActividadService,
    private empleadoService: EmpleadoService // Inyectar el servicio de empleados
  ) { }

  ngOnInit(): void {
    this.cargarEstatus();
    this.cargarActividades();

    // Configurar la búsqueda progresiva
    this.busquedaSubject.pipe(
      debounceTime(300), // Esperar 300ms después de cada tecla
      distinctUntilChanged() // Evitar búsquedas duplicadas
    ).subscribe(termino => {
      if (termino) {
        this.buscarEmpleadosProgresivo(termino);
      } else {
        this.resultadosBusqueda = [];
      }
    });
  }

  cargarEstatus(): void {
    this.actividadService.obtenerEstatus().subscribe(data => {
      this.estatusList = data;
    });
  }

  cargarActividades(): void {
    this.actividadService.obtenerActividades().subscribe(data => {
      this.actividadesList = data;
    });
  }

  onSubmit(): void {
    this.submitted = true;

    // Verifica si todos los campos están llenos
    if (!this.actividad.claveEmpleado || 
        !this.actividad.nomActividad || 
        !this.actividad.descripcionAct) {
      
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Por favor, completa todos los campos antes de continuar.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.actividadService.agregarActividad(this.actividad).subscribe({
      next: (response) => {
        console.log('Actividad agregada', response);
        this.mostrarMensajeExito();
        this.limpiarFormulario();
        this.submitted = false;
      },
      error: (err) => {
        console.error('Error al agregar actividad', err);
        this.mostrarMensajeError();
      }
    });
  }

  mostrarMensajeExito(): void {
    Swal.fire({
      icon: 'success',
      title: '¡Datos guardados!',
      text: 'La actividad se ha guardado correctamente.',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'sweetalert-custom',
        confirmButton: 'btn btn-success'
      }
    });
  }

  mostrarMensajeError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un problema al guardar la actividad. Inténtalo de nuevo.',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'sweetalert-custom',
        confirmButton: 'btn btn-danger'
      }
    });
  }

  limpiarFormulario(): void {
    this.actividad = {
      claveEmpleado: '',
      nomActividad: '',
      descripcionAct: '',
      estatusActividad: 0
    };
  }

  // Método para manejar cambios en el campo de búsqueda
  onInputChange(event: Event): void {
    const terminoBusqueda = (event.target as HTMLInputElement).value;
    this.busquedaSubject.next(terminoBusqueda);
  }

  // Método para buscar empleados de manera progresiva
  buscarEmpleadosProgresivo(termino: string): void {
    this.empleadoService.buscarEmpleados(termino).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.resultadosBusqueda = respuesta.empleados;
        } else {
          this.resultadosBusqueda = [];
        }
      },
      error: (error) => {
        console.error('Error al buscar empleados:', error);
        this.resultadosBusqueda = [];
      }
    });
  }

  // Método para seleccionar un empleado de la lista
  seleccionarEmpleado(empleado: any): void {
    this.actividad.claveEmpleado = empleado.claveEmpleado;
    this.resultadosBusqueda = []; // Limpiar la lista de resultados
  }

  // Función para mapear el estatus
  mapearEstatus(estatus: number): string {
    return estatus === 1 ? 'Participó' : 'No participó';
  }
}