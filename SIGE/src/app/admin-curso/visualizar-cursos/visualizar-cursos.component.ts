import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../../services/curso.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../../services/empleados.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-visualizar-cursos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visualizar-cursos.component.html',
  styleUrl: './visualizar-cursos.component.css'
})
export class VisualizarCursosComponent implements OnInit {
  cursos: any[] = [];
  filtros: any = {
    fechaInicio: '',
    fechaTermino: '',
    tipoDocumento: '',
    especialidad: '',
    claveEmpleado: ''
  };

  especialidadesList: any[] = [];
  documentosList: any[] = [];

  // Variables para la búsqueda progresiva
  resultadosBusqueda: any[] = [];
  busquedaSubject = new Subject<string>();

  constructor(
    private cursoService: CursoService,
    private empleadoService: EmpleadoService // Inyectar el servicio de empleados
  ) { }

  ngOnInit(): void {
    this.aplicarFiltros();
    this.cargarEspecialidades();
    this.cargarTiposDocumentos();

    // Configurar el debounce para la búsqueda progresiva
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

  aplicarFiltros(): void {
    this.cursoService.visualizarCursosConFiltros(this.filtros).subscribe(data => {
      this.cursos = data.cursos;
    });
  }

  cargarEspecialidades(): void {
    this.cursoService.obtenerEspecialidades().subscribe(data => {
      this.especialidadesList = data;
    });
  }

  cargarTiposDocumentos(): void {
    this.cursoService.obtenerTiposDocumentos().subscribe(data => {
      this.documentosList = data;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: '',
      fechaTermino: '',
      tipoDocumento: '',
      especialidad: '',
      claveEmpleado: ''
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
}