import { Routes } from '@angular/router';
import { RegistrarEmpleadoComponent } from './admin_empleado/registrar-empleado/registrar-empleado.component';
import { BuscarEmpleadoComponent } from './admin_empleado/buscar-empleado/buscar-empleado.component';
import { ListarEmpleadoComponent } from './admin_empleado/listar-empleado/listar-empleado.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { InicioComponent } from './inicio/inicio.component';
import { AgregarActividadesComponent } from './admin-curso/agregar-actividades/agregar-actividades.component';
import { AgregarCursosComponent } from './admin-curso/agregar-cursos/agregar-cursos.component';
import { BuscarEmpleadoCursoComponent } from './admin-curso/buscar-empleado-curso/buscar-empleado-curso.component';
import { VisualizarActividadesComponent } from './admin-curso/visualizar-actividades/visualizar-actividades.component';
import { VisualizarCursosComponent } from './admin-curso/visualizar-cursos/visualizar-cursos.component';
import { MisActividadesComponent } from './empleado/mis-actividades/mis-actividades.component';
import { MisCursosComponent } from './empleado/mis-cursos/mis-cursos.component';
import { AgregarCursoComponent } from './empleado/agregar-curso/agregar-curso.component';
import { VisualizarDatosComponent } from './empleado/visualizar-datos/visualizar-datos.component';
import { EditarDatosComponent } from './empleado/editar-datos/editar-datos.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: '', component: InicioComponent },
      { path: 'registrar-empleado', component: RegistrarEmpleadoComponent },
      { path: 'buscar-empleado', component: BuscarEmpleadoComponent },
      { path: 'listar-empleado', component: ListarEmpleadoComponent }, // Aquí está la ruta correcta
      //Seccion del admin de cursos
      {path: 'agregar-actividad', component: AgregarActividadesComponent},
      {path: 'agregar-curso', component: AgregarCursosComponent},
      {path: 'buscar-empleadoCA', component: BuscarEmpleadoCursoComponent},
      {path: 'visualizar-actividad', component: VisualizarActividadesComponent},
      {path: 'visualizar-curso', component: VisualizarCursosComponent},
      //Seccion del empleado
      {path: 'mis-actividades', component: MisActividadesComponent},
      {path: 'mis-cursos', component:MisCursosComponent},
      {path: 'agregar-cursos', component:AgregarCursoComponent},
      {path: 'visualizar-datos', component: VisualizarDatosComponent },
      {path: 'editar-datos', component: EditarDatosComponent }

    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
