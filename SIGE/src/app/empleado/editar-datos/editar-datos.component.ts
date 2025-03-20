import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmpleadoService } from '../../../services/empleados.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-editar-datos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './editar-datos.component.html',
  styleUrls: ['./editar-datos.component.css']
})
export class EditarDatosComponent implements OnInit {
  editarForm: FormGroup;
  claveEmpleado: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  
  // Catálogos
  sexoOpciones: any[] = [];
  rolOpciones: any[] = [];
  ciudadOpciones: any[] = [];
  departamentoOpciones: any[] = [];
  puestoOpciones: any[] = [];
  parentescoOpciones: any[] = [];
  
  datosOriginales: any = {};
  cargandoDatos: boolean = false;
  esAdministrador: boolean = false;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private catalogosService: CatalogosService,
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.editarForm = this.inicializarFormularioVacio();
  }

  ngOnInit(): void {
    try {
      // Obtener la clave del empleado desde el servicio de sesión
      const empleadoSesion = this.empleadoService.obtenerSesionEmpleado();
      
      if (empleadoSesion && empleadoSesion.claveEmpleado) {
        this.claveEmpleado = empleadoSesion.claveEmpleado;
        this.esAdministrador = empleadoSesion.rol === 1;
        this.cargarCatalogos();
      } else {
        this.errorMessage = 'No se encontró ID de empleado en la sesión';
      }
    } catch (error) {
      this.errorMessage = 'Error al obtener datos de sesión';
      console.error(error);
    }
  }

  private cargarCatalogos(): void {
    this.cargandoDatos = true;
    
    // Cargar todos los catálogos en paralelo
    forkJoin({
      sexos: this.catalogosService.getSexos(),
      roles: this.catalogosService.getRoles(),
      ciudades: this.catalogosService.getCiudades(),
      departamentos: this.catalogosService.getDepartamentos(),
      puestos: this.catalogosService.getPuestos(),
      parentescos: this.catalogosService.getParentescos()
    }).subscribe({
      next: (catalogs) => {
        this.sexoOpciones = catalogs.sexos;
        this.rolOpciones = catalogs.roles;
        this.ciudadOpciones = catalogs.ciudades;
        this.departamentoOpciones = catalogs.departamentos;
        this.puestoOpciones = catalogs.puestos;
        this.parentescoOpciones = catalogs.parentescos;
        
        // Una vez cargados los catálogos, cargar los datos del empleado
        this.cargarDatosEmpleado();
      },
      error: (error) => {
        this.cargandoDatos = false;
        this.errorMessage = 'Error al cargar los catálogos necesarios.';
        console.error('Error cargando catálogos:', error);
      }
    });
  }

  // Crear un formulario vacío para evitar errores de undefined
  private inicializarFormularioVacio(): FormGroup {
    return this.fb.group({
      // Campos que no se pueden modificar (disabled)
      claveEmpleado: [{ value: '', disabled: true }],
      nombreEmpleado: [{ value: '', disabled: true }],
      apellidoP: [{ value: '', disabled: true }],
      apellidoM: [{ value: '', disabled: true }],
      fechaAlta: [{ value: '', disabled: true }],
      rfc: [{ value: '', disabled: true }],
      fechaNacimiento: [{ value: '', disabled: true }],
      
      // Campos que sí se pueden modificar
      contraseña: ['', [Validators.minLength(8)]], // opcional
      sexo: ['', Validators.required],
      fotoEmpleado: [''],
      domicilio: this.fb.group({
        calle: ['', Validators.required],
        numInterior: [''],
        numExterior: ['', Validators.required],
        colonia: ['', Validators.required],
        codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        ciudad: ['', Validators.required]
      }),
      departamento: [{ value: '', disabled: !this.esAdministrador }, Validators.required],
      puesto: [{ value: '', disabled: !this.esAdministrador }, Validators.required],
      telefono: this.fb.array([
        this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      ]),
      correoElectronico: this.fb.array([
        this.fb.control('', [Validators.required, Validators.email])
      ]),
      referenciasFamiliares: this.fb.array([
        this.crearReferenciaGrupo({})
      ]),
      rol: [{ value: 3, disabled: !this.esAdministrador }, Validators.required],
      activo: [true]
    });
  }

  private cargarDatosEmpleado(): void {
    if (!this.claveEmpleado) {
      this.errorMessage = 'ID de empleado no encontrado';
      return;
    }

    this.empleadoService.obtenerEmpleado(this.claveEmpleado).subscribe({
      next: (response) => {
        this.cargandoDatos = false;
        if (response.exito) {
          this.datosOriginales = response.empleado;
          this.inicializarFormulario(response.empleado);
        } else {
          this.errorMessage = 'No se pudieron obtener los datos del empleado.';
        }
      },
      error: (error) => {
        this.cargandoDatos = false;
        this.errorMessage = 'Error al cargar los datos del empleado.';
        console.error(error);
      }
    });
  }

  private inicializarFormulario(datosIniciales: any = {}): void {
    this.editarForm = this.fb.group({
      // Campos que no se pueden modificar (disabled)
      claveEmpleado: [{ value: datosIniciales.claveEmpleado || '', disabled: true }],
      nombreEmpleado: [{ value: datosIniciales.nombreEmpleado || '', disabled: true }],
      apellidoP: [{ value: datosIniciales.apellidoP || '', disabled: true }],
      apellidoM: [{ value: datosIniciales.apellidoM || '', disabled: true }],
      fechaAlta: [{ value: this.formatDate(datosIniciales.fechaAlta) || '', disabled: true }],
      rfc: [{ value: datosIniciales.rfc || '', disabled: true }],
      fechaNacimiento: [{ value: this.formatDate(datosIniciales.fechaNacimiento) || '', disabled: true }],
      
      // Información laboral - ahora todo disabled
      departamento: [{ value: datosIniciales.departamento || '', disabled: true }],
      puesto: [{ value: datosIniciales.puesto || '', disabled: true }],
      rol: [{ value: datosIniciales.rol || 3, disabled: true }],
      activo: [{ value: datosIniciales.activo !== undefined ? datosIniciales.activo : true, disabled: true }],
            
      // Campos que sí se pueden modificar
      contraseña: ['', [Validators.minLength(8)]], // opcional
      sexo: [datosIniciales.sexo || '', Validators.required],
      fotoEmpleado: [datosIniciales.fotoEmpleado || ''],
      domicilio: this.fb.group({
        calle: [datosIniciales.domicilio?.calle || '', Validators.required],
        numInterior: [datosIniciales.domicilio?.numInterior || ''],
        numExterior: [datosIniciales.domicilio?.numExterior || '', Validators.required],
        colonia: [datosIniciales.domicilio?.colonia || '', Validators.required],
        codigoPostal: [datosIniciales.domicilio?.codigoPostal || '', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        ciudad: [datosIniciales.domicilio?.ciudad || '', Validators.required]
      }),
      telefono: this.fb.array(
        this.crearArregloControles(datosIniciales.telefono || [''], [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      ),
      correoElectronico: this.fb.array(
        this.crearArregloControles(datosIniciales.correoElectronico || [''], [Validators.required, Validators.email])
      ),
      referenciasFamiliares: this.fb.array(
        (datosIniciales.referenciasFamiliares?.length ? datosIniciales.referenciasFamiliares : [{}])
          .map((ref: any) => this.crearReferenciaGrupo(ref))
      )
    });
  }

  private crearArregloControles(valores: any[], validadores: any[]): FormControl[] {
    if (!Array.isArray(valores) || valores.length === 0) {
      return [this.fb.control('', validadores)];
    }
    return valores.map(valor => this.fb.control(valor, validadores));
  }

  private crearReferenciaGrupo(ref: any = {}): FormGroup {
    return this.fb.group({
      nomCompleto: [ref.nomCompleto || '', Validators.required],
      parentesco: [ref.parentesco || '', Validators.required],
      telefono: this.fb.array(
        this.crearArregloControles(ref.telefono || [''], [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      ),
      correo: this.fb.array(
        this.crearArregloControles(ref.correo || [''], [Validators.required, Validators.email])
      )
    });
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // Getters para FormArrays
  get telefonos(): FormArray {
    return this.editarForm.get('telefono') as FormArray;
  }

  get correosElectronicos(): FormArray {
    return this.editarForm.get('correoElectronico') as FormArray;
  }

  get referencias(): FormArray {
    return this.editarForm.get('referenciasFamiliares') as FormArray;
  }

  // Métodos para agregar/eliminar teléfonos
  agregarTelefono(): void {
    this.telefonos.push(this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]));
  }

  eliminarTelefono(index: number): void {
    if (this.telefonos.length > 1) {
      this.telefonos.removeAt(index);
    }
  }

  // Métodos para agregar/eliminar correos
  agregarCorreo(): void {
    this.correosElectronicos.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  eliminarCorreo(index: number): void {
    if (this.correosElectronicos.length > 1) {
      this.correosElectronicos.removeAt(index);
    }
  }

  // Métodos para referencias familiares
  agregarReferencia(): void {
    this.referencias.push(this.crearReferenciaGrupo({}));
  }

  eliminarReferencia(index: number): void {
    if (this.referencias.length > 1) {
      this.referencias.removeAt(index);
    }
  }

  // Métodos para teléfonos de referencias
  getTelefonosReferencia(referenciaIndex: number): FormArray {
    if (!this.referencias || !this.referencias.at(referenciaIndex)) {
      return this.fb.array([]);
    }
    return this.referencias.at(referenciaIndex).get('telefono') as FormArray;
  }

  agregarTelefonoReferencia(referenciaIndex: number): void {
    const telefonos = this.getTelefonosReferencia(referenciaIndex);
    telefonos.push(this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]));
  }

  eliminarTelefonoReferencia(referenciaIndex: number, telefonoIndex: number): void {
    const telefonos = this.getTelefonosReferencia(referenciaIndex);
    if (telefonos.length > 1) {
      telefonos.removeAt(telefonoIndex);
    }
  }

  // Métodos para correos de referencias
  getCorreosReferencia(referenciaIndex: number): FormArray {
    if (!this.referencias || !this.referencias.at(referenciaIndex)) {
      return this.fb.array([]);
    }
    return this.referencias.at(referenciaIndex).get('correo') as FormArray;
  }

  agregarCorreoReferencia(referenciaIndex: number): void {
    const correos = this.getCorreosReferencia(referenciaIndex);
    correos.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  eliminarCorreoReferencia(referenciaIndex: number, correoIndex: number): void {
    const correos = this.getCorreosReferencia(referenciaIndex);
    if (correos.length > 1) {
      correos.removeAt(correoIndex);
    }
  }

  onSubmit(): void {
    if (!this.editarForm) {
      this.errorMessage = 'El formulario no está listo. Por favor, inténtelo de nuevo.';
      return;
    }

    if (this.editarForm.invalid) {
      this.marcarControlesComoSucios();
      this.errorMessage = 'Por favor corrija los errores en el formulario.';
      return;
    }

    const formValue = this.editarForm.getRawValue();
    
    // Mantener los valores originales para los campos que no se pueden modificar
    const datosActualizados = {
      ...formValue,
      claveEmpleado: this.datosOriginales.claveEmpleado,
      nombreEmpleado: this.datosOriginales.nombreEmpleado,
      apellidoP: this.datosOriginales.apellidoP,
      apellidoM: this.datosOriginales.apellidoM,
      fechaAlta: this.datosOriginales.fechaAlta,
      rfc: this.datosOriginales.rfc,
      fechaNacimiento: this.datosOriginales.fechaNacimiento
    };
    
    // Si no es administrador, mantener los valores originales de los campos restringidos
    if (!this.esAdministrador) {
      datosActualizados.departamento = this.datosOriginales.departamento;
      datosActualizados.puesto = this.datosOriginales.puesto;
      datosActualizados.rol = this.datosOriginales.rol;
    }
    
    if (!datosActualizados.contraseña) {
      delete datosActualizados.contraseña;
    }

    this.empleadoService.actualizarEmpleado(this.claveEmpleado, datosActualizados)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al actualizar los datos. Por favor intenta nuevamente.';
          console.error(error);
          return of(null);
        })
      )
      .subscribe(response => {
        console.log('Respuesta de actualización:', response); // Agrega esta línea
        if (response?.exito) {
          this.successMessage = 'Datos actualizados correctamente.';
          this.cargandoDatos = false; // Agrega un estado de carga
        } else {
          // Agrega esto para manejar respuestas no erróneas pero no exitosas
          this.errorMessage = response?.mensaje || 'No se pudo actualizar los datos.';
        }
      });
  }

  private marcarControlesComoSucios(): void {
    if (!this.editarForm) return;
    
    Object.keys(this.editarForm.controls).forEach(key => {
      const control = this.editarForm.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.marcarGrupoComoSucio(control);
      } else if (control) {
        control.markAsDirty();
        control.markAsTouched();
      }
    });
  }

  private marcarGrupoComoSucio(grupo: FormGroup | FormArray): void {
    if (grupo instanceof FormGroup) {
      Object.keys(grupo.controls).forEach(key => {
        const control = grupo.get(key);
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.marcarGrupoComoSucio(control);
        } else if (control) {
          control.markAsDirty();
          control.markAsTouched();
        }
      });
    } else {
      grupo.controls.forEach(control => {
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.marcarGrupoComoSucio(control);
        } else {
          control.markAsDirty();
          control.markAsTouched();
        }
      });
    }
  }

  get formulario() {
    return this.editarForm ? this.editarForm.controls : {};
  }
  
}