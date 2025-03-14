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
    // Recupera el rol del usuario desde el localStorage
    this.usuarioRol = this.authService.getRolUsuario();
    
    // Si el rol no es válido, redirige al login o muestra un mensaje de error
    if (this.usuarioRol === 0) {
      console.error('No se pudo obtener el rol del usuario. Asegúrate de que el usuario esté autenticado.');
      // Aquí podrías agregar una redirección a la página de login
    }
    
    // Llama al método para obtener el menú basado en el rol
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
          { label: 'Listar empleado', icon: 'list', url: '/home/listar-empleado' }
        ];
      case 2: // Administrador de cursos
        return [
          { label: 'Inicio', icon: 'home', url: '/home' },
          { label: 'Buscar curso', icon: 'search', url: '/home/buscar-curso' },
          { label: 'Registrar curso', icon: 'app_registration', url: '/home/registrar-curso' },
          { label: 'Listar cursos', icon: 'list', url: '/home/listar-curso' }
        ];
      case 3: // Empleado
        return [
          { label: 'Inicio', icon: 'home', url: '/home' },
          { label: 'Mis cursos', icon: 'school', url: '/home/mis-cursos' }
        ];
      default:
        return [{ label: 'Inicio', icon: 'home', url: '/home' }];
    }
  }
}