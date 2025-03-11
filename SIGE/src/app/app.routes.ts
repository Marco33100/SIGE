import { Routes } from '@angular/router';
import { RegistrarEmpleadoComponent } from './admin_empleado/registrar-empleado/registrar-empleado.component';
import { BuscarEmpleadoComponent } from './admin_empleado/buscar-empleado/buscar-empleado.component';
import { ListarEmpleadoComponent } from './admin_empleado/listar-empleado/listar-empleado.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { InicioComponent } from './inicio/inicio.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: '', component: InicioComponent },
      { path: 'registrar-empleado', component: RegistrarEmpleadoComponent },
      { path: 'buscar-empleado', component: BuscarEmpleadoComponent },
      { path: 'listar-empleado', component: ListarEmpleadoComponent } // Aquí está la ruta correcta
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
