import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad.service';
import Swal from 'sweetalert2'; // Importa SweetAlert2

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

  constructor(private actividadService: ActividadService) { }

  ngOnInit(): void {
    this.cargarEstatus();
    this.cargarActividades();
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

  submitted = false; // Variable para controlar la validación

  onSubmit(): void {
    this.submitted = true; // Activa la validación
  
    // Verifica si todos los campos están llenos
    if (!this.actividad.claveEmpleado || 
        !this.actividad.nomActividad || 
        !this.actividad.descripcionAct || 
        !this.actividad.estatusActividad) {
      
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
        this.mostrarMensajeExito(); // Muestra mensaje de éxito
        this.limpiarFormulario(); // Limpia el formulario
        this.submitted = false; // Restablece la validación
      },
      error: (err) => {
        console.error('Error al agregar actividad', err);
        this.mostrarMensajeError(); // Muestra mensaje de error
      }
    });
  }
  

  mostrarMensajeExito(): void {
    Swal.fire({
      icon: 'success', // Ícono de éxito
      title: '¡Datos guardados!',
      text: 'La actividad se ha guardado correctamente.',
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
      text: 'Hubo un problema al guardar la actividad. Inténtalo de nuevo.',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'sweetalert-custom', // Clase personalizada para el popup
        confirmButton: 'btn btn-danger' // Estilo personalizado para el botón
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
}