import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
      nombreEmpleado: ['', Validators.required],
      apellidoP: ['', Validators.required],
      apellidoM: [''],
      contraseña: ['', Validators.required],
      confirmarContraseña: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      fotoEmpleado: [''],
      rfc: [''],
      departamento: ['', Validators.required],
      puesto: ['', Validators.required],
      rol: ['', Validators.required],
      telefono: this.fb.array([]),
      correoElectronico: this.fb.array([]),
      referenciasFamiliares: this.fb.array([]),
      domicilio: this.fb.group({
        calle: ['', Validators.required],
        numInterior: [''],
        numExterior: [''],
        colonia: ['', Validators.required],
        codigoPostal: ['', Validators.required],
        ciudad: ['', Validators.required]
      })
    });
  }

  // Método para manejar el cambio de archivo para la foto del empleado
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

  // Enviar el formulario
  onSubmit(): void {
    // Verificar si las contraseñas coinciden
    if (this.empleadoForm.value.contraseña !== this.empleadoForm.value.confirmarContraseña) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Eliminar confirmarContraseña de los datos a enviar
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
  get passwordsMismatch(): boolean {
    return this.empleadoForm.get('contraseña')?.value !== 
           this.empleadoForm.get('confirmarContraseña')?.value;
}
}