import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  catalogos: any = {
    ciudades: [],
    sexos: [],
    puestos: [],
    departamentos: [],
    roles: [],
    parentescos: []
  };
  loading = true;
  previewImage: string | null = null;
  mensaje: string = '';

  // Control de carga de catálogos
  catalogosLoaded = {
    ciudades: false,
    sexos: false,
    puestos: false,
    departamentos: false,
    roles: false,
    parentescos: false
  };

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
      fotoEmpleadoUrl: ['', [Validators.pattern(/^(http|https):\/\/.+/)]],
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

  private allCatalogosLoaded(): boolean {
    return Object.values(this.catalogosLoaded).every(loaded => loaded);
  }

  cargarCatalogos(): void {
    console.log('Cargando catálogos...');
    
    this.catalogosService.getCiudades().subscribe({
      next: ciudades => {
        this.catalogos.ciudades = ciudades;
        this.catalogosLoaded.ciudades = true;
        console.log('Ciudades cargadas:', ciudades);
        this.checkLoading();
      },
      error: err => {
        console.error('Error al cargar ciudades:', err);
        this.catalogosLoaded.ciudades = true;
        this.mensaje = 'Error al cargar catálogo de ciudades';
        this.checkLoading();
      }
    });
    
    // Resto de cargas de catálogos sin cambios...
    this.catalogosService.getPuestos().subscribe({
      next: puestos => {
        this.catalogos.puestos = puestos;
        this.catalogosLoaded.puestos = true;
        console.log('Puestos cargados:', puestos);
        this.checkLoading();
      },
      error: err => {
        console.error('Error al cargar puestos:', err);
        this.catalogosLoaded.puestos = true;
        this.mensaje = 'Error al cargar catálogo de puestos';
        this.checkLoading();
      }
    });
    
    this.catalogosService.getDepartamentos().subscribe({
      next: departamentos => {
        this.catalogos.departamentos = departamentos;
        this.catalogosLoaded.departamentos = true;
        console.log('Departamentos cargados:', departamentos);
        this.checkLoading();
      },
      error: err => {
        console.error('Error al cargar departamentos:', err);
        this.catalogosLoaded.departamentos = true;
        this.mensaje = 'Error al cargar catálogo de departamentos';
        this.checkLoading();
      }
    });

    this.catalogosService.getSexos().subscribe({
      next: sexos => {
        this.catalogos.sexos = sexos;
        this.catalogosLoaded.sexos = true;
        console.log('Sexos cargados:', sexos);
        this.checkLoading();
      },
      error: err => {
        console.error('Error al cargar sexos:', err);
        this.catalogosLoaded.sexos = true;
        this.mensaje = 'Error al cargar catálogo de sexos';
        this.checkLoading();
      }
    });

    this.catalogosService.getRoles().subscribe({
      next: roles => {
        this.catalogos.roles = roles;
        this.catalogosLoaded.roles = true;
        console.log('Roles cargados:', roles);
        this.checkLoading();
      },
      error: err => {
        console.error('Error al cargar roles:', err);
        this.catalogosLoaded.roles = true;
        this.mensaje = 'Error al cargar catálogo de roles';
        this.checkLoading();
      }
    });
    
    this.catalogosService.getParentescos().subscribe({
      next: parentescos => {
        this.catalogos.parentescos = parentescos;
        this.catalogosLoaded.parentescos = true;
        console.log('Parentescos cargados:', parentescos);
        this.checkLoading();
      },
      error: err => {
        console.error('Error al cargar parentescos:', err);
        this.catalogosLoaded.parentescos = true;
        this.mensaje = 'Error al cargar catálogo de parentescos';
        this.checkLoading();
      }
    });
  }
  
  checkLoading(): void {
    if (this.allCatalogosLoaded()) {
      console.log('Todos los catálogos cargados correctamente');
      this.loading = false;
    }
  }

  // Método para cargar la imagen por URL
  cargarImagenPorUrl(): void {
  const url = this.empleadoForm.get('fotoEmpleadoUrl')?.value;
  if (this.validarImagenUrl(url)) {
    this.previewImage = url;
  } else {
    this.previewImage = null;
    alert('Por favor ingrese una URL válida de imagen (debe terminar en .jpeg, .jpg, .gif o .png)');
  }
}

  // Método para validar la imagen
  validarImagenUrl(url: string | null): boolean {
    if (typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
  }

  // Métodos para teléfonos (sin cambios)
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
    if (this.telefonos.length > 1) {
      this.telefonos.removeAt(index);
    } else {
      alert('Debe mantener al menos un teléfono');
    }
  }

  // Métodos para correos (sin cambios)
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
    if (this.correos.length > 1) {
      this.correos.removeAt(index);
    } else {
      alert('Debe mantener al menos un correo electrónico');
    }
  }

  // Métodos para referencias familiares (sin cambios)
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
    if (this.telefonosReferencia(refIndex).length > 1) {
      this.telefonosReferencia(refIndex).removeAt(telIndex);
    } else {
      alert('Debe mantener al menos un teléfono para la referencia');
    }
  }

  correosReferencia(index: number): FormArray {
    return this.referencias.at(index).get('correo') as FormArray;
  }

  agregarCorreoReferencia(refIndex: number): void {
    this.correosReferencia(refIndex).push(this.crearCorreo());
  }

  eliminarCorreoReferencia(refIndex: number, correoIndex: number): void {
    if (this.correosReferencia(refIndex).length > 1) {
      this.correosReferencia(refIndex).removeAt(correoIndex);
    } else {
      alert('Debe mantener al menos un correo para la referencia');
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
      fotoEmpleado: formValue.fotoEmpleadoUrl, // Usar la URL de la foto
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

  cancelar(): void {
    this.router.navigate(['/empleados']);
  }
}