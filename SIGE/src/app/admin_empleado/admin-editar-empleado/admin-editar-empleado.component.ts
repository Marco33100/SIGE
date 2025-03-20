import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmpleadoService } from '../../../services/empleados.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin-editar-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-editar-empleado.component.html',
  styleUrls: ['./admin-editar-empleado.component.css']
})
export class AdminEditarEmpleadoComponent implements OnInit {
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
    // Obtener la clave del empleado desde los parámetros de la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.claveEmpleado = params['id'];
        this.cargarCatalogos();
      } else {
        this.errorMessage = 'No se proporcionó la clave del empleado';
      }
    });
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
      // Campos que no se pueden modificar (disabled)
    claveEmpleado: [{ value: '', disabled: true }],
    fechaAlta: [{ value: '', disabled: true }],
    rfc: [{ value: '', disabled: true }],
      // Campos que el administrador puede modificar
      nombreEmpleado: ['', Validators.required],
      apellidoP: ['', Validators.required],
      apellidoM: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      contraseña: ['', [Validators.minLength(8)]], // opcional
      sexo: ['', Validators.required],
      fotoEmpleado: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)]],      domicilio: this.fb.group({
        calle: ['', Validators.required],
        numInterior: [''],
        numExterior: ['', Validators.required],
        colonia: ['', Validators.required],
        codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        ciudad: ['', Validators.required]
      }),
      departamento: ['', Validators.required],
      puesto: ['', Validators.required],
      telefono: this.fb.array([
        this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      ]),
      correoElectronico: this.fb.array([
        this.fb.control('', [Validators.required, Validators.email])
      ]),
      referenciasFamiliares: this.fb.array([
        this.crearReferenciaGrupo({})
      ]),
      rol: [3, Validators.required],
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
      // Campos que no se pueden modificar (disabled)
    claveEmpleado: [{ value: datosIniciales.claveEmpleado || '', disabled: true }],
    fechaAlta: [{ value: this.formatDate(datosIniciales.fechaAlta) || '', disabled: true }],
    rfc: [{ value: datosIniciales.rfc || '', disabled: true }],
      
      // Campos que el administrador puede modificar
      nombreEmpleado: [datosIniciales.nombreEmpleado || '', Validators.required],
      apellidoP: [datosIniciales.apellidoP || '', Validators.required],
      apellidoM: [datosIniciales.apellidoM || '', Validators.required],
      fechaNacimiento: [this.formatDate(datosIniciales.fechaNacimiento) || '', Validators.required],
      contraseña: ['', [Validators.minLength(8)]], // opcional
      sexo: [datosIniciales.sexo || '', Validators.required],
      fotoEmpleado: [datosIniciales.fotoEmpleado || '', [Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)]],      domicilio: this.fb.group({
        calle: [datosIniciales.domicilio?.calle || '', Validators.required],
        numInterior: [datosIniciales.domicilio?.numInterior || ''],
        numExterior: [datosIniciales.domicilio?.numExterior || '', Validators.required],
        colonia: [datosIniciales.domicilio?.colonia || '', Validators.required],
        codigoPostal: [datosIniciales.domicilio?.codigoPostal || '', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        ciudad: [datosIniciales.domicilio?.ciudad || '', Validators.required]
      }),
      departamento: [datosIniciales.departamento || '', Validators.required],
      puesto: [datosIniciales.puesto || '', Validators.required],
      telefono: this.fb.array(
        this.crearArregloControles(datosIniciales.telefono || [''], [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      ),
      correoElectronico: this.fb.array(
        this.crearArregloControles(datosIniciales.correoElectronico || [''], [Validators.required, Validators.email])
      ),
      referenciasFamiliares: this.fb.array(
        (datosIniciales.referenciasFamiliares?.length ? datosIniciales.referenciasFamiliares : [{}])
          .map((ref: any) => this.crearReferenciaGrupo(ref))
      ),
      rol: [datosIniciales.rol || 3, Validators.required],
      activo: [datosIniciales.activo !== undefined ? datosIniciales.activo : true]
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
      fechaAlta: this.datosOriginales.fechaAlta,
      rfc: this.datosOriginales.rfc
    };
    
    if (!datosActualizados.contraseña) {
      delete datosActualizados.contraseña;
    }

    this.empleadoService.actualizarEmpleadoAdmin(this.claveEmpleado, datosActualizados)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al actualizar los datos. Por favor intenta nuevamente.';
          console.error(error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response?.exito) {
          this.successMessage = 'Datos del empleado actualizados correctamente.';
          this.cargandoDatos = false;
          
        
        } else {
          this.errorMessage = response?.mensaje || 'No se pudo actualizar los datos del empleado.';
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
  
  cancelar(): void {
    this.router.navigate(['home', 'buscar-empleado']);
  }
}