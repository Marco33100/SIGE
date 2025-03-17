import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmpleadoService } from '../../../services/empleados.service';
import { CatalogosService } from '../../../services/catalogos.service';

@Component({
  selector: 'app-registrar-empleado',
  templateUrl: './registrar-empleado.component.html',
  styleUrls: ['./registrar-empleado.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})

export class RegistrarEmpleadoComponent implements OnInit {
  empleadoForm!: FormGroup;
  catalogos: any = {};
  loading = true;
  previewImage: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private catalogosService: CatalogosService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private initForm(): void {
    this.empleadoForm = this.fb.group({
      nombreEmpleado: ['', [Validators.required, Validators.maxLength(50)]],
      apellidoP: ['', [Validators.required, Validators.maxLength(30)]],
      apellidoM: ['', [Validators.maxLength(30)]],
      contraseña: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContraseña: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      fotoEmpleado: [''],
      departamento: ['', Validators.required],
      puesto: ['', Validators.required],
      rol: ['', Validators.required],
      telefono: this.fb.array([this.crearTelefono()]),
      correoElectronico: this.fb.array([this.crearCorreo()]),
      referenciasFamiliares: this.fb.array([]),
      domicilio: this.fb.group({
        calle: ['', [Validators.required, Validators.maxLength(50)]],
        numInterior: [''],
        numExterior: [''],
        colonia: ['', [Validators.required, Validators.maxLength(30)]],
        codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        ciudad: ['', Validators.required]
      })
    });
  }

  private cargarCatalogos(): void {
    forkJoin({
      sexo: this.catalogosService.getSexos(),
      parentescos: this.catalogosService.getParentescos(),
      ciudades: this.catalogosService.getCiudades(),
      departamentos: this.catalogosService.getDepartamentos(),
      puestos: this.catalogosService.getPuestos(),
      roles: this.catalogosService.getRoles()
    }).subscribe({
      next: (data) => {
        this.catalogos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando catálogos:', error);
        this.loading = false;
      }
    });
  }

  // Métodos para teléfonos
  get telefonos(): FormArray {
    return this.empleadoForm.get('telefono') as FormArray;
  }

  crearTelefono(): FormGroup {
    return this.fb.group({
      numero: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  agregarTelefono(): void {
    this.telefonos.push(this.crearTelefono());
  }

  eliminarTelefono(index: number): void {
    this.telefonos.removeAt(index);
  }

  // Métodos para correos
  get correos(): FormArray {
    return this.empleadoForm.get('correoElectronico') as FormArray;
  }

  crearCorreo(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]]
    });
  }

  agregarCorreo(): void {
    this.correos.push(this.crearCorreo());
  }

  eliminarCorreo(index: number): void {
    this.correos.removeAt(index);
  }

  // Métodos para referencias familiares
  get referencias(): FormArray {
    return this.empleadoForm.get('referenciasFamiliares') as FormArray;
  }

  crearReferencia(): FormGroup {
    return this.fb.group({
      nomCompleto: ['', [Validators.required, Validators.maxLength(70)]],
      parentesco: ['', [Validators.required, Validators.maxLength(20)]],
      telefono: this.fb.array([this.crearTelefono()]),
      correo: this.fb.array([this.crearCorreo()])
    });
  }

  agregarReferencia(): void {
    this.referencias.push(this.crearReferencia());
  }

  eliminarReferencia(index: number): void {
    this.referencias.removeAt(index);
  }

  telefonosReferencia(index: number): FormArray {
    return this.referencias.at(index).get('telefono') as FormArray;
  }

  agregarTelefonoReferencia(refIndex: number): void {
    this.telefonosReferencia(refIndex).push(this.crearTelefono());
  }

  eliminarTelefonoReferencia(refIndex: number, telIndex: number): void {
    this.telefonosReferencia(refIndex).removeAt(telIndex);
  }

  correosReferencia(index: number): FormArray {
    return this.referencias.at(index).get('correo') as FormArray;
  }

  agregarCorreoReferencia(refIndex: number): void {
    this.correosReferencia(refIndex).push(this.crearCorreo());
  }

  eliminarCorreoReferencia(refIndex: number, correoIndex: number): void {
    this.correosReferencia(refIndex).removeAt(correoIndex);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
        this.empleadoForm.patchValue({ fotoEmpleado: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      this.previewImage = null;
      this.empleadoForm.patchValue({ fotoEmpleado: '' });
    }
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      this.markAllAsTouched();
      alert('Por favor complete todos los campos requeridos correctamente');
      return;
    }

    if (this.empleadoForm.value.contraseña !== this.empleadoForm.value.confirmarContraseña) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const formData = this.prepararDatos();
    
    this.empleadoService.registrarEmpleado(formData).subscribe({
      next: (response) => {
        alert(`Empleado registrado exitosamente\nClave: ${response.datos.clave}`);
        this.router.navigate(['/empleados']);
      },
      error: (error) => {
        let mensaje = error.error?.mensaje || 'Error al registrar empleado';
        if (error.error?.detalles) mensaje += `\nDetalles: ${error.error.detalles.join('\n')}`;
        alert(mensaje);
      }
    });
  }

  private prepararDatos(): any {
    const formValue = this.empleadoForm.value;
    return {
      ...formValue,
      domicilio: {
        ...formValue.domicilio,
        codigoPostal: Number(formValue.domicilio.codigoPostal)
      },
      telefono: formValue.telefono.map((t: any) => t.numero),
      correoElectronico: formValue.correoElectronico.map((c: any) => c.email),
      referenciasFamiliares: formValue.referenciasFamiliares.map((ref: any) => ({
        nomCompleto: ref.nomCompleto,
        parentesco: ref.parentesco,
        telefono: ref.telefono.map((t: any) => t.numero),
        correo: ref.correo.map((c: any) => c.email)
      }))
    };
  }

  private markAllAsTouched(): void {
    Object.values(this.empleadoForm.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouchedNested(control);
      }
    });
  }

  private markAllAsTouchedNested(form: FormGroup | FormArray): void {
    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouchedNested(control);
      }
    });
  }
}