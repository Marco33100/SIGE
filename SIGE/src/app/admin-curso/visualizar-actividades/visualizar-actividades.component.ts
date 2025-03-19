import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad.service';
import { EmpleadoService } from '../../../services/empleados.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-visualizar-actividades',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visualizar-actividades.component.html',
  styleUrl: './visualizar-actividades.component.css'
})
export class VisualizarActividadesComponent implements OnInit {
  actividades: any[] = [];
  filtros: any = {
    estatusActividad: '',
    claveEmpleado: '',
    nomActividad: ''
  };

  estatusList: any[] = [];
  actividadesList: any[] = [];

  resultadosBusqueda: any[] = [];
  busquedaSubject = new Subject<string>();

  constructor(
    private actividadService: ActividadService,
    private empleadoService: EmpleadoService
  ) { }

  ngOnInit(): void {
    this.aplicarFiltros();
    this.cargarEstatus();
    this.cargarActividades();

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

  aplicarFiltros(): void {
    const filtros: any = {};

    if (this.filtros.estatusActividad) {
      filtros.estatusActividad = Number(this.filtros.estatusActividad);
    }

    if (this.filtros.claveEmpleado) {
      filtros.claveEmpleado = this.filtros.claveEmpleado;
    }

    if (this.filtros.nomActividad) {
      filtros.nomActividad = this.filtros.nomActividad;
    }

    this.actividadService.visualizarActividadesConFiltros(filtros).subscribe(data => {
      this.actividades = data.actividades;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      estatusActividad: '',
      claveEmpleado: '',
      nomActividad: ''
    };
    this.aplicarFiltros();
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
    this.filtros.claveEmpleado = empleado.claveEmpleado;
    this.resultadosBusqueda = []; // Limpiar la lista de resultados
  }

  // Función para mapear el estatus
  mapearEstatus(estatus: number): string {
    return estatus === 1 ? 'Participó' : 'No participó';
  }
}