import { Routes } from '@angular/router';
import { Home } from './home/home.component';
import { CrearCuestionario } from './crear-cuestionario/crear-cuestionario';
import { CrearCuestionarioForm } from './crear-cuestionario-form/crear-cuestionario-form';
import { Registro } from './registro/registro';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'crear-cuestionario', component: CrearCuestionario },
  { path: 'crear-cuestionario-form', component: CrearCuestionarioForm },
  { path: 'registro', component: Registro },
  { path: 'login', component: Login }
];
