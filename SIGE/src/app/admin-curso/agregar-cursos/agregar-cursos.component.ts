import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CursoService } from '../../../services/curso.service';
import Swal from 'sweetalert2'; // Importa SweetAlert2

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
  submitted = false; // Variable para controlar la validación

  constructor(private cursoService: CursoService) { }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarTiposDocumentos();
    this.obtenerCursos();
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
    this.submitted = true; // Activa la validación

    // Verifica si todos los campos obligatorios están llenos
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
        this.mostrarMensajeExito(); // Muestra mensaje de éxito
        this.limpiarFormulario(); // Limpia el formulario
        this.submitted = false; // Restablece la validación
      },
      error: (err) => {
        console.error('Error al agregar curso', err);
        this.mostrarMensajeError(); // Muestra mensaje de error
      }
    });
  }

  mostrarMensajeExito(): void {
    Swal.fire({
      icon: 'success', // Ícono de éxito
      title: '¡Datos guardados!',
      text: 'El curso se ha guardado correctamente.',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'sweetalert-custom', // Clase personalizada para el popup
        confirmButton: 'btn btn-success' // Estilo personalizado para el botón
      }
    });
  }

  mostrarMensajeError(): void {
    Swal.fire({
      icon: 'error', // Ícono de error
      title: 'Error',
      text: 'Hubo un problema al guardar el curso. Inténtalo de nuevo.',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'sweetalert-custom', // Clase personalizada para el popup
        confirmButton: 'btn btn-danger' // Estilo personalizado para el botón
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
}