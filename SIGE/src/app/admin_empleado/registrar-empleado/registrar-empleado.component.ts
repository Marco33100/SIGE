import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpleadoService } from '../../../services/empleados.service';

@Component({
  selector: 'app-registrar-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-empleado.component.html',
  styleUrl: './registrar-empleado.component.css'
})
export class RegistrarEmpleadoComponent {
  empleadoForm: FormGroup;
  previewImage: string | ArrayBuffer | null = null;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private router: Router
  ) {
    this.empleadoForm = this.fb.group({
      nombreEmpleado: [''],
      apellidoP: [''],
      apellidoM: [''],
      contraseña: [''],
      confirmarContraseña: [''],
      fechaNacimiento: [''],
      sexo: [''],
      fotoEmpleado: [''],
      rfc: [''],
      departamento: [''],
      puesto: [''],
      rol: [''],
      domicilio: this.fb.group({
        calle: [''],
        numInterior: [''],
        numExterior: [''],
        colonia: [''],
        codigoPostal: [''],
        ciudad: ['']
      })
    });
  }

  // Method to handle file input change for employee photo
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
        this.empleadoForm.patchValue({
          fotoEmpleado: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Submit the form
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Remove confirmarContraseña from the data to be sent
    const formData = { ...this.empleadoForm.value };
    delete formData.confirmarContraseña;

    this.empleadoService.registrarEmpleado(formData).subscribe(
      (response) => {
        this.successMessage = 'Empleado registrado exitosamente';
        this.submitted = false;
        this.empleadoForm.reset();
        this.previewImage = null;
        
        setTimeout(() => {
          this.router.navigate(['/empleados']);
        }, 2000);
      },
      (error) => {
        this.errorMessage = error.error.mensaje || 'Error al registrar empleado';
        this.submitted = false;
      }
    );
  }
}