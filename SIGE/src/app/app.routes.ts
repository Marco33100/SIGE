import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { InicioComponent } from './inicio/inicio.component';

export const routes: Routes = [
    {
        path: 'login', 
        component: LoginComponent,
        children:[
            {
                path: '', component: LoginComponent
            },
        ],
    },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            { path: '', component: InicioComponent },
        ],
    },
    {path:'inicio', component: InicioComponent},
    { path: '', redirectTo: '/login', pathMatch: 'full' },
];
