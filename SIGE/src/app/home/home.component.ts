import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../src/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    RouterModule
  ]
})
export class HomeComponent implements OnInit {
  usuarioRol: number = 0;
  sidebarItems: { label: string; icon: string; url: string }[] = [];
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.usuarioRol = this.authService.getRolUsuario();
    
    if (this.usuarioRol === 0) {
      console.error('No se pudo obtener el rol del usuario. Asegúrate de que el usuario esté autenticado.');
    }
    
    this.sidebarItems = this.getMenuPorRol(this.usuarioRol);
  }
  
  // Retorna las rutas basadas en el rol del usuario
  getMenuPorRol(rol: number) {
    switch (rol) {
      case 1: // Administrador de empleados
        return [
          { label: 'Inicio', icon: 'home', url: '/home' },
          { label: 'Buscar empleado', icon: 'search', url: '/home/buscar-empleado' },
          { label: 'Registrar empleado', icon: 'app_registration', url: '/home/registrar-empleado' },
          { label: 'Listar empleado', icon: 'list', url: '/home/listar-empleado' },
          { label: 'Mis datos personales', icon: 'app_registration', url: '/home/visualizar-datos' },
          { label: 'Cerrar Sesión', icon: 'exit_to_app', url: '/login' },

        ];
      case 2: // Administrador de cursos
        return [
          { label: 'Inicio', icon: 'home', url: '/home' },
          { label: 'Agregar actividades', icon: 'add', url: '/home/agregar-actividad' },
          { label: 'Agregar cursos', icon: 'add_circle', url: '/home/agregar-curso' },
          { label: 'Gestion de Empleados', icon: 'groups', url: '/home/buscar-empleadoCA' },
          {label: 'Visualizar Actividades', icon: 'visibility', url: '/home/visualizar-actividad'},
          {label: 'Visualizar Cursos', icon:'visibility', url: '/home/visualizar-curso'},
          { label: 'Mis datos personales', icon: 'app_registration', url: '/home/visualizar-datos' },
          { label: 'Cerrar Sesión', icon: 'exit_to_app', url: '/login' },
        ];
      case 3: // Empleado
        return [
          { label: 'Inicio', icon: 'home', url: '/home' },
          { label: 'Mis cursos', icon: 'school', url: '/home/mis-cursos' },
          {label: 'Mis Actividades', icon: 'school', url: '/home/mis-actividades'},
          {label: 'Agregar curso', icon:'add_circle', url:'/home/agregar-cursos'},
          { label: 'Mis datos personales', icon: 'app_registration', url: '/home/visualizar-datos' },
          { label: 'Editar datos', icon: 'edit', url: '/home/editar-datos' },
          { label: 'Cerrar Sesión', icon: 'exit_to_app', url: '/login' },

        ];
      default:
        return [{ label: 'Inicio', icon: 'home', url: '/home' }];
    }
  }
}