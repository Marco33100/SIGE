import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from '../../../services/empleados.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { ApiResponse, FiltrosEmpleado, Empleado } from '../../interface/empleado.interface';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-listar-empleado',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './listar-empleado.component.html',
  styleUrls: ['./listar-empleado.component.css']
})
export class ListarEmpleadoComponent implements OnInit {
  protected Math = Math;
  
  empleados: any[] = [];
  cargando: boolean = true;
  mensaje: string = '';
  paginacion = {
    paginaActual: 1,
    itemsPorPagina: 10,
    totalEmpleados: 0
  };
  
  filtros = {
    ciudad: '',
    sexo: '',
    puesto: '',
    departamento: '',
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    fechaNacimiento: '',
    fechaAlta: '',
    rol: ''
  };

  catalogos: any = {
    ciudades: [],
    sexos: [],
    puestos: [],
    departamentos: [],
    roles: []
  };

  mostrarFiltrosAvanzados: boolean = false;
  empleadoSeleccionado: any = null;
  mostrarDialogoEliminar: boolean = false;
  mostrarDialogoReactivar: boolean = false;
  empleadoAccion: any = null;
  
  // Control de carga de catálogos
  catalogosLoaded = {
    ciudades: false,
    sexos: false,
    puestos: false,
    departamentos: false,
    roles: false
  };

  constructor(
    private empleadoService: EmpleadoService,
    private catalogoService: CatalogosService,
    private router: Router

  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private allCatalogosLoaded(): boolean {
    return Object.values(this.catalogosLoaded).every(loaded => loaded);
  }

  cargarCatalogos(): void {
    console.log('Cargando catálogos...');
    
    this.catalogoService.getCiudades().subscribe({
      next: ciudades => {
        this.catalogos.ciudades = ciudades;
        this.catalogosLoaded.ciudades = true;
        console.log('Ciudades cargadas:', ciudades);
        this.checkAndLoadEmpleados();
      },
      error: err => {
        console.error('Error al cargar ciudades:', err);
        this.catalogosLoaded.ciudades = true;
        this.checkAndLoadEmpleados();
      }
    });
    
    this.catalogoService.getPuestos().subscribe({
      next: puestos => {
        this.catalogos.puestos = puestos;
        this.catalogosLoaded.puestos = true;
        console.log('Puestos cargados:', puestos);
        this.checkAndLoadEmpleados();
      },
      error: err => {
        console.error('Error al cargar puestos:', err);
        this.catalogosLoaded.puestos = true;
        this.checkAndLoadEmpleados();
      }
    });
    
    this.catalogoService.getDepartamentos().subscribe({
      next: departamentos => {
        this.catalogos.departamentos = departamentos;
        this.catalogosLoaded.departamentos = true;
        console.log('Departamentos cargados:', departamentos);
        this.checkAndLoadEmpleados();
      },
      error: err => {
        console.error('Error al cargar departamentos:', err);
        this.catalogosLoaded.departamentos = true;
        this.checkAndLoadEmpleados();
      }
    });

    this.catalogoService.getSexos().subscribe({
      next: sexos => {
        this.catalogos.sexos = sexos;
        this.catalogosLoaded.sexos = true;
        console.log('Sexos cargados:', sexos);
        this.checkAndLoadEmpleados();
      },
      error: err => {
        console.error('Error al cargar sexos:', err);
        this.catalogosLoaded.sexos = true;
        this.checkAndLoadEmpleados();
      }
    });

    this.catalogoService.getRoles().subscribe({
      next: roles => {
        this.catalogos.roles = roles;
        this.catalogosLoaded.roles = true;
        console.log('Roles cargados:', roles);
        this.checkAndLoadEmpleados();
      },
      error: err => {
        console.error('Error al cargar roles:', err);
        this.catalogosLoaded.roles = true;
        this.checkAndLoadEmpleados();
      }
    });
  }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  
  checkAndLoadEmpleados(): void {
    if (this.allCatalogosLoaded()) {
      console.log('Todos los catálogos cargados, cargando empleados...');
      this.cargarEmpleados();
    }
  }

  cargarEmpleados(): void {
    this.cargando = true;
    const filtrosLimpios = this.obtenerFiltrosLimpios();
    
    this.empleadoService.listarEmpleados(
      this.paginacion.paginaActual,
      this.paginacion.itemsPorPagina,
      filtrosLimpios
    ).subscribe({
      next: (respuesta: ApiResponse) => {
        if (respuesta.exito) {
          this.empleados = respuesta.empleados;
          this.paginacion.totalEmpleados = respuesta.total;
        } else {
          this.mensaje = respuesta.mensaje || 'Error al cargar empleados';
          this.empleados = [];
        }
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.mensaje = 'Error de conexión con el servidor';
        this.cargando = false;
        console.error('Error de conexión:', error);
      }
    });
  }

  private obtenerFiltrosLimpios(): any {
    // Crear una copia de los filtros
    const filtrosLimpios = {...this.filtros};
    
    // Formatear fechas a formato ISO si existen
    if (filtrosLimpios.fechaNacimiento && filtrosLimpios.fechaNacimiento !== '') {
      filtrosLimpios.fechaNacimiento = new Date(filtrosLimpios.fechaNacimiento).toISOString().split('T')[0];
    }
    
    if (filtrosLimpios.fechaAlta && filtrosLimpios.fechaAlta !== '') {
      filtrosLimpios.fechaAlta = new Date(filtrosLimpios.fechaAlta).toISOString().split('T')[0];
    }
    
    // Eliminar propiedades vacías
    (Object.keys(filtrosLimpios) as Array<keyof FiltrosEmpleado>).forEach(key => {
      if (filtrosLimpios[key] === '' || filtrosLimpios[key] === null || filtrosLimpios[key] === undefined) {
        delete filtrosLimpios[key];
      }
    });
    
    return filtrosLimpios;
  }

  private limpiarFiltrosVacios(): void {
    (Object.keys(this.filtros) as Array<keyof FiltrosEmpleado>).forEach(key => {
      if (this.filtros[key] === '' || this.filtros[key] === null || this.filtros[key] === undefined) {
        delete this.filtros[key];
      }
    });
  }
  
  aplicarFiltros(): void {
    console.log('Aplicando filtros:', this.filtros);
    this.paginacion.paginaActual = 1;
    this.cargarEmpleados();
  }

  limpiarFiltros(): void {
    console.log('Limpiando filtros');
    this.filtros = {
      ciudad: '',
      sexo: '',
      puesto: '',
      departamento: '',
      nombre: '',
      apellidoP: '',
      apellidoM: '',
      fechaNacimiento: '',
      fechaAlta: '',
      rol: ''
    };
    this.cargarEmpleados();
  }

  cambiarPagina(nuevaPagina: number): void {
    console.log('Cambiando a página:', nuevaPagina);
    this.paginacion.paginaActual = nuevaPagina;
    this.cargarEmpleados();
  }

  seleccionarEmpleado(empleado: any): void {
    this.empleadoSeleccionado = empleado;
    
    this.empleadoService.obtenerEmpleado(empleado.claveEmpleado).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.empleadoSeleccionado = respuesta.empleado;
        } else {
          this.mensaje = 'Error al obtener detalles del empleado';
        }
      },
      error: (error) => {
        this.mensaje = 'Error al conectar con el servidor';
        console.error('Error al obtener detalles:', error);
      }
    });
  }

  mostrarConfirmacionEliminar(empleado: any): void {
    this.empleadoAccion = empleado;
    this.mostrarDialogoEliminar = true;
  }

  mostrarConfirmacionReactivar(empleado: any): void {
    this.empleadoAccion = empleado;
    this.mostrarDialogoReactivar = true;
  }

  cerrarDialogos(): void {
    this.mostrarDialogoEliminar = false;
    this.mostrarDialogoReactivar = false;
    this.empleadoAccion = null;
  }

  editarEmpleado(empleado: any): void {
    this.router.navigate(['home', 'admin-editar', empleado.claveEmpleado]);
  }

  eliminarEmpleado(clave: string): void {
    console.log('Eliminando empleado:', clave);
    this.empleadoService.eliminarEmpleado(clave).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.mensaje = 'Empleado eliminado correctamente';
          this.cargarEmpleados();
          this.empleadoSeleccionado = null;
        } else {
          this.mensaje = respuesta.mensaje || 'Error al eliminar empleado';
        }
        this.cerrarDialogos();
      },
      error: (error) => {
        this.mensaje = 'Error al conectar con el servidor';
        console.error('Error eliminando:', error);
        this.cerrarDialogos();
      }
    });
  }

    
  reactivarEmpleado(clave: string): void {
    console.log('Reactivando empleado:', clave);
    this.empleadoService.actualizarEmpleado(clave, { activo: true }).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.mensaje = 'Empleado reactivado exitosamente';
          this.cargarEmpleados();
          this.empleadoSeleccionado = null;
        } else {
          this.mensaje = respuesta.mensaje || 'Error al reactivar empleado';
        }
        this.cerrarDialogos();
      },
      error: (error) => {
        this.mensaje = 'Error al reactivar empleado';
        console.error('Error reactivando:', error);
        this.cerrarDialogos();
      }
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX');
  }
}