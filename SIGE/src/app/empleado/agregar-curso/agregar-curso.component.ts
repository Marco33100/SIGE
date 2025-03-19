import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CursoService } from '../../../services/curso.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-curso',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './agregar-curso.component.html',
  styleUrl: './agregar-curso.component.css'
})
export class AgregarCursoComponent implements OnInit {
  curso: any = {
    nomCurso: '',
    fechaInicio: new Date(),
    fechaTermino: new Date(),
    tipoDocumento: '',
    descripcionCurso: '',
    especialidad: ''
  };

  especialidadesList: any[] = [];
  documentosList: any[] = [];
  submitted = false;

  constructor(private cursoService: CursoService) { }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarTiposDocumentos();
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

  onSubmit(): void {
    this.submitted = true;

    if (
      !this.curso.nomCurso || 
      !this.curso.fechaInicio || 
      !this.curso.fechaTermino || 
      !this.curso.tipoDocumento || 
      !this.curso.especialidad || 
      !this.curso.descripcionCurso
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Por favor, completa todos los campos antes de continuar.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.cursoService.agregarCursoEmpleado(this.curso).subscribe({
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
      nomCurso: '',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
      tipoDocumento: '',
      descripcionCurso: '',
      especialidad: ''
    };
  }
}