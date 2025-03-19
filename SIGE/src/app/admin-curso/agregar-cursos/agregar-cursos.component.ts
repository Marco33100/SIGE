import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CursoService } from '../../../services/curso.service';
import { EmpleadoService } from '../../../services/empleados.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-agregar-cursos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './agregar-cursos.component.html',
  styleUrls: ['./agregar-cursos.component.css']
})
export class AgregarCursosComponent implements OnInit {
  curso: any = {
    claveEmpleado: '',
    nomCurso: '',
    fechaInicio: new Date(),
    fechaTermino: new Date(),
    tipoDocumento: '',
    descripcionCurso: '',
    especialidad: ''
  };

  especialidadesList: any[] = [];
  documentosList: any[] = [];
  cursosList: any[] = [];
  submitted = false;

  resultadosBusqueda: any[] = [];
  busquedaSubject = new Subject<string>();

  constructor(private cursoService: CursoService, private empleadoService: EmpleadoService) { }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarTiposDocumentos();
    this.obtenerCursos();

    this.busquedaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged() 
    ).subscribe(termino => {
      if (termino) {
        this.buscarEmpleadosProgresivo(termino);
      } else {
        this.resultadosBusqueda = [];
      }
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

  obtenerCursos(): void {
    this.cursoService.obtenerCursos().subscribe(data => {
      this.cursosList = data;
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.curso.claveEmpleado || 
        !this.curso.nomCurso || 
        !this.curso.fechaInicio || 
        !this.curso.fechaTermino || 
        !this.curso.tipoDocumento || 
        !this.curso.especialidad || 
        !this.curso.descripcionCurso) {
      
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Por favor, completa todos los campos antes de continuar.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.cursoService.agregarCurso(this.curso).subscribe({
      next: (response) => {
        console.log('Curso agregado', response);
        this.mostrarMensajeExito();
        this.limpiarFormulario();
        this.submitted = false;
      },
      error: (err) => {
        console.error('Error al agregar curso', err);
        this.mostrarMensajeError();
      }
    });
  }

  mostrarMensajeExito(): void {
    Swal.fire({
      icon: 'success',
      title: '¡Datos guardados!',
      text: 'El curso se ha guardado correctamente.',
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
      text: 'Hubo un problema al guardar el curso. Inténtalo de nuevo.',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'sweetalert-custom',
        confirmButton: 'btn btn-danger'
      }
    });
  }

  limpiarFormulario(): void {
    this.curso = {
      claveEmpleado: '',
      nomCurso: '',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
      tipoDocumento: '',
      descripcionCurso: '',
      especialidad: ''
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

  seleccionarEmpleado(empleado: any): void {
    this.curso.claveEmpleado = empleado.claveEmpleado;
    this.resultadosBusqueda = []; // Limpiar la lista de resultados
  }
}