import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../../services/empleados.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-editar-datos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-datos.component.html',
  styleUrls: ['./editar-datos.component.css']
})
export class EditarDatosComponent implements OnInit {
  empleadoForm!: FormGroup;
  claveEmpleado: string = '';
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  opcionesSexo = ['Masculino', 'Femenino', 'Otro'];
  opcionesRol = [
    { valor: 1, etiqueta: 'Administrador' },
    { valor: 2, etiqueta: 'Supervisor' },
    { valor: 3, etiqueta: 'Empleado normal' }
  ];

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private ruta: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.ruta.params.subscribe(params => {
      if (params['id']) {
        this.claveEmpleado = params['id'];
        this.cargarDatosEmpleado();
      } else {
        // Intentar obtener datos del empleado desde la sesión
        const empleadoData = this.authService.getEmpleadoData();
        const empleadoActual = empleadoData || this.empleadoService.obtenerSesionEmpleado();
        
        if (empleadoActual && empleadoActual.claveEmpleado) {
          this.claveEmpleado = empleadoActual.claveEmpleado;
          this.cargarDatosEmpleado();
        } else {
          this.mensajeError = 'No se pudo identificar al empleado actual';
          console.error(this.mensajeError);
          
          // Redirigir al login si no hay sesión
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      }
    });
  }

  inicializarFormulario(): void {
    this.empleadoForm = this.fb.group({
      nombreEmpleado: ['', Validators.required],
      apellidoP: ['', Validators.required],
      apellidoM: [''],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      rfc: ['', Validators.pattern(/^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/)],
      domicilio: this.fb.group({
        calle: ['', Validators.required],
        numInterior: [''],
        numExterior: [''],
        colonia: ['', Validators.required],
        codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        ciudad: ['', Validators.required]
      }),
      departamento: ['', Validators.required],
      puesto: ['', Validators.required],
      telefono: this.fb.array([this.fb.control('', Validators.pattern(/^\d{10}$/))]),
      correoElectronico: this.fb.array([this.fb.control('', Validators.email)]),
      referenciasFamiliares: this.fb.array([]),
      rol: [3, Validators.required],
      activo: [true]
    });
  }

  cargarDatosEmpleado(): void {
    this.cargando = true;
    console.log('Iniciando carga de datos del empleado');
    this.mensajeError = '';
    
    // Verificar que tenemos el token antes de hacer la petición
    const token = this.authService.getToken();
    if (!token) {
      this.mensajeError = 'No se encontró token de autenticación. Por favor, inicie sesión nuevamente.';
      this.cargando = false;
      
      // Redirigir al login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
      
      return;
    }
    
    this.empleadoService.obtenerEmpleado(this.claveEmpleado).subscribe({
      next: (datos) => {
        this.actualizarFormulario(datos);
        console.log('Datos recibidos correctamente:', datos);
        this.cargando = false;
      },
      error: (error) => {
        this.mensajeError = 'Error al cargar los datos del empleado';
        console.error('Error al cargar empleado', error);
        this.cargando = false;
      }
    });
  }

  actualizarFormulario(empleado: any): void {
    // Reiniciar los arrays del formulario antes de cargar los datos
    this.reiniciarArraysFormulario();
    console.log('Datos del empleado recibidos:', empleado);

    // Actualizar campos básicos del formulario
    this.empleadoForm.patchValue({
      nombreEmpleado: empleado.nombreEmpleado,
      apellidoP: empleado.apellidoP,
      apellidoM: empleado.apellidoM,
      fechaNacimiento: this.formatearFecha(empleado.fechaNacimiento),
      sexo: empleado.sexo,
      rfc: empleado.rfc,
      domicilio: empleado.domicilio,
      departamento: empleado.departamento,
      puesto: empleado.puesto,
      rol: empleado.rol,
      activo: empleado.activo
    });

    // Agregar números de teléfono
    const arrayTelefono = this.empleadoForm.get('telefono') as FormArray;
    if (empleado.telefono && empleado.telefono.length) {
      // Primero limpiamos el array
      while (arrayTelefono.length) {
        arrayTelefono.removeAt(0);
      }
      
      // Luego agregamos los teléfonos existentes
      empleado.telefono.forEach((tel: string) => {
        arrayTelefono.push(this.fb.control(tel, Validators.pattern(/^\d{10}$/)));
      });
    }

    // Agregar direcciones de correo electrónico
    const arrayCorreo = this.empleadoForm.get('correoElectronico') as FormArray;
    if (empleado.correoElectronico && empleado.correoElectronico.length) {
      // Primero limpiamos el array
      while (arrayCorreo.length) {
        arrayCorreo.removeAt(0);
      }
      
      // Luego agregamos los correos existentes
      empleado.correoElectronico.forEach((email: string) => {
        arrayCorreo.push(this.fb.control(email, Validators.email));
      });
    }

    // Agregar referencias familiares
    const arrayRefFam = this.empleadoForm.get('referenciasFamiliares') as FormArray;
    if (empleado.referenciasFamiliares && empleado.referenciasFamiliares.length) {
      empleado.referenciasFamiliares.forEach((ref: any) => {
        const telefonos = this.fb.array([]);
        const correos = this.fb.array([]);
        
        // Agregar teléfonos de la referencia familiar
        if (ref.telefono && ref.telefono.length) {
          ref.telefono.forEach((tel: string) => {
            telefonos.push(this.fb.control(tel, Validators.pattern(/^\d{10}$/)));
          });
        } else {
          telefonos.push(this.fb.control('', Validators.pattern(/^\d{10}$/)));
        }
        
        // Agregar correos de la referencia familiar
        if (ref.correo && ref.correo.length) {
          ref.correo.forEach((email: string) => {
            correos.push(this.fb.control(email, Validators.email));
          });
        } else {
          correos.push(this.fb.control('', Validators.email));
        }
        
        arrayRefFam.push(this.fb.group({
          nomCompleto: [ref.nomCompleto, Validators.required],
          parentesco: [ref.parentesco, Validators.required],
          telefono: telefonos,
          correo: correos
        }));
      });
    }
  }

  reiniciarArraysFormulario(): void {
    const arrayTelefono = this.empleadoForm.get('telefono') as FormArray;
    const arrayCorreo = this.empleadoForm.get('correoElectronico') as FormArray;
    const arrayRefFam = this.empleadoForm.get('referenciasFamiliares') as FormArray;
    
    // Resetear a un solo control vacío
    while (arrayTelefono.length > 0) {
      arrayTelefono.removeAt(0);
    }
    arrayTelefono.push(this.fb.control('', Validators.pattern(/^\d{10}$/)));
    
    while (arrayCorreo.length > 0) {
      arrayCorreo.removeAt(0);
    }
    arrayCorreo.push(this.fb.control('', Validators.email));
    
    while (arrayRefFam.length > 0) {
      arrayRefFam.removeAt(0);
    }
  }

  // Métodos auxiliares para los arrays del formulario
  get arrayTelefono() {
    return this.empleadoForm.get('telefono') as FormArray;
  }

  get arrayCorreo() {
    return this.empleadoForm.get('correoElectronico') as FormArray;
  }

  get arrayReferenciasFamiliares() {
    return this.empleadoForm.get('referenciasFamiliares') as FormArray;
  }

  agregarTelefono(): void {
    this.arrayTelefono.push(this.fb.control('', Validators.pattern(/^\d{10}$/)));
  }

  agregarCorreo(): void {
    this.arrayCorreo.push(this.fb.control('', Validators.email));
  }

  eliminarTelefono(indice: number): void {
    if (this.arrayTelefono.length > 1) {
      this.arrayTelefono.removeAt(indice);
    }
  }

  eliminarCorreo(indice: number): void {
    if (this.arrayCorreo.length > 1) {
      this.arrayCorreo.removeAt(indice);
    }
  }

  agregarReferencia(): void {
    const nuevaReferencia = this.fb.group({
      nomCompleto: ['', Validators.required],
      parentesco: ['', Validators.required],
      telefono: this.fb.array([this.fb.control('', Validators.pattern(/^\d{10}$/))]),
      correo: this.fb.array([this.fb.control('', Validators.email)])
    });
    this.arrayReferenciasFamiliares.push(nuevaReferencia);
  }

  eliminarReferencia(indice: number): void {
    this.arrayReferenciasFamiliares.removeAt(indice);
  }

  agregarTelefonoReferencia(indiceReferencia: number): void {
    const referencia = this.arrayReferenciasFamiliares.at(indiceReferencia) as FormGroup;
    const telefonos = referencia.get('telefono') as FormArray;
    telefonos.push(this.fb.control('', Validators.pattern(/^\d{10}$/)));
  }

  eliminarTelefonoReferencia(indiceReferencia: number, indiceTelefono: number): void {
    const referencia = this.arrayReferenciasFamiliares.at(indiceReferencia) as FormGroup;
    const telefonos = referencia.get('telefono') as FormArray;
    if (telefonos.length > 1) {
      telefonos.removeAt(indiceTelefono);
    }
  }

  agregarCorreoReferencia(indiceReferencia: number): void {
    const referencia = this.arrayReferenciasFamiliares.at(indiceReferencia) as FormGroup;
    const correos = referencia.get('correo') as FormArray;
    correos.push(this.fb.control('', Validators.email));
  }

  eliminarCorreoReferencia(indiceReferencia: number, indiceCorreo: number): void {
    const referencia = this.arrayReferenciasFamiliares.at(indiceReferencia) as FormGroup;
    const correos = referencia.get('correo') as FormArray;
    if (correos.length > 1) {
      correos.removeAt(indiceCorreo);
    }
  }

  getTelefonosReferencia(indiceReferencia: number): FormArray {
    const referencia = this.arrayReferenciasFamiliares.at(indiceReferencia) as FormGroup;
    return referencia.get('telefono') as FormArray;
  }

  getCorreosReferencia(indiceReferencia: number): FormArray {
    const referencia = this.arrayReferenciasFamiliares.at(indiceReferencia) as FormGroup;
    return referencia.get('correo') as FormArray;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      console.warn('Por favor complete todos los campos requeridos');
      this.marcarFormularioComoTocado(this.empleadoForm);
      return;
    }

    this.cargando = true;
    const datosActualizados = this.empleadoForm.value;
    
    this.empleadoService.actualizarEmpleado(this.claveEmpleado, datosActualizados).subscribe({
      next: (respuesta) => {
        console.log('Datos actualizados correctamente');
        this.mensajeExito = 'Datos actualizados correctamente';
        this.cargando = false;
        setTimeout(() => {
          this.router.navigate(['/empleados']);
        }, 1500);
      },
      error: (error) => {
        this.mensajeError = 'Error al actualizar los datos del empleado';
        console.error('Error al actualizar empleado', error);
        this.cargando = false;
      }
    });
  }

  marcarFormularioComoTocado(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.marcarFormularioComoTocado(control);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/empleados']);
  }
}