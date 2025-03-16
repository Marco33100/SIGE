import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../../services/curso.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs/operators'; // Importa switchMap


@Component({
  selector: 'app-buscar-empleado-curso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  templateUrl: './buscar-empleado-curso.component.html',
  styleUrl: './buscar-empleado-curso.component.css'
})
export class BuscarEmpleadoCursoComponent implements OnInit {
  formularioBusqueda: FormGroup;
  tipoOpcion: string = 'cursos';
  empleadoSeleccionado: any = null;
  cursos: any[] = [];
  actividades: any[] = [];
  cargando: boolean = false;
  datosPersonales: any = null;
  
  // Para edición
  formularioEdicion: FormGroup;
  editando: boolean = false;
  idItemActual: string = '';

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
  ) {
    this.formularioBusqueda = this.fb.group({
      terminoBusqueda: ['', Validators.required],
      tipo: ['cursos'] // Por defecto, cursos
    });
    
    this.formularioEdicion = this.fb.group({
      // Campos para cursos
      fechaInicio: [''],
      fechaTermino: [''],
      tipoDocumento: [''],
      descripcionCurso: [''],
      especialidad: [''],
      
      // Campos para actividades
      descripcionAct: [''],
      estatusActividad: ['']
    });
  }

  especialidadesList: any[] = [];
  documentosList: any[] = [];
  submitted = false; // Variable para controlar la validación



  ngOnInit(): void {
    this.cargarDocumentos();
    this.cargarEspecialidades();
  }
  
  cargarDocumentos(): void {
    this.cursoService.obtenerTiposDocumentos().subscribe({
      next: (data) => {
        this.documentosList = data;
      },
      error: (error) => {
        Swal.fire('Error', 'Error al cargar tipos de documentos: ' + (error.error?.msg || 'Error desconocido'), 'error');
      }
    });
  }
  
  cargarEspecialidades(): void {
    this.cursoService.obtenerEspecialidades().subscribe({
      next: (data) => {
        this.especialidadesList = data;
      },
      error: (error) => {
        Swal.fire('Error', 'Error al cargar especialidades: ' + (error.error?.msg || 'Error desconocido'), 'error');
      }
    });
  }


  buscarEmpleado(): void {
    this.cargando = true;
    this.empleadoSeleccionado = null;
    this.datosPersonales = null; // Reiniciar los datos personales
  
    const terminoBusqueda = this.formularioBusqueda.get('terminoBusqueda')?.value;
    if (!terminoBusqueda) {
      Swal.fire('Error', 'Por favor ingrese una clave de empleado', 'error');
      this.cargando = false;
      return;
    }
  
    // Buscar empleado y luego obtener información personal
    this.cursoService.buscarEmpleado(terminoBusqueda).pipe(
      switchMap((respuesta) => {
        if (respuesta) {
          this.empleadoSeleccionado = respuesta;
  
          // Obtener información personal del empleado
          return this.cursoService.obtenerInformacionPersonal(terminoBusqueda);
        } else {
          Swal.fire('Error', 'No se encontraron empleados', 'error');
          this.cargando = false;
          throw new Error('No se encontraron empleados');
        }
      })
    ).subscribe({
      next: (respuestaPersonal) => {
        this.datosPersonales = respuestaPersonal.datosPersonales; // Asignar los datos personales
        this.cargando = false;
  
        // Cargar cursos o actividades según el tipo seleccionado
        this.tipoOpcion = this.formularioBusqueda.get('tipo')?.value || 'cursos';
        if (this.tipoOpcion === 'cursos') {
          this.cargarCursosEmpleado(this.empleadoSeleccionado.claveEmpleado);
        } else {
          this.cargarActividadesEmpleado(this.empleadoSeleccionado.claveEmpleado);
        }
      },
      error: (error) => {
        Swal.fire('Error', 'Error al obtener información personal: ' + (error.error?.msg || 'Error desconocido'), 'error');
        this.cargando = false;
      },
    });
  }

  cargarCursosEmpleado(idEmpleado: string): void {
    this.cargando = true;
    this.cursos = [];
    this.cursoService.visualizarCursosEmpleado(idEmpleado).subscribe({
      next: (respuesta) => {
        this.cursos = respuesta || [];
        this.cargando = false;
      },
      error: (error) => {
        Swal.fire('Error', 'Error al cargar cursos: ' + (error.error?.msg || 'Error desconocido'), 'error');
        this.cargando = false;
      }
    });
  }

  cargarActividadesEmpleado(idEmpleado: string): void {
    this.cargando = true;
    this.actividades = [];
    this.cursoService.visualizarActividadesEmpleado(idEmpleado).subscribe({
      next: (respuesta) => {
        this.actividades = respuesta || [];
        this.cargando = false;
      },
      error: (error) => {
        Swal.fire('Error', 'Error al cargar actividades: ' + (error.error?.msg || 'Error desconocido'), 'error');
        this.cargando = false;
      }
    });
  }

  prepararEdicionCurso(curso: any): void {
    this.editando = true;
    this.idItemActual = curso._id;
    
    this.formularioEdicion.patchValue({
      fechaInicio: this.formatearFechaParaInput(curso.fechaInicio),
      fechaTermino: this.formatearFechaParaInput(curso.fechaTermino),
      tipoDocumento: curso.tipoDocumento,
      descripcionCurso: curso.descripcionCurso,
      especialidad: curso.especialidad
    });
  }

  prepararEdicionActividad(actividad: any): void {
    this.editando = true;
    this.idItemActual = actividad._id;
    
    this.formularioEdicion.patchValue({
      descripcionAct: actividad.descripcionAct,
      estatusActividad: actividad.estatusActividad.toString()
    });
  }

  formatearFechaParaInput(fechaString: string): string {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    return fecha.toISOString().substring(0, 10);
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.idItemActual = '';
    this.formularioEdicion.reset();
  }

  guardarCurso(): void {
    if (this.idItemActual) {
      const datosCurso = {
        claveEmpleado: this.empleadoSeleccionado.claveEmpleado,
        nomCurso: this.formularioEdicion.get('descripcionCurso')?.value || '',
        fechaInicio: this.formularioEdicion.get('fechaInicio')?.value,
        fechaTermino: this.formularioEdicion.get('fechaTermino')?.value,
        tipoDocumento: this.formularioEdicion.get('tipoDocumento')?.value,
        descripcionCurso: this.formularioEdicion.get('descripcionCurso')?.value,
        especialidad: this.formularioEdicion.get('especialidad')?.value
      };
      
      this.cargando = true;
      this.cursoService.editarCursoEmpleado(this.idItemActual, datosCurso).subscribe({
        next: (respuesta) => {
          Swal.fire('Éxito', 'Curso actualizado exitosamente', 'success');
          this.cargarCursosEmpleado(this.empleadoSeleccionado.claveEmpleado);
          this.cancelarEdicion();
          this.cargando = false;
        },
        error: (error) => {
          Swal.fire('Error', 'Error al actualizar curso: ' + (error.error?.msg || 'Error desconocido'), 'error');
          this.cargando = false;
        }
      });
    }
  }

  guardarActividad(): void {
    if (this.idItemActual) {
      const datosActividad = {
        descripcionAct: this.formularioEdicion.get('descripcionAct')?.value,
        estatusActividad: this.formularioEdicion.get('estatusActividad')?.value
      };
      
      this.cargando = true;
      this.cursoService.editarActividadEmpleado(this.idItemActual, datosActividad).subscribe({
        next: (respuesta) => {
          Swal.fire('Éxito', 'Actividad actualizada exitosamente', 'success');
          this.cargarActividadesEmpleado(this.empleadoSeleccionado.claveEmpleado);
          this.cancelarEdicion();
          this.cargando = false;
        },
        error: (error) => {
          Swal.fire('Error', 'Error al actualizar actividad: ' + (error.error?.msg || 'Error desconocido'), 'error');
          this.cargando = false;
        }
      });
    }
  }

  eliminarCurso(idCurso: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¿Desea eliminar este curso?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.cursoService.eliminarCursoEmpleado(idCurso).subscribe({
          next: (respuesta) => {
            Swal.fire('Éxito', 'Curso eliminado exitosamente', 'success');
            this.cargarCursosEmpleado(this.empleadoSeleccionado.claveEmpleado);
            this.cargando = false;
          },
          error: (error) => {
            Swal.fire('Error', 'Error al eliminar curso: ' + (error.error?.msg || 'Error desconocido'), 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  eliminarActividad(idActividad: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¿Desea eliminar esta actividad?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.cursoService.eliminarActividadEmpleado(idActividad).subscribe({
          next: (respuesta) => {
            Swal.fire('Éxito', 'Actividad eliminada exitosamente', 'success');
            this.cargarActividadesEmpleado(this.empleadoSeleccionado.claveEmpleado);
            this.cargando = false;
          },
          error: (error) => {
            Swal.fire('Error', 'Error al eliminar actividad: ' + (error.error?.msg || 'Error desconocido'), 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  reiniciar(): void {
    this.formularioBusqueda.reset({ tipo: 'cursos' });
    this.empleadoSeleccionado = null;
    this.cursos = [];
    this.actividades = [];
    this.editando = false;
    this.idItemActual = '';
    this.formularioEdicion.reset();
  }
}